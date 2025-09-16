import { useQuery } from '@tanstack/react-query'
import { Player } from '../types/player'

interface PlayersResponse {
  success: boolean
  data: Player[]
}

// Mock players for demo/fallback - moved from PlayersPage
const getMockPlayers = (): Player[] => [
  {
    id: 'mock-1',
    firstName: 'Marcus',
    lastName: 'Lindberg',
    dateOfBirth: new Date('1995-03-15'),
    nationality: 'Sweden',
    positions: ['CAM', 'LW'],
    club: 'IFK Göteborg',
    height: 178,
    weight: 72,
    rating: 8.2,
    notes: 'Mycket teknisk spelare med exceptionella avslut. Mycket farlig i en-mot-en-situationer. Har en god näsa för mål.',
    tags: ['Technical', 'Clinical Finisher'],
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    goalsThisSeason: 12,
    assistsThisSeason: 8,
    appearances: 22,
    minutesPlayed: 1890,
    marketValue: 2500000,
    contractExpiry: new Date('2025-06-30'),
    tenantId: 'tenant-test-1',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'mock-2',
    firstName: 'Erik',
    lastName: 'Johansson',
    dateOfBirth: new Date('1998-08-22'),
    nationality: 'Sweden',
    positions: ['CB', 'DMF'],
    club: 'Free Agent',
    height: 185,
    weight: 78,
    rating: 7.8,
    notes: 'Stark i luften och bra med bollen vid fötterna. Kan spela både som mittback och defensiv mittfältare.',
    tags: ['Versatile', 'Good in Air'],
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    goalsThisSeason: 3,
    assistsThisSeason: 2,
    appearances: 18,
    minutesPlayed: 1620,
    marketValue: 1800000,
    tenantId: 'tenant-test-1',
    createdAt: new Date(),
    updatedAt: new Date()
  }
]

const fetchPlayers = async (tenantId: string): Promise<Player[]> => {
  try {
    console.log('🚀 Fetching players for tenant:', tenantId)

    // Try to get players using the new SQL-based API
    let response = await fetch('/api/players-sql?tenantId=' + tenantId)
    let result: PlayersResponse = await response.json()

    console.log('📊 SQL API Response:', result)

    // If no players found, try with our test tenant
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('🔄 No players found, trying test tenant...')
      response = await fetch('/api/players-sql?tenantId=tenant-test-1')
      result = await response.json()
      console.log('📊 Test tenant response:', result)
    }

    // Still no data? Use mock data to show the UI
    if (!result.success || !result.data || result.data.length === 0) {
      console.log('📝 No data from API, using mock players')
      return getMockPlayers()
    }

    console.log('✅ Setting players:', result.data.length, 'players found')
    return result.data
  } catch (err) {
    console.error('❌ Error fetching players:', err)
    console.log('📝 Error occurred, using mock players')
    return getMockPlayers()
  }
}

export function usePlayersQuery(tenantId: string) {
  return useQuery({
    queryKey: ['players', tenantId],
    queryFn: () => fetchPlayers(tenantId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 1,
  })
}