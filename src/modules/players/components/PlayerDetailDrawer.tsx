'use client'

import { useState } from 'react'
import { X, Edit, Star, TrendingUp, Calendar, MapPin, Mail, Phone, Globe, Trash2, FileText, Loader2 } from 'lucide-react'
import { Player } from '../types/player'
import { formatPositionsDisplay } from '@/lib/positions'
import jsPDF from 'jspdf'

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
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false)

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

  const handleExportPDF = async () => {
    if (!player) return

    setIsGeneratingPDF(true)

    try {
      // Call AI API to generate player description
      const response = await fetch('/api/generate-player-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerData: {
            firstName: player.firstName,
            lastName: player.lastName,
            positions: player.positions,
            club: player.club,
            nationality: player.nationality,
            dateOfBirth: player.dateOfBirth,
            notes: player.notes,
            rating: player.rating,
            goalsThisSeason: player.goalsThisSeason,
            assistsThisSeason: player.assistsThisSeason,
            marketValue: player.marketValue
          }
        })
      })

      if (!response.ok) {
        throw new Error('Failed to generate description')
      }

      const { description } = await response.json()

      // Create PDF with professional layout
      const pdf = new jsPDF()
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 20
      const columnWidth = (pageWidth - 3 * margin) / 2

      // Colors
      const goldColor = [212, 175, 55] // #D4AF37
      const darkGray = [51, 51, 51]
      const lightGray = [128, 128, 128]

      // Header with player name
      pdf.setFillColor(...goldColor)
      pdf.rect(0, 0, pageWidth, 60, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont('helvetica', 'bold')
      pdf.text(`${player.firstName} ${player.lastName}`, margin, 35)

      // Subtitle
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'normal')
      const subtitle = `${formatPositionsDisplay(player.positions || [])} | ${calculateAge(player.dateOfBirth) || 'Okänd ålder'} år | ${player.nationality || 'Okänd'}`
      pdf.text(subtitle, margin, 50)

      // Player photo placeholder (left column)
      let currentY = 80
      if (player.avatarUrl) {
        try {
          // Add image placeholder for now - will show as gray box
          pdf.setFillColor(200, 200, 200)
          pdf.rect(margin, currentY, 60, 80, 'F')
          pdf.setTextColor(...darkGray)
          pdf.setFontSize(10)
          pdf.text('Spelarbild', margin + 20, currentY + 45)
        } catch (e) {
          // Image loading failed, continue without
        }
      } else {
        pdf.setFillColor(200, 200, 200)
        pdf.rect(margin, currentY, 60, 80, 'F')
        pdf.setTextColor(...darkGray)
        pdf.setFontSize(10)
        pdf.text('Ingen bild', margin + 20, currentY + 45)
      }

      // Section: Personlig Information (top right)
      const rightColumnX = margin + columnWidth + margin
      pdf.setTextColor(...goldColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Personlig Information', rightColumnX, currentY + 10)

      pdf.setTextColor(...darkGray)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      const personalInfo = [
        { label: 'Ålder:', value: `${calculateAge(player.dateOfBirth) || 'Okänd'} år` },
        { label: 'Längd:', value: player.height ? `${player.height} cm` : 'Ej angivet' },
        { label: 'Födelsedatum:', value: player.dateOfBirth ? formatDate(player.dateOfBirth) : 'Ej angivet' },
        { label: 'Nationalitet:', value: player.nationality || 'Ej angivet' }
      ]

      let infoY = currentY + 25
      personalInfo.forEach(info => {
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...lightGray)
        pdf.text(info.label, rightColumnX, infoY)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkGray)
        pdf.text(info.value, rightColumnX + 40, infoY)
        infoY += 12
      })

      // Section: Klubb & Kontrakt (right column)
      currentY = 180
      pdf.setTextColor(...goldColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Klubb & Kontrakt', rightColumnX, currentY)

      pdf.setTextColor(...darkGray)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')

      const clubInfo = [
        { label: 'Nuvarande klubb:', value: player.club || 'Klubblös' },
        { label: 'Kontraktstart:', value: 'Ej angivet' },
        { label: 'Kontraktslut:', value: player.contractExpiry ? formatDate(player.contractExpiry) : 'Ej angivet' }
      ]

      let clubY = currentY + 15
      clubInfo.forEach(info => {
        pdf.setFont('helvetica', 'normal')
        pdf.setTextColor(...lightGray)
        pdf.text(info.label, rightColumnX, clubY)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(...darkGray)
        pdf.text(info.value, rightColumnX + 40, clubY)
        clubY += 12
      })

      // Section: Scoutanteckningar (full width)
      currentY = 250
      pdf.setFillColor(...goldColor)
      pdf.rect(margin - 5, currentY - 5, 5, 20, 'F') // Gold accent bar

      pdf.setTextColor(...goldColor)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Scoutanteckningar', margin + 5, currentY + 5)

      // Parse AI description for Styrkor and Svagheter
      let scoutY = currentY + 20

      // Split AI description by sections
      const sections = description.split('**')
      let currentSection = ''

      sections.forEach(section => {
        if (section.trim().startsWith('Styrkor:')) {
          pdf.setTextColor(...darkGray)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Styrkor:', margin, scoutY)
          scoutY += 15

          const content = section.replace('Styrkor:', '').trim()
          pdf.setFont('helvetica', 'normal')
          const splitContent = pdf.splitTextToSize(content, pageWidth - 2 * margin)
          pdf.text(splitContent, margin, scoutY)
          scoutY += (splitContent.length * 5) + 10
        } else if (section.trim().startsWith('Svagheter:')) {
          pdf.setTextColor(...darkGray)
          pdf.setFontSize(11)
          pdf.setFont('helvetica', 'bold')
          pdf.text('Svagheter:', margin, scoutY)
          scoutY += 15

          const content = section.replace('Svagheter:', '').trim()
          pdf.setFont('helvetica', 'normal')
          const splitContent = pdf.splitTextToSize(content, pageWidth - 2 * margin)
          pdf.text(splitContent, margin, scoutY)
          scoutY += (splitContent.length * 5) + 10
        }
      })

      // Footer
      const footerY = pageHeight - 30
      pdf.setFillColor(...goldColor)
      pdf.rect(0, footerY - 10, pageWidth, 40, 'F')

      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Elite Sports Group AB', margin, footerY + 5)

      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text('Professional Football Agents', margin, footerY + 15)

      // Generation date
      const date = new Date().toLocaleDateString('sv-SE')
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Genererad: ${date}`, pageWidth - margin - 40, footerY + 15)

      // Save PDF
      const fileName = `Spelarprofil - ${player.firstName} ${player.lastName}.pdf`
      pdf.save(fileName)

    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Ett fel uppstod vid generering av PDF. Försök igen.')
    } finally {
      setIsGeneratingPDF(false)
    }
  }

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
        absolute top-0 right-0 h-full w-full sm:max-w-2xl
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
              className="absolute inset-0 w-full h-full object-cover object-top filter sepia-[5%] contrast-105 brightness-98"
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
            className="absolute top-3 right-3 sm:top-4 sm:right-4 p-2 sm:p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm z-10 touch-none"
          >
            <X className="w-5 h-5 sm:w-5 sm:h-5" />
          </button>

          {/* Player Info Overlay */}
          <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
            <div className="flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-3xl font-semibold text-white mb-2 leading-tight" translate="no" lang="en">
                  {player.firstName} {player.lastName}
                </h2>
                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-white/90">
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

              <div className="flex gap-2 mt-2 sm:mt-0">
                <button
                  onClick={() => onEdit(player)}
                  className="p-2 sm:p-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 shadow-lg touch-none"
                >
                  <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="p-2 sm:p-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 shadow-lg touch-none"
                >
                  <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
          {/* Basic Information */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Star className="w-5 h-5 text-blue-400" />
              Basic Information
            </h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
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
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
              {[
                { label: 'Goals', value: player.goalsThisSeason || 0 },
                { label: 'Assists', value: player.assistsThisSeason || 0 },
                { label: 'Matches', value: player.appearances || 0 },
                { label: 'Minutes', value: player.minutesPlayed || 0 }
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="bg-white/10 backdrop-blur-md rounded-xl p-3 sm:p-4 border border-white/20 text-center"
                >
                  <div className="text-xl sm:text-2xl font-bold text-blue-400 drop-shadow-sm mb-1">{stat.value}</div>
                  <div className="text-xs sm:text-sm text-white/60">{stat.label}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Technical Skills */}
          <section>
            <h3 className="text-lg font-semibold text-white mb-4">Technical Skills</h3>
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
            <div className="bg-white/10 backdrop-blur-md rounded-lg p-4 sm:p-6 border border-white/20">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
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
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 border-t border-white/20">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 sm:py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl touch-none">
              Schedule Trial
            </button>
            <button
              onClick={handleExportPDF}
              disabled={isGeneratingPDF}
              className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/15 font-semibold py-4 sm:py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm touch-none flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingPDF ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Genererar PDF...
                </>
              ) : (
                <>
                  <FileText className="w-5 h-5" />
                  Exportera PDF
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-10 p-4">
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-4 sm:p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Ta bort spelare</h3>
            <p className="text-white/80 mb-6">
              Är du säker på att du vill ta bort <strong translate="no" lang="en">{player.firstName} {player.lastName}</strong>?
              Detta går inte att ångra.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 sm:py-2 bg-white/10 border border-white/20 text-white rounded-lg hover:bg-white/15 transition-colors duration-200 disabled:opacity-50 touch-none"
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
                className="flex-1 px-4 py-3 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 touch-none"
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