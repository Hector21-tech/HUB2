'use client'

import { useState } from 'react'
import { X, Edit, Star, TrendingUp, Calendar, MapPin, Mail, Phone, Globe, Trash2 } from 'lucide-react'
import { Player } from '../types/player'
import { formatPositionsDisplay } from '@/lib/positions'

interface PlayerDetailDrawerProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
  onEdit: (player: Player) => void
  onDelete: (player: Player) => void
}

export function PlayerDetailDrawer({ player, isOpen, onClose, onEdit, onDelete }: PlayerDetailDrawerProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!player || !isOpen) return null

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

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`
    return `€${amount}`
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A'
    return new Date(date).toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    })
  }

  const getSkillLevel = (rating?: number) => {
    if (!rating) return { label: 'N/A', color: 'bg-white/20' }
    if (rating >= 9) return { label: 'Elite', color: 'bg-gradient-to-r from-blue-400 to-blue-600' }
    if (rating >= 8) return { label: 'Excellent', color: 'bg-gradient-to-r from-blue-400/80 to-blue-600/80' }
    if (rating >= 7) return { label: 'Good', color: 'bg-gradient-to-r from-blue-400/60 to-blue-600/60' }
    if (rating >= 6) return { label: 'Average', color: 'bg-white/20' }
    return { label: 'Below Avg', color: 'bg-white/20' }
  }

  const technicalSkills = [
    { name: 'Shooting', value: player.shooting },
    { name: 'Passing', value: player.passing },
    { name: 'Dribbling', value: player.dribbling },
    { name: 'Crossing', value: player.crossing },
    { name: 'Finishing', value: player.finishing },
    { name: 'First Touch', value: player.firstTouch }
  ]

  const physicalAttributes = [
    { name: 'Pace', value: player.pace },
    { name: 'Acceleration', value: player.acceleration },
    { name: 'Strength', value: player.strength },
    { name: 'Stamina', value: player.stamina },
    { name: 'Agility', value: player.agility },
    { name: 'Jumping', value: player.jumping }
  ]

  const mentalAttributes = [
    { name: 'Vision', value: player.vision },
    { name: 'Decisions', value: player.decisions },
    { name: 'Composure', value: player.composure },
    { name: 'Leadership', value: player.leadership },
    { name: 'Work Rate', value: player.workRate },
    { name: 'Determination', value: player.determination }
  ]

  return (
    <div className={`
      fixed inset-0 z-50 transition-opacity duration-300 ease-out
      ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}
    `}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className={`
        absolute top-0 right-0 h-full w-full max-w-2xl
        bg-gradient-to-br from-[#020617] via-[#0c1532] via-[#1e3a8a] via-[#0f1b3e] to-[#020510]
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        overflow-y-auto backdrop-blur-sm
      `}>
        {/* Hero Header */}
        <div className="relative h-48 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 overflow-hidden">
          {/* Player Avatar Background */}
          {player.avatarUrl ? (
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
                  target.style.display = 'none'
                }
              }}
              onLoad={(e) => {
                // Ensure image is visible when loaded successfully
                const target = e.target as HTMLImageElement
                target.style.display = 'block'
              }}
            />
          ) : null}

          {/* Enhanced Gradient Overlay for better text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Player Info Overlay */}
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-semibold text-white mb-2 leading-tight" translate="no" lang="en">
                  {player.firstName} {player.lastName}
                </h2>
                <div className="flex items-center gap-4 text-white/90">
                  <span className="font-medium">{player.club || 'Free Agent'}</span>
                  <span>•</span>
                  <span className="font-medium">{formatPositionsDisplay(player.positions || []) || 'Player'}</span>
                  {player.rating && (
                    <>
                      <span>•</span>
                      <span className="bg-white/20 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-semibold">
                        {player.rating.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(player)}
                  className="p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
                >
                  <Edit className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Basic Information
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/60">Age</label>
                    <p className="text-lg font-semibold text-white">
                      {calculateAge(player.dateOfBirth) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Nationality</label>
                    <p className="text-lg font-semibold text-white">
                      {player.nationality || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Preferred Foot</label>
                    <p className="text-lg font-semibold text-white">
                      {player.preferredFoot || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-white/60">Height / Weight</label>
                    <p className="text-lg font-semibold text-white">
                      {player.height ? `${player.height}cm` : 'N/A'} / {player.weight ? `${player.weight}kg` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Market Value</label>
                    <p className="text-lg font-semibold text-blue-400 drop-shadow-sm">
                      {formatCurrency(player.marketValue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-white/60">Contract Expiry</label>
                    <p className="text-lg font-semibold text-white">
                      {formatDate(player.contractExpiry)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Stats */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Season Performance
            </h3>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: 'Goals', value: player.goalsThisSeason || 0 },
                { label: 'Assists', value: player.assistsThisSeason || 0 },
                { label: 'Matches', value: player.appearances || 0 },
                { label: 'Minutes', value: player.minutesPlayed || 0 }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center"
                >
                  <div className="text-2xl font-bold text-blue-400 drop-shadow-sm mb-1">{stat.value}</div>
                  <div className="text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Skills */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Technical Skills</h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                {technicalSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#1e3a8a]/30 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] transition-all duration-300 shadow-sm"
                          style={{ width: `${((skill.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-blue-400 w-8">
                        {skill.value?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Physical Attributes */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Physical Attributes</h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                {physicalAttributes.map((attr) => (
                  <div key={attr.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{attr.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#1e3a8a]/30 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] transition-all duration-300 shadow-sm"
                          style={{ width: `${((attr.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-blue-400 w-8">
                        {attr.value?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Mental Attributes */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Mental Attributes</h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-6 border border-white/20">
              <div className="grid grid-cols-2 gap-4">
                {mentalAttributes.map((attr) => (
                  <div key={attr.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-white">{attr.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#1e3a8a]/30 rounded-full overflow-hidden shadow-inner">
                        <div
                          className="h-full bg-gradient-to-r from-[#3B82F6] to-[#8B5CF6] transition-all duration-300 shadow-sm"
                          style={{ width: `${((attr.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-blue-400 w-8">
                        {attr.value?.toFixed(1) || 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Notes & Tags */}
          {(player.notes || player.tags?.length > 0) && (
            <section>
              <h3 className="text-lg font-semibold text-white mb-4">Notes & Tags</h3>
              <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 space-y-4">
                {player.notes && (
                  <div>
                    <label className="text-sm font-medium text-white/60 block mb-2">Notes</label>
                    <p className="text-white leading-relaxed">{player.notes}</p>
                  </div>
                )}
                {player.tags?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-white/60 block mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {player.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-500/20 text-blue-400 text-sm font-medium rounded-full border border-blue-500/30"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6 border-t border-white/20">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl">
              Schedule Trial
            </button>
            <button className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/15 font-semibold py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm">
              Add to Shortlist
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-white mb-4">Ta bort spelare</h3>
            <p className="text-white/80 mb-6">
              Är du säker på att du vill ta bort <strong translate="no" lang="en">{player.firstName} {player.lastName}</strong>?
              Detta går inte att ångra.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-colors duration-200 disabled:opacity-50"
              >
                Avbryt
              </button>
              <button
                onClick={async () => {
                  setIsDeleting(true)
                  try {
                    await onDelete(player)
                    setShowDeleteConfirm(false)
                    onClose() // Close drawer after successful delete
                  } catch (error) {
                    console.error('Delete failed:', error)
                  } finally {
                    setIsDeleting(false)
                  }
                }}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50"
              >
                {isDeleting ? 'Tar bort...' : 'Ta bort'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}