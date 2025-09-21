import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { resolveTenantId } from '@/server/tenant'
import { Logger, createLogContext } from '@/lib/logger'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Generate signed upload URL for player avatar
export async function POST(request: NextRequest) {
  const timer = Logger.timer()
  const baseContext = createLogContext(request)
  let tenantSlug: string | null = null
  let userId: string | undefined

  try {
    const { tenantId, playerId, fileName, fileType } = await request.json()

    // Use new tenant resolution system
    const tenantResolution = await resolveTenantId(request)
    userId = tenantResolution.userId || 'anonymous'
    tenantSlug = tenantResolution.tenantSlug

    Logger.info('Avatar upload URL request started', {
      ...baseContext,
      status: 200,
      details: { tenantSlug, playerId, fileName, fileType }
    })

    // Validate required fields
    if (!tenantId || !playerId || !fileName || !fileType) {
      const duration = timer.end()
      Logger.warn('Missing required fields for upload', {
        ...baseContext,
        status: 400,
        duration,
        details: { tenantId: !!tenantId, playerId: !!playerId, fileName: !!fileName, fileType: !!fileType }
      })
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, playerId, fileName, fileType' },
        { status: 400 }
      )
    }

    // 🛡️ ENTERPRISE SECURITY: Validate tenant access
    if (!tenantResolution.success) {
      const duration = timer.end()
      Logger.security('Upload URL tenant access denied', {
        ...baseContext,
        tenant: tenantSlug || 'unknown',
        userId,
        status: 401,
        duration,
        details: { error: tenantResolution.error, playerId }
      })
      return NextResponse.json(
        { error: tenantResolution.error || 'Tenant access denied' },
        { status: 401 }
      )
    }

    // Verify tenantId matches resolved tenant
    if (tenantResolution.tenantId !== tenantId) {
      const duration = timer.end()
      Logger.security('Upload URL tenant ID mismatch', {
        ...baseContext,
        tenant: tenantSlug || 'unknown',
        userId,
        status: 403,
        duration,
        details: { providedTenantId: tenantId, validatedTenantId: tenantResolution.tenantId }
      })
      return NextResponse.json(
        { error: 'Tenant validation failed' },
        { status: 403 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      const duration = timer.end()
      Logger.warn('Invalid file type for upload', {
        ...baseContext,
        tenant: tenantSlug || 'unknown',
        userId,
        status: 400,
        duration,
        details: { fileType, allowedTypes }
      })
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const uuid = Math.random().toString(36).substring(2, 15)
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `${tenantId}/${playerId}/${timestamp}-${uuid}.${extension}`

    // Generate signed upload URL
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('player-avatars')
      .createSignedUploadUrl(storagePath)

    if (uploadError) {
      const duration = timer.end()
      Logger.error('Supabase upload URL generation failed', {
        ...baseContext,
        tenant: tenantSlug || 'unknown',
        userId,
        status: 500,
        duration,
        error: uploadError.message,
        details: { storagePath, playerId }
      })
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    const duration = timer.end()
    Logger.success('Upload URL generated successfully', {
      ...baseContext,
      tenant: tenantSlug || 'unknown',
      userId,
      status: 200,
      duration,
      details: { storagePath, playerId, expiresIn: '1 hour' }
    })

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      path: storagePath,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
    })

  } catch (error) {
    const duration = timer.end()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    Logger.error('Upload URL generation error', {
      ...baseContext,
      tenant: tenantSlug || 'unknown',
      userId: userId || 'anonymous',
      status: 500,
      duration,
      error: errorMessage
    })

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}