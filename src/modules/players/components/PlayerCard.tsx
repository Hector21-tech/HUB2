'use client'

import { useState } from 'react'
import { Player } from '../types/player'
import { formatPositionsDisplay } from '@/lib/positions'

interface PlayerCardProps {
  player: Player
  onCardClick: (player: Player) => void
}

export function PlayerCard({ player, onCardClick }: PlayerCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

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

      {/* Hero Header */}
      <div className="relative h-32 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
        {/* Player Avatar/Background */}
        {player.avatarUrl && !imageError ? (
          <img
            src={player.avatarUrl}
            alt={`${player.firstName} ${player.lastName}`}
            className="absolute inset-0 w-full h-full object-cover filter sepia-[5%] contrast-105 brightness-98"
            loading="lazy"
            onError={(e) => {
              // More robust fallback - try loading once more, then hide
              const target = e.target as HTMLImageElement
              if (!target.dataset.retried) {
                target.dataset.retried = 'true'
                // Force reload the image
                target.src = target.src + '?retry=' + Date.now()
              } else {
                setImageError(true)
              }
            }}
            onLoad={() => {
              // Reset error state on successful load
              setImageError(false)
            }}
          />
        ) : null}

        {/* Enhanced Gradient Overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

        {/* Player Name Overlay */}
        <div className="absolute bottom-4 left-4">
          <h3 className="text-xl font-semibold text-white leading-tight" translate="no" lang="en">
            {player.firstName} {player.lastName}
          </h3>
          <p className="text-sm text-white/80">
            {player.club || 'Free Agent'} • {formatPositionsDisplay(player.positions || []) || 'Player'}
          </p>
        </div>

        {/* Rating Badge */}
        {player.rating && (
          <div className="absolute top-4 right-4">
            <div className="bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              {player.rating.toFixed(1)}
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="relative p-4">

        {/* Key Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {player.goalsThisSeason || 0}
            </div>
            <div className="text-xs text-white/60">Goals</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {player.assistsThisSeason || 0}
            </div>
            <div className="text-xs text-white/60">Assists</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-semibold text-white">
              {player.appearances || 0}
            </div>
            <div className="text-xs text-white/60">Matches</div>
          </div>
        </div>

        {/* Quick Info Footer */}
        <div className="flex justify-between items-center text-sm border-t border-white/10 pt-3">
          <div className="flex items-center gap-4">
            <span className="text-white/60">Age {calculateAge(player.dateOfBirth) || 'N/A'}</span>
            <span className="text-white/60">{player.nationality || 'Unknown'}</span>
          </div>
          <span className="text-blue-400 font-semibold">
            {formatMarketValue(player.marketValue)}
          </span>
        </div>

      </div>
    </div>
  )
}