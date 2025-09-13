'use client'

import { X, Edit, Star, TrendingUp, Calendar, MapPin, Mail, Phone, Globe } from 'lucide-react'
import { Player } from '../types/player'

interface PlayerDetailDrawerProps {
  player: Player | null
  isOpen: boolean
  onClose: () => void
}

export function PlayerDetailDrawer({ player, isOpen, onClose }: PlayerDetailDrawerProps) {
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
    if (!rating) return { label: 'N/A', color: 'bg-[#D7CCC8]' }
    if (rating >= 9) return { label: 'Elite', color: 'bg-gradient-to-r from-[#D4AF37] to-[#F4D03F]' }
    if (rating >= 8) return { label: 'Excellent', color: 'bg-gradient-to-r from-[#D4AF37]/80 to-[#F4D03F]/80' }
    if (rating >= 7) return { label: 'Good', color: 'bg-gradient-to-r from-[#D4AF37]/60 to-[#F4D03F]/60' }
    if (rating >= 6) return { label: 'Average', color: 'bg-[#D7CCC8]' }
    return { label: 'Below Avg', color: 'bg-[#D7CCC8]/60' }
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
        absolute top-0 right-0 h-full w-full max-w-2xl bg-[#FAF8F3]
        transform transition-transform duration-300 ease-out
        ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        overflow-y-auto
      `}>
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-[#FAF8F3] to-[#F8F6F0] border-b border-[#D7CCC8]/30 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#D4AF37]/10 to-[#D4AF37]/5 border-2 border-[#D4AF37]/30 flex items-center justify-center">
                <span className="text-xl font-bold text-[#D4AF37]">
                  {player.firstName?.[0]}{player.lastName?.[0]}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-serif font-bold text-[#D4AF37]">
                  {player.firstName} {player.lastName}
                </h2>
                <p className="text-[#3E2723]/70">{player.position} • {player.club}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="p-2 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white rounded-lg transition-colors duration-200">
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={onClose}
                className="p-2 bg-[#3E2723]/10 hover:bg-[#3E2723]/20 text-[#3E2723] rounded-lg transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-[#3E2723] mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-[#D4AF37]" />
              Basic Information
            </h3>
            <div className="bg-white/50 rounded-xl p-6 border border-[#D7CCC8]/20">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Age</label>
                    <p className="text-lg font-semibold text-[#3E2723]">
                      {calculateAge(player.dateOfBirth) || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Nationality</label>
                    <p className="text-lg font-semibold text-[#3E2723]">
                      {player.nationality || 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Preferred Foot</label>
                    <p className="text-lg font-semibold text-[#3E2723]">
                      {player.preferredFoot || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Height / Weight</label>
                    <p className="text-lg font-semibold text-[#3E2723]">
                      {player.height ? `${player.height}cm` : 'N/A'} / {player.weight ? `${player.weight}kg` : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Market Value</label>
                    <p className="text-lg font-semibold text-[#D4AF37]">
                      {formatCurrency(player.marketValue)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60">Contract Expiry</label>
                    <p className="text-lg font-semibold text-[#3E2723]">
                      {formatDate(player.contractExpiry)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Performance Stats */}
          <section>
            <h3 className="text-lg font-semibold text-[#3E2723] mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
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
                  className="bg-white/50 rounded-xl p-4 border border-[#D7CCC8]/20 text-center"
                >
                  <div className="text-2xl font-bold text-[#D4AF37] mb-1">{stat.value}</div>
                  <div className="text-sm text-[#3E2723]/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Skills */}
          <section>
            <h3 className="text-lg font-semibold text-[#3E2723] mb-4">Technical Skills</h3>
            <div className="bg-white/50 rounded-xl p-6 border border-[#D7CCC8]/20">
              <div className="grid grid-cols-2 gap-4">
                {technicalSkills.map((skill) => (
                  <div key={skill.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3E2723]">{skill.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#D7CCC8]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] transition-all duration-300"
                          style={{ width: `${((skill.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#D4AF37] w-8">
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
            <h3 className="text-lg font-semibold text-[#3E2723] mb-4">Physical Attributes</h3>
            <div className="bg-white/50 rounded-xl p-6 border border-[#D7CCC8]/20">
              <div className="grid grid-cols-2 gap-4">
                {physicalAttributes.map((attr) => (
                  <div key={attr.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3E2723]">{attr.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#D7CCC8]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] transition-all duration-300"
                          style={{ width: `${((attr.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#D4AF37] w-8">
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
            <h3 className="text-lg font-semibold text-[#3E2723] mb-4">Mental Attributes</h3>
            <div className="bg-white/50 rounded-xl p-6 border border-[#D7CCC8]/20">
              <div className="grid grid-cols-2 gap-4">
                {mentalAttributes.map((attr) => (
                  <div key={attr.name} className="flex items-center justify-between">
                    <span className="text-sm font-medium text-[#3E2723]">{attr.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-[#D7CCC8]/30 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-[#D4AF37] to-[#F4D03F] transition-all duration-300"
                          style={{ width: `${((attr.value || 0) / 10) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold text-[#D4AF37] w-8">
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
              <h3 className="text-lg font-semibold text-[#3E2723] mb-4">Notes & Tags</h3>
              <div className="bg-white/50 rounded-xl p-6 border border-[#D7CCC8]/20 space-y-4">
                {player.notes && (
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60 block mb-2">Notes</label>
                    <p className="text-[#3E2723] leading-relaxed">{player.notes}</p>
                  </div>
                )}
                {player.tags?.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-[#3E2723]/60 block mb-2">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {player.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm font-medium rounded-full border border-[#D4AF37]/20"
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
          <div className="flex gap-4 pt-6 border-t border-[#D7CCC8]/30">
            <button className="flex-1 bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200">
              Schedule Trial
            </button>
            <button className="flex-1 bg-transparent border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37]/10 font-medium py-3 px-6 rounded-xl transition-colors duration-200">
              Add to Shortlist
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}