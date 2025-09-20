'use client'

import { useQuery } from '@tanstack/react-query'

export interface DashboardStats {
  overview: {
    totalPlayers: number
    totalRequests: number
    totalTrials: number
    successRate: number
  }
  players: {
    total: number
    thisMonth: number
    growth: number
    byPosition: Record<string, number>
    recent: Array<{
      id: string
      firstName: string
      lastName: string
      position: string | null
      club: string | null
      rating: number | null
      createdAt: string
    }>
  }
  requests: {
    total: number
    active: number
    byStatus: Record<string, number>
    byCountry: Record<string, number>
    recent: Array<{
      id: string
      title: string
      club: string
      country: string | null
      status: string
      priority: string
      createdAt: string
    }>
  }
  trials: {
    total: number
    upcoming: number
    completed: number
    pendingEvaluations: number
    next7Days: number
    successRate: number
    recent: Array<{
      id: string
      scheduledAt: string
      location: string | null
      status: string
      rating: number | null
      createdAt: string
      player: {
        firstName: string
        lastName: string
        position: string | null
      } | null
    }>
  }
  transferWindows: {
    active: number
    upcoming: number
    expiring: number
  }
  alerts: Array<{
    type: 'info' | 'warning' | 'error'
    message: string
  }>
  lastUpdated: string
}

async function fetchDashboardStats(tenantId: string): Promise<DashboardStats> {
  const response = await fetch(`/api/dashboard/stats?tenantId=${tenantId}`)

  if (!response.ok) {
    throw new Error('Failed to fetch dashboard stats')
  }

  const result = await response.json()
  if (!result.success) {
    throw new Error(result.error || 'Failed to fetch dashboard stats')
  }

  return result.data
}

export function useDashboardStats(tenantId: string) {
  return useQuery({
    queryKey: ['dashboard-stats', tenantId],
    queryFn: () => fetchDashboardStats(tenantId),
    refetchInterval: 30000, // Refetch every 30 seconds for real-time updates
    staleTime: 20000, // Consider data stale after 20 seconds
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    enabled: !!tenantId
  })
}

// Helper hook for specific dashboard sections
export function useDashboardSection(tenantId: string, section: keyof DashboardStats) {
  const { data, ...rest } = useDashboardStats(tenantId)
  return {
    data: data?.[section],
    ...rest
  }
}

// Hook for alerts specifically
export function useDashboardAlerts(tenantId: string) {
  const { data, ...rest } = useDashboardStats(tenantId)
  return {
    alerts: data?.alerts || [],
    hasAlerts: (data?.alerts?.length || 0) > 0,
    ...rest
  }
}