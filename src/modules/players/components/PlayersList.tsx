'use client'

import type { Player } from '../types/player'

interface PlayersListProps {
  players: Player[]
}

export function PlayersList({ players }: PlayersListProps) {
  if (players.length === 0) {
    return (
      <div className="text-center py-12 bg-white/5 backdrop-blur-sm border border-white/20 rounded-xl">
        <div className="text-6xl mb-4">⚽</div>
        <h3 className="text-xl font-semibold text-white mb-2">No players yet</h3>
        <p className="text-slate-300">Add your first player to get started</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {players.map((player) => (
        <div
          key={player.id}
          className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-6 hover:bg-white/15 transition-colors"
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
              {player.firstName[0]}{player.lastName[0]}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">
                {player.firstName} {player.lastName}
              </h3>
              <p className="text-slate-300 text-sm">{Array.isArray(player.positions) ? player.positions.join(', ') : player.positions}</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Club:</span>
              <span className="text-white">{player.club}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Nationality:</span>
              <span className="text-white">{player.nationality}</span>
            </div>
            {player.rating && (
              <div className="flex justify-between">
                <span className="text-slate-400">Rating:</span>
                <span className="text-white">{player.rating}/10</span>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}