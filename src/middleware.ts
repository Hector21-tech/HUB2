import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting
const rateLimitMap = new Map<string, { count: number; timestamp: number }>()

// Rate limit configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10 // 10 requests per minute per IP/tenant

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

export function middleware(request: NextRequest) {
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

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/api/generate-player-pdf'
  ]
}