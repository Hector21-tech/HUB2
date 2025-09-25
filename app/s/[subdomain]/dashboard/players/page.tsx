'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { PlayersList } from '@/src/modules/players/components/PlayersList'
import { AddPlayerModal } from '@/src/modules/players/components/AddPlayerModal'
import type { Player } from '@/src/modules/players/types'

export default function PlayersPage() {
  const params = useParams()
  const subdomain = params?.subdomain as string
  const [players, setPlayers] = useState<Player[]>([])
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      // TODO: Replace with actual API call when available
      // For now, using mock data
      setPlayers([])
    } catch (error) {
      console.error('Error fetching players:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlayer = async (playerData: Omit<Player, 'id' | 'tenantId'>) => {
    try {
      // TODO: Replace with actual API call
      const newPlayer: Player = {
        id: `temp-${Date.now()}`,
        tenantId: 'temp-tenant-id',
        ...playerData
      }
      setPlayers(prev => [newPlayer, ...prev])
      setIsAddModalOpen(false)
    } catch (error) {
      console.error('Error adding player:', error)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-white">Loading players...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Players</h1>
          <p className="text-slate-300">Manage your player database</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          Add Player
        </button>
      </div>

      <PlayersList players={players} />

      <AddPlayerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddPlayer}
      />
    </div>
  )
}