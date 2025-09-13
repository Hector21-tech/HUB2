import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export const runtime = 'nodejs'

export async function middleware(request: NextRequest) {
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if required environment variables are available
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    return response
  }

  try {
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
            response.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: any) {
            request.cookies.set({ name, value: '', ...options, maxAge: 0 })
            response.cookies.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    const {
      data: { user },
    } = await supabase.auth.getUser()

    // Extract tenant from pathname
    const url = request.nextUrl.clone()
    const pathSegments = url.pathname.split('/').filter(Boolean)
    const tenant = pathSegments[0]

    // Public routes that don't require auth
    const publicRoutes = ['/', '/auth', '/api/auth']
    const isPublicRoute = publicRoutes.some(route => 
      url.pathname === route || url.pathname.startsWith(route + '/')
    )

    // If accessing tenant routes without auth, redirect to login
    if (!user && !isPublicRoute && tenant) {
      const redirectUrl = new URL(`/auth/login?tenant=${tenant}`, request.url)
      redirectUrl.searchParams.set('redirectTo', url.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // If authenticated but accessing root, redirect to their first tenant
    if (user && url.pathname === '/') {
      // TODO: Get user's first tenant from database
      // For now, redirect to demo tenant
      return NextResponse.redirect(new URL('/demo/dashboard', request.url))
    }

    return response
  } catch (error) {
    console.error('Middleware error:', error)
    return response
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}