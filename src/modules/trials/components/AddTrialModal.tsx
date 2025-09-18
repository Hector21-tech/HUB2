'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, MapPin, User, FileText } from 'lucide-react'
import { SearchableSelect } from '@/components/ui/SearchableSelect'
import { usePlayersQuery } from '../../players/hooks/usePlayersQuery'
import { useCreateTrial, useUpdateTrial } from '../hooks/useTrialMutations'
import { Trial, CreateTrialInput, UpdateTrialInput } from '../types/trial'
import { searchClubs, getAllClubNames } from '@/lib/football-clubs'
import { toDateTimeLocalString, fromDateTimeLocalString } from '@/lib/formatters'

interface AddTrialModalProps {
  isOpen: boolean
  onClose: () => void
  tenantId: string
  trial?: Trial | null // For editing existing trials
  preSelectedPlayerId?: string // For pre-selecting a player when scheduling from player detail
}

export function AddTrialModal({ isOpen, onClose, tenantId, trial, preSelectedPlayerId }: AddTrialModalProps) {
  const [formData, setFormData] = useState({
    playerId: '',
    requestId: '',
    scheduledAt: '',
    club: '',
    location: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Fetch players for dropdown
  const { data: players = [], isLoading: playersLoading } = usePlayersQuery(tenantId)

  // Mutations
  const createTrial = useCreateTrial(tenantId)
  const updateTrial = useUpdateTrial(tenantId)

  // Populate form when editing a trial or pre-selecting a player
  useEffect(() => {
    if (trial) {
      setFormData({
        playerId: trial.playerId || '',
        requestId: trial.requestId || '',
        scheduledAt: toDateTimeLocalString(trial.scheduledAt),
        club: trial.location || '', // Map existing location to club for backward compatibility
        location: '',
        notes: trial.notes || ''
      })
    } else {
      // Reset form for new trial, but use preSelectedPlayerId if provided
      setFormData({
        playerId: preSelectedPlayerId || '',
        requestId: '',
        scheduledAt: '',
        club: '',
        location: '',
        notes: ''
      })
    }
    setErrors({})
  }, [trial, preSelectedPlayerId, isOpen])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.playerId) {
      newErrors.playerId = 'Please select a player'
    }

    if (!formData.scheduledAt) {
      newErrors.scheduledAt = 'Please select a date and time'
    } else {
      const selectedDate = new Date(formData.scheduledAt)
      const now = new Date()
      if (selectedDate < now) {
        newErrors.scheduledAt = 'Trial date must be in the future'
      }
    }

    if (!formData.club?.trim()) {
      newErrors.club = 'Please select a club'
    }

    if (!formData.location?.trim()) {
      newErrors.location = 'Please enter a location'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const trialData = {
        playerId: formData.playerId,
        requestId: formData.requestId || null,
        scheduledAt: fromDateTimeLocalString(formData.scheduledAt),
        location: formData.club.trim(), // Save club as location for backend compatibility
        notes: formData.notes.trim() || null
      }

      if (trial) {
        // Update existing trial
        const updateData: UpdateTrialInput = {
          scheduledAt: trialData.scheduledAt,
          location: trialData.location,
          notes: trialData.notes
        }
        await updateTrial.mutateAsync({ trialId: trial.id, data: updateData })
      } else {
        // Create new trial
        const createData: CreateTrialInput = trialData
        await createTrial.mutateAsync(createData)
      }

      onClose()
    } catch (error) {
      console.error('Failed to save trial:', error)
      // Error handling - could show toast notification here
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    if (!isSubmitting) {
      onClose()
    }
  }

  // Convert players to searchable select options
  const playerOptions = players.map(player => ({
    value: player.id,
    label: `${player.firstName} ${player.lastName} - ${player.positions?.join(', ') || 'No position'} • ${player.club || 'No club'}`
  }))

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {trial ? 'Edit Trial' : 'Schedule Trial'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Player Selection */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User className="w-4 h-4" />
              Player *
            </label>
            <SearchableSelect
              options={playerOptions}
              value={formData.playerId}
              onChange={(value) => handleInputChange('playerId', value || '')}
              placeholder={playersLoading ? "Loading players..." : "Select a player..."}
              disabled={isSubmitting || !!trial || playersLoading} // Disable when editing (can't change player)
              variant="modal"
            />
            {errors.playerId && (
              <p className="text-red-600 text-sm mt-1">{errors.playerId}</p>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4" />
              Date & Time *
            </label>
            <input
              type="datetime-local"
              value={formData.scheduledAt}
              onChange={(e) => handleInputChange('scheduledAt', e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
            />
            {errors.scheduledAt && (
              <p className="text-red-600 text-sm mt-1">{errors.scheduledAt}</p>
            )}
          </div>

          {/* Club */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Club *
            </label>
            <SearchableSelect
              options={getAllClubNames().map(club => ({ value: club, label: club }))}
              value={formData.club}
              onChange={(value) => handleInputChange('club', value || '')}
              placeholder="Select a club..."
              disabled={isSubmitting}
              variant="modal"
            />
            {errors.club && (
              <p className="text-red-600 text-sm mt-1">{errors.club}</p>
            )}
          </div>

          {/* Location */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin className="w-4 h-4" />
              Location *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Training Ground A, Stadium Name..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none disabled:bg-gray-50"
            />
            {errors.location && (
              <p className="text-red-600 text-sm mt-1">{errors.location}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4" />
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any notes about this trial session..."
              rows={3}
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none disabled:bg-gray-50"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? (trial ? 'Updating...' : 'Scheduling...')
                : (trial ? 'Update Trial' : 'Schedule Trial')
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}