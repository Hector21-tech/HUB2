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
        relative bg-white/10 backdrop-blur-md
        rounded-lg shadow-lg cursor-pointer transition-all duration-200
        border border-white/20 overflow-hidden
        ${isHovered ? 'bg-white/15 border-white/30 shadow-xl' : 'shadow-lg'}
      `}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onCardClick(player)}
    >

      <div className="relative p-6">
        {/* Player Avatar */}
        <div className="flex justify-center mb-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-white/15 border-2 border-blue-400/50 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center">
                <span className="text-2xl font-semibold text-white">
                  {player.firstName?.[0]}{player.lastName?.[0]}
                </span>
              </div>
            </div>
            {/* Status indicator */}
            <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full border-2 border-white/30 flex items-center justify-center">
              <div className="w-2 h-2 bg-white rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Player Name */}
        <div className="text-center mb-3">
          <h3 className="text-xl font-semibold text-white mb-1 leading-tight">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-white/70 bg-white/10 px-2 py-1 rounded-full border border-white/20">
            {player.position || 'Unknown Position'}
          </p>
        </div>

        {/* Player Details */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/60 font-medium">Age</span>
            <span className="text-white font-semibold">
              {calculateAge(player.dateOfBirth) || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60 font-medium">Nationality</span>
            <span className="text-white font-semibold">
              {player.nationality || 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60 font-medium">Height</span>
            <span className="text-white font-semibold">
              {player.height ? `${player.height} cm` : 'N/A'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60 font-medium">Club</span>
            <span className="text-[#1e3a8a] font-bold truncate ml-2">
              {player.club || 'Free Agent'}
            </span>
          </div>

          <div className="flex justify-between text-sm">
            <span className="text-white/60 font-medium">Value</span>
            <span className="text-blue-400 font-semibold">
              {formatMarketValue(player.marketValue)}
            </span>
          </div>
        </div>

        {/* Key Stats */}
        <div className="border-t border-white/20 pt-4">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-white/10 rounded-lg py-2 border border-white/20">
              <div className="text-lg font-semibold text-white">
                {player.goalsThisSeason || 0}
              </div>
              <div className="text-xs text-white/60 font-medium">Goals</div>
            </div>
            <div className="bg-white/10 rounded-lg py-2 border border-white/20">
              <div className="text-lg font-semibold text-white">
                {player.assistsThisSeason || 0}
              </div>
              <div className="text-xs text-white/60 font-medium">Assists</div>
            </div>
            <div className="bg-white/10 rounded-lg py-2 border border-white/20">
              <div className="text-lg font-semibold text-white">
                {player.appearances || 0}
              </div>
              <div className="text-xs text-white/60 font-medium">Matches</div>
            </div>
          </div>
        </div>

        {/* Rating Badge */}
        {player.rating && (
          <div className="absolute top-4 right-4">
            <div className="bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-full border border-blue-400/50">
              {player.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}