import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 100 // 100 requests per minute per IP (increased for normal use)
const API_RATE_LIMIT = 50 // 50 API requests per minute per IP
const AUTH_RATE_LIMIT = 10 // 10 auth requests per minute per IP

function getRateLimitKey(request: NextRequest): string {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const pathname = request.nextUrl.pathname

  // For PDF generation, include tenant from path
  if (pathname.includes('/api/generate-player-pdf')) {
    const tenantFromPath = request.nextUrl.searchParams.get('tenant') || 'default'
    return `${ip}:${tenantFromPath}:pdf`
  }

  return `${ip}:${pathname}`
}

function isRateLimited(key: string): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)

  if (!record) {
    rateLimitMap.set(key, { count: 1, timestamp: now })
    return false
  }

  // Reset if window has passed
  if (now - record.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(key, { count: 1, timestamp: now })
    return false
  }

  // Increment count
  record.count++

  return record.count > MAX_REQUESTS_PER_WINDOW
}

function cleanupRateLimitMap() {
  const now = Date.now()
  const entries = Array.from(rateLimitMap.entries())
  for (const [key, record] of entries) {
    if (now - record.timestamp > RATE_LIMIT_WINDOW) {
      rateLimitMap.delete(key)
    }
  }
}

export async function middleware(request: NextRequest) {
  try {
    let response = NextResponse.next({
      request: {
        headers: request.headers,
      },
    })

    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance
      cleanupRateLimitMap()
    }

    // Apply rate limiting to PDF generation endpoint
    if (request.nextUrl.pathname === '/api/generate-player-pdf') {
      const key = getRateLimitKey(request)

      if (isRateLimited(key)) {
        return NextResponse.json(
          { error: 'Rate limit exceeded. Please try again later.' },
          { status: 429 }
        )
      }
    }

    // Skip auth check if environment variables are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables missing, skipping auth check')
      return response
    }

    // Create Supabase client for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({ name, value })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '' })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set(name, '', options)
          },
        },
      }
    )

    // Refresh session if expired - required for Server Components
    const { data: { user } } = await supabase.auth.getUser()
    const { pathname } = request.nextUrl

    // Log API requests for debugging
    if (pathname.startsWith('/api/')) {
      console.log('🔍 Middleware: API request to:', pathname, 'User:', user ? user.id : 'null')
    }

  // Public routes that don't require authentication
  const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/']
  const isPublicRoute = publicRoutes.includes(pathname)

  // API routes that don't require authentication
  const publicApiRoutes = ['/api/hello', '/api/test-db', '/api/health', '/api/setup-rls-auth', '/api/setup-test-auth', '/api/setup-user-data', '/api/setup-elite-sports', '/api/dashboard/stats', '/api/players', '/api/requests', '/api/trials']
  const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

  // Allow all API routes if user exists OR if it's a public API route
  if (pathname.startsWith('/api/')) {
    if (user || isPublicApiRoute) {
      // Allow the request to proceed
      return response
    } else {
      console.warn('🚫 Middleware: Blocking unauthenticated API request to:', pathname)
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      )
    }
  }

  // If user is not authenticated and trying to access protected route
  if (!user && !isPublicRoute) {

    // Redirect to login page with return URL
    const redirectUrl = new URL('/login', request.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (user && isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // For tenant routes, validate tenant access
  const tenantRouteMatch = pathname.match(/^\/([^\/]+)\/(dashboard|players|requests|trials|calendar)/)
  if (user && tenantRouteMatch) {
    const [, tenantSlug] = tenantRouteMatch

    try {
      // Check if user has access to this tenant
      const { data: membership } = await supabase
        .from('tenant_memberships')
        .select(`
          role,
          tenant:tenants!inner (
            id,
            slug
          )
        `)
        .eq('userId', user.id)
        .eq('tenant.slug', tenantSlug)
        .single()

      if (!membership) {
        // User doesn't have access to this tenant - redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    } catch (error) {
      console.error('Error checking tenant access:', error)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
  }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a simple response on error, don't block the request
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}