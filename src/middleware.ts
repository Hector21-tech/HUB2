// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr'

// snabb dev-toggle: sätt CSRF_DISABLED=true i .env.local för att stänga av validering
const CSRF_COOKIE = 'csrf_token';
const DISABLED = process.env.CSRF_DISABLED === 'true';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const EXEMPT_PATHS = [
  '/_next', '/favicon.ico', '/api/health', '/api/webhooks', '/api/auth',
];

function isExempt(pathname: string) {
  return EXEMPT_PATHS.some((p) => pathname.startsWith(p));
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const res = NextResponse.next();

  // 1) Säkerställ CSRF-cookie (läsbar för klient, double-submit)
  if (!req.cookies.get(CSRF_COOKIE)) {
    // @ts-ignore - crypto global finns
    const token = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2));
    res.cookies.set(CSRF_COOKIE, token, {
      httpOnly: false, // måste vara läsbar i klienten
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });
  }

  // 2) Validera endast skrivande metoder och icke-exempt paths
  if (!DISABLED && !SAFE_METHODS.has(req.method) && !isExempt(pathname)) {
    const header = req.headers.get('x-csrf-token');
    const cookie = req.cookies.get(CSRF_COOKIE)?.value;
    if (!header || !cookie || header !== cookie) {
      return NextResponse.json({ error: 'CSRF token validation failed' }, { status: 403 });
    }
  }

  // 3) Supabase auth handling for tenant routes
  try {
    // Skip auth check if environment variables are missing
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.warn('Supabase environment variables missing, skipping auth check')
      return res
    }

    // Create Supabase client for authentication
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            // Update request cookies for downstream middleware
            req.cookies.set({ name, value })
            // Update response cookies for client
            res.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            req.cookies.set({ name, value: '' })
            res.cookies.set(name, '', options)
          },
        },
      }
    )

    // Public routes that don't require authentication
    const publicRoutes = ['/login', '/signup', '/forgot-password', '/reset-password', '/']
    const isPublicRoute = publicRoutes.includes(pathname)

    // API routes that don't require authentication (production-safe only)
    const publicApiRoutes = ['/api/health', '/api/dashboard/stats']
    const isPublicApiRoute = publicApiRoutes.some(route => pathname.startsWith(route))

    // For API routes, we'll handle auth in individual route handlers for better control
    if (pathname.startsWith('/api/')) {
      return res
    }

    // For page routes, check authentication
    if (!isPublicRoute) {
      // This will be handled by individual page components
      // We keep the middleware simple and focused on CSRF
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // Return a simple response on error, don't block the request
    return res
  }
}

// Kör middleware på allt utom statiska assets som Next hanterar separat.
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};