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
        relative bg-gradient-to-br from-[#FFFFF0] to-[#F8F6F0]
        rounded-xl shadow-lg cursor-pointer transition-all duration-300 ease-out
        border border-[#D4AF37]/20 overflow-hidden
        ${isHovered ? 'shadow-xl shadow-[#D4AF37]/20 scale-[1.02]' : 'hover:shadow-lg'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCardClick(player)}
    >
      {/* Subtle glow effect on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-[#D4AF37]/5 to-transparent
        transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}
      `} />

      <div className="relative p-6">
        {/* Player Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#F5F5F5] to-[#E8E8E8] border-2 border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 flex items-center justify-center">
                <span className="text-2xl font-semibold text-[#D4AF37]">
                  {player.firstName?.[0]}{player.lastName?.[0]}
                </span>
              </div>
            </div>
            {/* Online status indicator */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#D4AF37] rounded-full border-2 border-white flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Player Name */}
        <div className="text-center mb-3">
          <h3 className="text-xl font-serif font-semibold text-[#D4AF37] mb-1 leading-tight">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-[#3E2723]/70 font-medium">
            {player.position || 'Unknown Position'}
          </p>
        </div>

        {/* Player Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-[#3E2723]/60">Age</span>
            <span className="text-[#3E2723] font-medium">
              {calculateAge(player.dateOfBirth) || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#3E2723]/60">Nationality</span>
            <span className="text-[#3E2723] font-medium">
              {player.nationality || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#3E2723]/60">Height</span>
            <span className="text-[#3E2723] font-medium">
              {player.height ? `${player.height} cm` : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#3E2723]/60">Club</span>
            <span className="text-[#3E2723] font-medium truncate ml-2">
              {player.club || 'Free Agent'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-[#3E2723]/60">Value</span>
            <span className="text-[#D4AF37] font-semibold">
              {formatMarketValue(player.marketValue)}
            </span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="border-t border-[#D7CCC8]/30 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <div className="text-lg font-bold text-[#D4AF37]">
                {player.goalsThisSeason || 0}
              </div>
              <div className="text-xs text-[#3E2723]/60">Goals</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#D4AF37]">
                {player.assistsThisSeason || 0}
              </div>
              <div className="text-xs text-[#3E2723]/60">Assists</div>
            </div>
            <div>
              <div className="text-lg font-bold text-[#D4AF37]">
                {player.appearances || 0}
              </div>
              <div className="text-xs text-[#3E2723]/60">Matches</div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {player.rating && (
          <div className="absolute top-4 right-4">
            <div className="bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
              {player.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}