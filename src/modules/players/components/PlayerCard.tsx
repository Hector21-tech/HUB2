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
        relative bg-gradient-to-br from-[#f8fafc] via-[#e2e8f0] via-[#d1d5db] to-[#9ca3af]
        rounded-xl shadow-2xl cursor-pointer transition-all duration-500 ease-out
        border-2 border-[#FFD700]/50 overflow-hidden backdrop-blur-lg
        before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/20 before:via-transparent before:to-black/10 before:pointer-events-none
        ${isHovered ? 'shadow-[0_25px_60px_-12px_rgba(255,215,0,0.4)] scale-[1.05] border-[#FFD700]/80 before:opacity-100' : 'shadow-[0_20px_50px_-12px_rgba(0,0,0,0.25)] before:opacity-70'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCardClick(player)}
    >
      {/* Enhanced metallic glow effect on hover */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-[#FFD700]/15 via-[#FFA500]/8 via-transparent to-[#FFD700]/5
        transition-all duration-500 ${isHovered ? 'opacity-100 animate-pulse' : 'opacity-0'}
      `} />

      {/* Premium metallic reflection effect */}
      <div className="absolute top-0 left-0 right-0 h-2/5 bg-gradient-to-b from-white/30 via-white/10 to-transparent pointer-events-none" />

      {/* Subtle shine animation */}
      <div className={`
        absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent
        transform -skew-x-12 transition-all duration-1000 pointer-events-none
        ${isHovered ? 'translate-x-full opacity-60' : '-translate-x-full opacity-0'}
      `} />

      <div className="relative p-6">
        {/* Player Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#f1f5f9] via-[#e5e7eb] to-[#d1d5db] border-3 border-[#FFD700] flex items-center justify-center shadow-[inset_0_2px_4px_rgba(0,0,0,0.1)]">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#0f172a]/30 via-[#1e3a8a]/20 to-[#1e40af]/15 flex items-center justify-center shadow-lg backdrop-blur-sm">
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
            <div className="bg-gradient-to-br from-[#0f172a]/15 via-[#1e3a8a]/10 to-[#1e40af]/8 rounded-lg py-2 border border-[#FFD700]/20 backdrop-blur-sm shadow-inner">
              <div className="text-lg font-bold text-[#FFD700] drop-shadow-sm">
                {player.goalsThisSeason || 0}
              </div>
              <div className="text-xs text-[#64748b] font-medium">Goals</div>
            </div>
            <div className="bg-gradient-to-br from-[#0f172a]/15 via-[#1e3a8a]/10 to-[#1e40af]/8 rounded-lg py-2 border border-[#FFD700]/20 backdrop-blur-sm shadow-inner">
              <div className="text-lg font-bold text-[#FFD700] drop-shadow-sm">
                {player.assistsThisSeason || 0}
              </div>
              <div className="text-xs text-[#64748b] font-medium">Assists</div>
            </div>
            <div className="bg-gradient-to-br from-[#0f172a]/15 via-[#1e3a8a]/10 to-[#1e40af]/8 rounded-lg py-2 border border-[#FFD700]/20 backdrop-blur-sm shadow-inner">
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