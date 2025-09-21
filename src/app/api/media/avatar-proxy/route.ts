import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { validateSupabaseTenantAccess } from '@/lib/supabase/tenant-validation'
import { Logger, createLogContext, generateRequestId } from '@/lib/logger'
import { applyRateLimit, createRateLimitResponse } from '@/lib/security/rate-limiting'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Cache for signed URLs to avoid repeated Supabase calls
const signedUrlCache = new Map<string, {
  url: string
  etag: string
  expiresAt: number
}>()

// Helper to generate ETag based on path and modification
function generateETag(path: string, lastModified?: string): string {
  const hash = Buffer.from(`${path}:${lastModified || Date.now()}`).toString('base64')
  return `"${hash.substring(0, 16)}"`
}

// Helper to clean sensitive data from path for logging
function hashPath(path: string): string {
  return Buffer.from(path).toString('base64').substring(0, 8)
}

/**
 * Avatar Proxy - Streams Supabase Storage images with CORS support
 *
 * Features:
 * - Tenant isolation with membership validation
 * - Binary streaming with proper Content-Type
 * - ETag support for 304 Not Modified responses
 * - Automatic signed URL re-generation
 * - Rate limiting and structured logging
 * - CORS headers for web/mobile compatibility
 */
export async function GET(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = Logger.timer()

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tenantId = searchParams.get('tenantId')
    const ifNoneMatch = request.headers.get('if-none-match')

    // 🛡️ SECURITY: Validate required parameters
    if (!path || !tenantId) {
      const context = createLogContext(request, tenantId || undefined, undefined, requestId)
      Logger.warn('Avatar proxy: Missing required parameters', {
        ...context,
        status: 400,
        details: { hasPath: !!path, hasTenantId: !!tenantId }
      })

      return NextResponse.json(
        { error: 'Missing required parameters: path, tenantId' },
        { status: 400 }
      )
    }

    // 🛡️ SECURITY: Validate path belongs to tenant (prevent path traversal)
    if (!path.startsWith(`${tenantId}/`)) {
      const context = createLogContext(request, tenantId || undefined, undefined, requestId)
      Logger.security('Avatar proxy: Path traversal attempt', {
        ...context,
        status: 403,
        details: {
          pathHash: hashPath(path),
          expectedPrefix: `${tenantId}/`
        }
      })

      return new NextResponse('Forbidden', { status: 403 })
    }

    // 🛡️ SECURITY: Validate user has access to tenant
    const tenantValidation = await validateSupabaseTenantAccess(tenantId)
    if (!tenantValidation.success) {
      const context = createLogContext(request, tenantId || undefined, undefined, requestId)
      Logger.security('Avatar proxy: Tenant access denied', {
        ...context,
        status: tenantValidation.httpStatus,
        details: {
          reason: tenantValidation.reason,
          pathHash: hashPath(path)
        }
      })

      return new NextResponse('Forbidden', { status: 403 })
    }

    const { userId } = tenantValidation

    // 🛡️ SECURITY: Apply rate limiting
    const rateLimitResult = applyRateLimit(request, 'upload', { tenantId, userId })
    if (rateLimitResult && !rateLimitResult.allowed) {
      return createRateLimitResponse(rateLimitResult, 'Avatar proxy rate limit exceeded')
    }

    // 🚀 PERFORMANCE: Check ETag cache first
    const cacheKey = `${tenantId}:${path}`
    const cached = signedUrlCache.get(cacheKey)

    if (cached && ifNoneMatch === cached.etag) {
      const context = createLogContext(request, tenantId, userId, requestId)
      Logger.info('Avatar proxy: ETag cache hit', {
        ...context,
        status: 304,
        duration: timer.end(),
        details: { pathHash: hashPath(path), cached: true }
      })

      return new NextResponse(null, {
        status: 304,
        headers: {
          'ETag': cached.etag,
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
          'Access-Control-Allow-Origin': '*',
          'Vary': 'Origin'
        }
      })
    }

    // 🔄 RESILIENCE: Get signed URL with automatic re-generation
    let signedUrl: string
    let etag: string

    if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
      // Use cached signed URL if valid (5 min buffer)
      signedUrl = cached.url
      etag = cached.etag
    } else {
      // Generate new signed URL (15 minute TTL)
      const { data, error } = await supabase.storage
        .from('player-avatars')
        .createSignedUrl(path, 15 * 60) // 15 minutes

      if (error) {
        const context = createLogContext(request, tenantId, userId, requestId)

        // 🎯 MASKING: Return 404 for missing files, don't expose internal errors
        if (error.message?.includes('Object not found') ||
            (error as any).statusCode === '404' ||
            (error as any).status === 404) {
          Logger.info('Avatar proxy: File not found', {
            ...context,
            status: 404,
            duration: timer.end(),
            details: { pathHash: hashPath(path) }
          })

          return new NextResponse('Not Found', { status: 404 })
        }

        Logger.error('Avatar proxy: Supabase signed URL error', {
          ...context,
          status: 502,
          duration: timer.end(),
          error: error.message,
          details: { pathHash: hashPath(path) }
        })

        return new NextResponse('Bad Gateway', { status: 502 })
      }

      signedUrl = data.signedUrl
      etag = generateETag(path)

      // Cache the signed URL
      signedUrlCache.set(cacheKey, {
        url: signedUrl,
        etag,
        expiresAt: Date.now() + 14 * 60 * 1000 // Cache for 14 min (1 min buffer)
      })
    }

    // 🔄 RESILIENCE: Fetch image from Supabase with timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    try {
      const imageResponse = await fetch(signedUrl, {
        signal: controller.signal
      })
      clearTimeout(timeoutId)

      if (!imageResponse.ok) {
        // 🔄 RESILIENCE: Handle expired signed URL
        if (imageResponse.status === 401 || imageResponse.status === 403) {
          // Remove from cache and retry once
          signedUrlCache.delete(cacheKey)

          const { data: retryData, error: retryError } = await supabase.storage
            .from('player-avatars')
            .createSignedUrl(path, 15 * 60)

          if (retryError || !retryData) {
            throw new Error(`Retry failed: ${retryError?.message}`)
          }

          const retryResponse = await fetch(retryData.signedUrl)
          if (!retryResponse.ok) {
            throw new Error(`Retry fetch failed: ${retryResponse.status}`)
          }

          // Update cache with new signed URL
          const newEtag = generateETag(path)
          signedUrlCache.set(cacheKey, {
            url: retryData.signedUrl,
            etag: newEtag,
            expiresAt: Date.now() + 14 * 60 * 1000
          })

          return await streamImageResponse(retryResponse, newEtag, request, tenantId, userId, requestId, timer, path)
        }

        throw new Error(`Upstream error: ${imageResponse.status}`)
      }

      return await streamImageResponse(imageResponse, etag, request, tenantId, userId, requestId, timer, path)

    } catch (fetchError) {
      clearTimeout(timeoutId)

      const context = createLogContext(request, tenantId, userId, requestId)
      Logger.error('Avatar proxy: Upstream fetch error', {
        ...context,
        status: 504,
        duration: timer.end(),
        error: fetchError instanceof Error ? fetchError.message : 'Unknown fetch error',
        details: { pathHash: hashPath(path) }
      })

      return new NextResponse('Gateway Timeout', { status: 504 })
    }

  } catch (error) {
    const { searchParams } = new URL(request.url)
    const fallbackTenantId = searchParams.get('tenantId')
    const context = createLogContext(request, fallbackTenantId || undefined, undefined, requestId)
    Logger.error('Avatar proxy: Internal server error', {
      ...context,
      status: 500,
      duration: timer.end(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

/**
 * Stream image response with proper headers
 */
async function streamImageResponse(
  imageResponse: Response,
  etag: string,
  request: NextRequest,
  tenantId: string,
  userId: string,
  requestId: string,
  timer: any,
  path: string
): Promise<NextResponse> {
  const contentType = imageResponse.headers.get('content-type') || 'application/octet-stream'
  const contentLength = imageResponse.headers.get('content-length')
  const lastModified = imageResponse.headers.get('last-modified')

  // 🚀 STREAMING: Stream binary response
  const body = imageResponse.body

  const headers = new Headers({
    'Content-Type': contentType,
    'ETag': etag,
    'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
    'Access-Control-Allow-Origin': '*',
    'Vary': 'Origin'
  })

  if (contentLength) headers.set('Content-Length', contentLength)
  if (lastModified) headers.set('Last-Modified', lastModified)

  const context = createLogContext(request, tenantId, userId, requestId)
  Logger.success('Avatar proxy: Image streamed successfully', {
    ...context,
    status: 200,
    duration: timer.end(),
    details: {
      pathHash: hashPath(path),
      contentType,
      contentLength: contentLength || 'unknown'
    }
  })

  return new NextResponse(body, {
    status: 200,
    headers
  })
}

/**
 * Handle HEAD requests for existence checks
 */
export async function HEAD(request: NextRequest) {
  const requestId = generateRequestId()
  const timer = Logger.timer()

  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tenantId = searchParams.get('tenantId')

    // Same validation as GET
    if (!path || !tenantId || !path.startsWith(`${tenantId}/`)) {
      return new NextResponse(null, { status: 400 })
    }

    // Validate tenant access
    const tenantValidation = await validateSupabaseTenantAccess(tenantId)
    if (!tenantValidation.success) {
      return new NextResponse(null, { status: 403 })
    }

    // Quick check if file exists in Supabase
    const { data, error } = await supabase.storage
      .from('player-avatars')
      .createSignedUrl(path, 60) // Short TTL for HEAD check

    if (error) {
      if (error.message?.includes('Object not found')) {
        return new NextResponse(null, { status: 404 })
      }
      return new NextResponse(null, { status: 502 })
    }

    const etag = generateETag(path)
    const context = createLogContext(request, tenantId, tenantValidation.userId, requestId)
    Logger.info('Avatar proxy: HEAD request successful', {
      ...context,
      status: 200,
      duration: timer.end(),
      details: { pathHash: hashPath(path), method: 'HEAD' }
    })

    return new NextResponse(null, {
      status: 200,
      headers: {
        'ETag': etag,
        'Cache-Control': 'public, max-age=60',
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'image/*'
      }
    })

  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

/**
 * Handle CORS preflight requests
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, If-None-Match',
      'Access-Control-Max-Age': '86400' // 24 hours
    }
  })
}