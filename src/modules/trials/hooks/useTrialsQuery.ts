import { useQuery } from '@tanstack/react-query'
import { Trial, TrialFilters } from '../types/trial'

interface TrialsResponse {
  success: boolean
  data: Trial[]
}

// Mock trials for demo/fallback
const getMockTrials = (): Trial[] => [
  {
    id: 'trial-1',
    tenantId: 'tenant-test-1',
    playerId: 'mock-1',
    requestId: null,
    scheduledAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    location: 'Gamla Ullevi, Göteborg',
    status: 'SCHEDULED',
    notes: 'Första provträning. Fokus på teknisk förmåga och fotarbete.',
    rating: null,
    feedback: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    player: {
      id: 'mock-1',
      firstName: 'Marcus',
      lastName: 'Lindberg',
      positions: ['CAM', 'LW'],
      club: 'IFK Göteborg'
    }
  },
  {
    id: 'trial-2',
    tenantId: 'tenant-test-1',
    playerId: 'mock-2',
    requestId: null,
    scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
    location: 'Bravida Arena, Göteborg',
    status: 'SCHEDULED',
    notes: 'Andra provträning efter starkt första intryck.',
    rating: null,
    feedback: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    player: {
      id: 'mock-2',
      firstName: 'Erik',
      lastName: 'Johansson',
      positions: ['CB', 'DMF'],
      club: 'Free Agent'
    }
  },
  {
    id: 'trial-3',
    tenantId: 'tenant-test-1',
    playerId: 'mock-1',
    requestId: null,
    scheduledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
    location: 'Gamla Ullevi, Göteborg',
    status: 'COMPLETED',
    notes: 'Avslutad trial med mycket positiva intryck.',
    rating: 8.5,
    feedback: 'Exceptionell teknisk förmåga och stark spelförståelse. Visade stor potential under hela sessionen. Rekommenderar starkt för fortsatt utveckling.',
    createdAt: new Date(),
    updatedAt: new Date(),
    player: {
      id: 'mock-1',
      firstName: 'Marcus',
      lastName: 'Lindberg',
      positions: ['CAM', 'LW'],
      club: 'IFK Göteborg'
    }
  }
]

const buildQueryString = (tenantId: string, filters?: TrialFilters): string => {
  const params = new URLSearchParams({ tenantId })

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

const fetchTrials = async (tenantId: string, filters?: TrialFilters): Promise<Trial[]> => {
  try {
    const queryString = buildQueryString(tenantId, filters)
    const response = await fetch(`/api/trials?${queryString}`)
    const result = await response.json()

    if (!result.success) {
      console.warn('API returned error:', result.error)
      return getMockTrials()
    }

    // If no trials exist, return mock data for demo
    if (!result.data || result.data.length === 0) {
      return getMockTrials()
    }

    return result.data
  } catch (err) {
    console.error('Error fetching trials:', err)
    return getMockTrials()
  }
}

export function useTrialsQuery(tenantId: string, filters?: TrialFilters) {
  return useQuery({
    queryKey: ['trials', tenantId, filters],
    queryFn: () => fetchTrials(tenantId, filters),
    staleTime: 2 * 60 * 1000, // 2 minutes (shorter than players since trials change more frequently)
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}

// Hook for fetching a single trial
export function useTrialQuery(trialId: string, tenantId: string) {
  return useQuery({
    queryKey: ['trial', trialId, tenantId],
    queryFn: async () => {
      const response = await fetch(`/api/trials/${trialId}?tenantId=${tenantId}`)
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
    enabled: !!trialId && !!tenantId
  })
}