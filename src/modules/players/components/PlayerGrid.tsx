'use client'

import { Player } from '../types/player'
import { PlayerCard } from './PlayerCard'
import { Loader2 } from 'lucide-react'

interface PlayerGridProps {
  players: Player[]
  loading?: boolean
  onPlayerSelect: (player: Player) => void
  viewMode: 'grid' | 'list'
}

export function PlayerGrid({ players, loading, onPlayerSelect, viewMode }: PlayerGridProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-blue-400 mb-4" />
        <p className="text-white/60 text-sm">Loading players...</p>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-400/10 to-blue-400/5 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-2 border-blue-400/30 border-dashed rounded-full"></div>
        </div>
        <h3 className="text-lg font-medium text-white/90 mb-2">No players found</h3>
        <p className="text-white/60 text-sm max-w-md">
          Try adjusting your search criteria or filters to find players, or add new players to your database.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-white/10 backdrop-blur-md border-b border-white/20 text-sm font-medium text-white/60">
          <div className="col-span-3">Player</div>
          <div className="col-span-2">Position</div>
          <div className="col-span-2">Club</div>
          <div className="col-span-1">Age</div>
          <div className="col-span-1">Rating</div>
          <div className="col-span-1">Goals</div>
          <div className="col-span-1">Assists</div>
          <div className="col-span-1">Value</div>
        </div>

        {/* List Items */}
        <div className="divide-y divide-white/20">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-[blue-400]/5 cursor-pointer transition-colors duration-200"
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[blue-400]/10 to-[blue-400]/5 flex items-center justify-center">
                  <span className="text-sm font-medium text-[blue-400]">
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-white/90">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-xs text-white/60">{player.nationality}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-white/90">{player.position || 'N/A'}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-white/90 truncate">{player.club || 'Free Agent'}</span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm text-white/90">
                  {player.dateOfBirth ?
                    Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                {player.rating ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[blue-400]/10 text-[blue-400]">
                    {player.rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sm text-white/50">N/A</span>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-white/90">
                  {player.goalsThisSeason || 0}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-white/90">
                  {player.assistsThisSeason || 0}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-[blue-400]">
                  {player.marketValue ?
                    player.marketValue >= 1000000 ?
                      `€${(player.marketValue / 1000000).toFixed(1)}M` :
                      player.marketValue >= 1000 ?
                        `€${(player.marketValue / 1000).toFixed(0)}K` :
                        `€${player.marketValue}`
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={`
      grid gap-6
      grid-cols-1
      md:grid-cols-3
      lg:grid-cols-4
      xl:grid-cols-5
      2xl:grid-cols-5
    `}>
      {players.map((player) => (
        <PlayerCard
          key={player.id}
          player={player}
          onCardClick={onPlayerSelect}
        />
      ))}
    </div>
  )
}

// Loading Skeleton Component
export function PlayerGridSkeleton({ count = 9 }: { count?: number }) {
  return (
    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 2xl:grid-cols-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={index}
          className="bg-white/10 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-6"
        >
          {/* Avatar Skeleton */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-white/20 animate-pulse"></div>
          </div>

          {/* Name Skeleton */}
          <div className="text-center mb-3">
            <div className="h-6 bg-white/20 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-white/20 rounded animate-pulse w-24 mx-auto"></div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-white/20 rounded animate-pulse w-16"></div>
                <div className="h-4 bg-white/20 rounded animate-pulse w-12"></div>
              </div>
            ))}
          </div>

          {/* Stats Skeleton */}
          <div className="border-t border-white/30 pt-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-white/20 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-white/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}