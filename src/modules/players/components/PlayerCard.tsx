'use client'

import { useState } from 'react'
import { Player } from '../types/player'

interface PlayerCardProps {
  player: Player
  onCardClick: (player: Player) => void
}

export function PlayerCard({ player, onCardClick }: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const calculateAge = (dateOfBirth?: Date) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const formatMarketValue = (value?: number) => {
    if (!value) return 'N/A'
    if (value >= 1000000) return `€${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `€${(value / 1000).toFixed(0)}K`
    return `€${value}`
  }

  return (
    <div
      className={`
        relative bg-gradient-to-br from-[#f1f5f9] via-[#e2e8f0] to-[#cbd5e1]
        rounded-xl shadow-2xl cursor-pointer transition-all duration-300 ease-out
        border-2 border-[#FFD700]/40 overflow-hidden backdrop-blur-sm
        ${isHovered ? 'shadow-2xl shadow-[#FFD700]/30 scale-[1.03] border-[#FFD700]/60' : 'shadow-xl'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCardClick(player)}
    >
      {/* Metallic glow effect on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-[#FFD700]/10 via-[#FFA500]/5 to-transparent
        transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />

      {/* Metallic reflection effect */}
      <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-white/20 to-transparent pointer-events-none" />

      <div className="relative p-6">
        {/* Player Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#e2e8f0] via-[#f1f5f9] to-[#cbd5e1] border-3 border-[#FFD700] flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#1e3a8a]/20 to-[#3b82f6]/10 flex items-center justify-center shadow-lg">
                <span className="text-2xl font-bold text-[#FFD700] drop-shadow-md">
                  {player.firstName?.[0]}{player.lastName?.[0]}
                </span>
              </div>
            </div>
            {/* Premium status indicator */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-br from-[#FFD700] to-[#FFA500] rounded-full border-2 border-[#f1f5f9] flex items-center justify-center shadow-lg">
              <div className="w-2 h-2 bg-[#1e3a8a] rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Player Name */}
        <div className="text-center mb-3">
          <h3 className="text-xl font-serif font-bold text-[#FFD700] mb-1 leading-tight drop-shadow-md">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-[#1e3a8a]/80 font-semibold bg-gradient-to-r from-[#3b82f6]/10 to-[#1e40af]/5 px-2 py-1 rounded-full border border-[#3b82f6]/20">
            {player.position || 'Unknown Position'}
          </p>
        </div>

        {/* Player Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#64748b] font-medium">Age</span>
            <span className="text-[#1e3a8a] font-bold">
              {calculateAge(player.dateOfBirth) || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#64748b] font-medium">Nationality</span>
            <span className="text-[#1e3a8a] font-bold">
              {player.nationality || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#64748b] font-medium">Height</span>
            <span className="text-[#1e3a8a] font-bold">
              {player.height ? `${player.height} cm` : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#64748b] font-medium">Club</span>
            <span className="text-[#1e3a8a] font-bold truncate ml-2">
              {player.club || 'Free Agent'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#64748b] font-medium">Value</span>
            <span className="text-[#FFD700] font-bold drop-shadow-sm">
              {formatMarketValue(player.marketValue)}
            </span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="border-t border-[#FFD700]/20 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-gradient-to-br from-[#1e3a8a]/10 to-[#3b82f6]/5 rounded-lg py-2 border border-[#3b82f6]/20">
              <div className="text-lg font-bold text-[#FFD700] drop-shadow-sm">
                {player.goalsThisSeason || 0}
              </div>
              <div className="text-xs text-[#64748b] font-medium">Goals</div>
            </div>
            <div className="bg-gradient-to-br from-[#1e3a8a]/10 to-[#3b82f6]/5 rounded-lg py-2 border border-[#3b82f6]/20">
              <div className="text-lg font-bold text-[#FFD700] drop-shadow-sm">
                {player.assistsThisSeason || 0}
              </div>
              <div className="text-xs text-[#64748b] font-medium">Assists</div>
            </div>
            <div className="bg-gradient-to-br from-[#1e3a8a]/10 to-[#3b82f6]/5 rounded-lg py-2 border border-[#3b82f6]/20">
              <div className="text-lg font-bold text-[#FFD700] drop-shadow-sm">
                {player.appearances || 0}
              </div>
              <div className="text-xs text-[#64748b] font-medium">Matches</div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {player.rating && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-br from-[#FFD700] via-[#FFA500] to-[#FF8C00] text-[#1e3a8a] text-xs font-bold px-3 py-1.5 rounded-full shadow-2xl border border-[#FFD700]/50">
              {player.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}