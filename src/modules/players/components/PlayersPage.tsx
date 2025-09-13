'use client'

import { useState, useEffect, useMemo } from 'react'
import { Player, PlayerFilters } from '../types/player'
import { PlayersHeader } from './PlayersHeader'
import { PlayerGrid, PlayerGridSkeleton } from './PlayerGrid'
import { PlayerDetailDrawer } from './PlayerDetailDrawer'

interface PlayersPageProps {
  tenantId: string
}

export function PlayersPage({ tenantId }: PlayersPageProps) {
  const [players, setPlayers] = useState<Player[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState<PlayerFilters>({})
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch players data
  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true)
        setError(null)

        // For now, we'll use the test data from our API
        const response = await fetch('/api/test-crud?action=players&tenantId=' + tenantId)
        const result = await response.json()

        if (result.success) {
          setPlayers(result.data || [])
        } else {
          setError('Failed to load players')
        }
      } catch (err) {
        console.error('Error fetching players:', err)
        setError('Failed to load players')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [tenantId, filters])

  // Filter and search players
  const filteredPlayers = useMemo(() => {
    let filtered = [...players]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(player =>
        player.firstName?.toLowerCase().includes(searchLower) ||
        player.lastName?.toLowerCase().includes(searchLower) ||
        player.club?.toLowerCase().includes(searchLower) ||
        player.position?.toLowerCase().includes(searchLower) ||
        player.nationality?.toLowerCase().includes(searchLower)
      )
    }

    // Position filter
    if (filters.position) {
      filtered = filtered.filter(player => player.position === filters.position)
    }

    // Nationality filter
    if (filters.nationality) {
      filtered = filtered.filter(player => player.nationality === filters.nationality)
    }

    // Age filters
    if (filters.ageMin || filters.ageMax) {
      filtered = filtered.filter(player => {
        if (!player.dateOfBirth) return false

        const age = Math.floor(
          (new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365)
        )

        if (filters.ageMin && age < filters.ageMin) return false
        if (filters.ageMax && age > filters.ageMax) return false

        return true
      })
    }

    // Rating filters
    if (filters.ratingMin && filters.ratingMax) {
      filtered = filtered.filter(player => {
        if (!player.rating) return false
        return player.rating >= filters.ratingMin! && player.rating <= filters.ratingMax!
      })
    } else if (filters.ratingMin) {
      filtered = filtered.filter(player => {
        if (!player.rating) return false
        return player.rating >= filters.ratingMin!
      })
    } else if (filters.ratingMax) {
      filtered = filtered.filter(player => {
        if (!player.rating) return false
        return player.rating <= filters.ratingMax!
      })
    }

    // Market value filters
    if (filters.marketValueMin && filters.marketValueMax) {
      filtered = filtered.filter(player => {
        if (!player.marketValue) return false
        return player.marketValue >= filters.marketValueMin! && player.marketValue <= filters.marketValueMax!
      })
    } else if (filters.marketValueMin) {
      filtered = filtered.filter(player => {
        if (!player.marketValue) return false
        return player.marketValue >= filters.marketValueMin!
      })
    } else if (filters.marketValueMax) {
      filtered = filtered.filter(player => {
        if (!player.marketValue) return false
        return player.marketValue <= filters.marketValueMax!
      })
    }

    return filtered
  }, [players, filters])

  const handleFiltersChange = (newFilters: PlayerFilters) => {
    setFilters(newFilters)
  }

  const handlePlayerSelect = (player: Player) => {
    setSelectedPlayer(player)
  }

  const handleDrawerClose = () => {
    setSelectedPlayer(null)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#FAF8F3] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4 mx-auto">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#3E2723] mb-2">Something went wrong</h2>
          <p className="text-[#3E2723]/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#D4AF37] text-white rounded-lg hover:bg-[#D4AF37]/90 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAF8F3]">
      {/* Header */}
      <PlayersHeader
        filters={filters}
        onFiltersChange={handleFiltersChange}
        totalPlayers={filteredPlayers.length}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {/* Main Content */}
      <div className="p-6">
        {loading ? (
          <PlayerGridSkeleton />
        ) : (
          <PlayerGrid
            players={filteredPlayers}
            loading={loading}
            onPlayerSelect={handlePlayerSelect}
            viewMode={viewMode}
          />
        )}
      </div>

      {/* Detail Drawer */}
      <PlayerDetailDrawer
        player={selectedPlayer}
        isOpen={!!selectedPlayer}
        onClose={handleDrawerClose}
      />
    </div>
  )
}

// Export individual components for flexibility
export {
  PlayersHeader,
  PlayerGrid,
  PlayerCard,
  PlayerDetailDrawer
} from './index'