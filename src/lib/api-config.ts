/**
 * 🌐 Enterprise API Configuration
 *
 * Centralized API base URL management for environment-specific routing
 * - Development: localhost:3005
 * - Production/Preview: current origin (same-origin)
 */

/**
 * Get the appropriate base URL for API calls
 * @returns Base URL for API endpoints
 */
export function getApiBaseUrl(): string {
  // Server-side rendering: always use relative paths
  if (typeof window === 'undefined') {
    return ''
  }

  // Client-side: environment-specific URLs
  const isDev = process.env.NODE_ENV === 'development'

  if (isDev) {
    // Development: use localhost with correct port
    return 'http://localhost:3005'
  }

  // Production/Preview: use current origin (same-origin requests)
  return window.location.origin
}

/**
 * Create full API URL for a given endpoint
 * @param endpoint - API endpoint path (e.g., '/api/players')
 * @returns Full URL for the API call
 */
export function createApiUrl(endpoint: string): string {
  const baseUrl = getApiBaseUrl()

  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`

  return `${baseUrl}${normalizedEndpoint}`
}

/**
 * Enhanced fetch wrapper with automatic URL resolution
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Fetch promise
 */
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const url = createApiUrl(endpoint)

  // Default headers for API calls
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers
  }

  return fetch(url, {
    ...options,
    headers: defaultHeaders
  })
}

/**
 * Environment info for debugging
 */
export function getApiEnvironmentInfo() {
  return {
    baseUrl: getApiBaseUrl(),
    environment: process.env.NODE_ENV,
    isClient: typeof window !== 'undefined',
    origin: typeof window !== 'undefined' ? window.location.origin : 'SSR'
  }
}