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
        <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-4" />
        <p className="text-[#3E2723]/60 text-sm">Loading players...</p>
      </div>
    )
  }

  if (players.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 rounded-full flex items-center justify-center mb-4">
          <div className="w-8 h-8 border-2 border-[#D4AF37]/30 border-dashed rounded-full"></div>
        </div>
        <h3 className="text-lg font-medium text-[#3E2723] mb-2">No players found</h3>
        <p className="text-[#3E2723]/60 text-sm max-w-md">
          Try adjusting your search criteria or filters to find players, or add new players to your database.
        </p>
      </div>
    )
  }

  if (viewMode === 'list') {
    return (
      <div className="bg-white/70 rounded-xl border border-[#D7CCC8]/30 overflow-hidden">
        {/* List Header */}
        <div className="grid grid-cols-12 gap-4 p-4 bg-[#FAF8F3] border-b border-[#D7CCC8]/20 text-sm font-medium text-[#3E2723]/70">
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
        <div className="divide-y divide-[#D7CCC8]/20">
          {players.map((player) => (
            <div
              key={player.id}
              onClick={() => onPlayerSelect(player)}
              className="grid grid-cols-12 gap-4 p-4 hover:bg-[#D4AF37]/5 cursor-pointer transition-colors duration-200"
            >
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center">
                  <span className="text-sm font-medium text-[#D4AF37]">
                    {player.firstName?.[0]}{player.lastName?.[0]}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-[#3E2723]">
                    {player.firstName} {player.lastName}
                  </p>
                  <p className="text-xs text-[#3E2723]/60">{player.nationality}</p>
                </div>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-[#3E2723]">{player.position || 'N/A'}</span>
              </div>
              <div className="col-span-2 flex items-center">
                <span className="text-sm text-[#3E2723] truncate">{player.club || 'Free Agent'}</span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm text-[#3E2723]">
                  {player.dateOfBirth ?
                    Math.floor((new Date().getTime() - new Date(player.dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365))
                    : 'N/A'
                  }
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                {player.rating ? (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-[#D4AF37]/10 text-[#D4AF37]">
                    {player.rating.toFixed(1)}
                  </span>
                ) : (
                  <span className="text-sm text-[#3E2723]/50">N/A</span>
                )}
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-[#3E2723]">
                  {player.goalsThisSeason || 0}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-[#3E2723]">
                  {player.assistsThisSeason || 0}
                </span>
              </div>
              <div className="col-span-1 flex items-center">
                <span className="text-sm font-medium text-[#D4AF37]">
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
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-3
      2xl:grid-cols-4
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
          className="bg-gradient-to-br from-[#FFFFF0] to-[#F8F6F0] rounded-xl shadow-lg border border-[#D4AF37]/20 p-6"
        >
          {/* Avatar Skeleton */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-[#D7CCC8]/20 animate-pulse"></div>
          </div>

          {/* Name Skeleton */}
          <div className="text-center mb-3">
            <div className="h-6 bg-[#D7CCC8]/20 rounded animate-pulse mb-2"></div>
            <div className="h-4 bg-[#D7CCC8]/20 rounded animate-pulse w-24 mx-auto"></div>
          </div>

          {/* Details Skeleton */}
          <div className="space-y-2 mb-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex justify-between">
                <div className="h-4 bg-[#D7CCC8]/20 rounded animate-pulse w-16"></div>
                <div className="h-4 bg-[#D7CCC8]/20 rounded animate-pulse w-12"></div>
              </div>
            ))}
          </div>

          {/* Stats Skeleton */}
          <div className="border-t border-[#D7CCC8]/30 pt-4">
            <div className="grid grid-cols-3 gap-2 text-center">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i}>
                  <div className="h-6 bg-[#D7CCC8]/20 rounded animate-pulse mb-1"></div>
                  <div className="h-3 bg-[#D7CCC8]/20 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}