import { useQuery } from '@tanstack/react-query'
import { Trial, TrialFilters } from '../types/trial'

interface TrialsResponse {
  success: boolean
  data: Trial[]
}

// No mock trials - show empty state instead

const buildQueryString = (tenantSlug: string, filters?: TrialFilters): string => {
  const params = new URLSearchParams({ tenant: tenantSlug })

  if (filters?.status && filters.status.length > 0) {
    params.append('status', filters.status.join(','))
  }
  if (filters?.playerId) {
    params.append('playerId', filters.playerId)
  }
  if (filters?.requestId) {
    params.append('requestId', filters.requestId)
  }
  if (filters?.dateFrom) {
    params.append('dateFrom', filters.dateFrom.toISOString())
  }
  if (filters?.dateTo) {
    params.append('dateTo', filters.dateTo.toISOString())
  }
  if (filters?.search) {
    params.append('search', filters.search)
  }

  return params.toString()
}

const fetchTrials = async (tenantSlug: string, filters?: TrialFilters): Promise<Trial[]> => {
  try {
    const queryString = buildQueryString(tenantSlug, filters)
    const response = await fetch(`/api/trials?${queryString}`)
    const result = await response.json()

    if (!result.success) {
      console.warn('API returned error:', result.error)
      return []
    }

    // Return actual data or empty array
    return result.data || []
  } catch (err) {
    return []
  }
}

export function useTrialsQuery(tenantSlug: string, filters?: TrialFilters) {
  return useQuery({
    queryKey: ['trials', tenantSlug, filters],
    queryFn: () => fetchTrials(tenantSlug, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than players since trials change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// Hook for fetching a single trial
export function useTrialQuery(trialId: string, tenantSlug: string) {
  return useQuery({
    queryKey: ['trial', trialId, tenantSlug],
    queryFn: async () => {
      const response = await fetch(`/api/trials/${trialId}?tenant=${tenantSlug}`)
      const result = await response.json()

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch trial')
      }

      return result.data as Trial
    },
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 3 * 60 * 1000, // 3 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    enabled: !!trialId && !!tenantSlug
  })
}