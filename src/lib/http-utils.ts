import { NextResponse } from 'next/server'
import { TenantValidationError } from './supabase/tenant-validation'
import { addSecureCacheHeaders } from './security/cache-protection'

/**
 * Creates standardized HTTP responses with correct status codes
 * Enterprise-tight security semantics:
 * - 401: Not authenticated (session missing/invalid)
 * - 403: Authenticated but forbidden (not member/insufficient role)
 * - 404: Resource not found (masks existence for security)
 */

export function createErrorResponse(error: TenantValidationError) {
  const response = NextResponse.json(
    {
      success: false,
      error: error.message,
      meta: { reason: error.reason }
    },
    { status: error.httpStatus }
  )

  return addSecureCacheHeaders(response, {
    tenantDependent: true,
    userDependent: true,
    cacheable: false
  })
}

export function createStandardResponse(data: any, status: 200 | 201 = 200, message?: string) {
  const responseData: any = {
    success: true,
    data
  }

  if (message) {
    responseData.message = message
  }

  const response = NextResponse.json(responseData, { status })

  return addSecureCacheHeaders(response, {
    tenantDependent: true,
    userDependent: true,
    cacheable: false
  })
}

export function createResourceNotFoundResponse(resourceType: string, id: string) {
  // 404 to mask existence of cross-tenant resources (prevents enumeration)
  const response = NextResponse.json(
    {
      success: false,
      error: `${resourceType} not found`,
      meta: { reason: 'not_found' }
    },
    { status: 404 }
  )

  return addSecureCacheHeaders(response, {
    tenantDependent: true,
    userDependent: true,
    cacheable: false
  })
}

export function createServerErrorResponse(message: string = 'Internal server error') {
  const response = NextResponse.json(
    {
      success: false,
      error: message
    },
    { status: 500 }
  )

  return addSecureCacheHeaders(response, {
    tenantDependent: true,
    userDependent: true,
    cacheable: false
  })
}