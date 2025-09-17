import { useState, useEffect } from 'react'

interface UseAvatarUrlProps {
  avatarPath?: string
  avatarUrl?: string  // Legacy fallback
  tenantId: string
}

interface AvatarUrlData {
  url: string | null
  isLoading: boolean
  error: string | null
}

// Hook to get signed avatar URL from either new path or legacy URL
export function useAvatarUrl({ avatarPath, avatarUrl, tenantId }: UseAvatarUrlProps): AvatarUrlData {
  const [data, setData] = useState<AvatarUrlData>({
    url: null,
    isLoading: false,
    error: null
  })
  const [invalidationTrigger, setInvalidationTrigger] = useState(0)

  // Listen for cache invalidation events
  useEffect(() => {
    const cleanup = useCacheInvalidationTrigger(() => {
      setInvalidationTrigger(prev => prev + 1)
    })
    return cleanup
  }, [])

  useEffect(() => {
    // If we have legacy avatarUrl, use it directly
    if (avatarUrl && !avatarPath) {
      setData({
        url: avatarUrl,
        isLoading: false,
        error: null
      })
      return
    }

    // If no path, no avatar
    if (!avatarPath) {
      setData({
        url: null,
        isLoading: false,
        error: null
      })
      return
    }

    // Fetch signed URL for path using cached function
    const fetchSignedUrl = async () => {
      setData(prev => ({ ...prev, isLoading: true, error: null }))

      try {
        const url = await getCachedAvatarUrl(avatarPath, tenantId)

        setData({
          url,
          isLoading: false,
          error: null
        })
      } catch (error) {
        console.error('Error fetching avatar URL:', error)
        setData({
          url: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load avatar'
        })
      }
    }

    fetchSignedUrl()
  }, [avatarPath, avatarUrl, tenantId, invalidationTrigger])

  return data
}

// Utility to determine the best avatar URL to use
export function getBestAvatarUrl(player: { avatarPath?: string; avatarUrl?: string }): string | null {
  // Prefer new path over legacy URL
  if (player.avatarPath) {
    return null // Will be resolved by useAvatarUrl hook
  }

  // Fall back to legacy URL
  return player.avatarUrl || null
}

// Cache for signed URLs to avoid repeated requests
const urlCache = new Map<string, { url: string; expiresAt: number }>()

export async function getCachedAvatarUrl(avatarPath: string, tenantId: string): Promise<string | null> {
  const cacheKey = `${tenantId}:${avatarPath}`
  const cached = urlCache.get(cacheKey)

  // Return cached URL if still valid (with 5 min buffer)
  if (cached && cached.expiresAt > Date.now() + 5 * 60 * 1000) {
    return cached.url
  }

  try {
    const response = await fetch(`/api/media/avatar-url?path=${encodeURIComponent(avatarPath)}&tenantId=${tenantId}`)

    if (!response.ok) {
      throw new Error(`Failed to get avatar URL: ${response.status}`)
    }

    const result = await response.json()

    // Cache the URL (expires in 60 minutes, we cache for 55 to be safe)
    urlCache.set(cacheKey, {
      url: result.url,
      expiresAt: Date.now() + 55 * 60 * 1000
    })

    return result.url
  } catch (error) {
    console.error('Error fetching cached avatar URL:', error)
    return null
  }
}

// Cache invalidation functions
export function invalidateAvatarCache(avatarPath: string, tenantId: string) {
  const cacheKey = `${tenantId}:${avatarPath}`
  urlCache.delete(cacheKey)
}

export function invalidateAllAvatarCache() {
  urlCache.clear()
}

// Global cache invalidation trigger for React components
let cacheInvalidationKey = 0
const cacheInvalidationListeners = new Set<() => void>()

export function triggerAvatarCacheInvalidation() {
  cacheInvalidationKey++
  cacheInvalidationListeners.forEach(listener => listener())
}

export function useCacheInvalidationTrigger(callback: () => void): () => void {
  cacheInvalidationListeners.add(callback)
  return () => {
    cacheInvalidationListeners.delete(callback)
  }
}