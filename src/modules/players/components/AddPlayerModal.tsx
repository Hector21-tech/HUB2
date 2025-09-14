'use client'

import { useState } from 'react'
import { X, User, MapPin, Calendar, Users } from 'lucide-react'

interface AddPlayerModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (playerData: any) => void
  tenantId: string
}

export function AddPlayerModal({ isOpen, onClose, onSave, tenantId }: AddPlayerModalProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    nationality: '',
    position: '',
    club: '',
    height: '',
    weight: '',
    notes: '',
    rating: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required'
    }
    if (formData.height && (isNaN(Number(formData.height)) || Number(formData.height) < 50 || Number(formData.height) > 250)) {
      newErrors.height = 'Height must be between 50-250 cm'
    }
    if (formData.weight && (isNaN(Number(formData.weight)) || Number(formData.weight) < 30 || Number(formData.weight) > 150)) {
      newErrors.weight = 'Weight must be between 30-150 kg'
    }
    if (formData.rating && (isNaN(Number(formData.rating)) || Number(formData.rating) < 1 || Number(formData.rating) > 10)) {
      newErrors.rating = 'Rating must be between 1-10'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      const playerData = {
        ...formData,
        tenantId,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : undefined,
        height: formData.height ? Number(formData.height) : undefined,
        weight: formData.weight ? Number(formData.weight) : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        tags: [] // Default empty tags
      }

      await onSave(playerData)

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        dateOfBirth: '',
        nationality: '',
        position: '',
        club: '',
        height: '',
        weight: '',
        notes: '',
        rating: ''
      })

      onClose()
    } catch (error) {
      console.error('Error saving player:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative min-h-screen flex items-center justify-center p-4">
        <div className="relative w-full max-w-2xl bg-gradient-to-br from-[#020617] via-[#0c1532] to-[#1e3a8a] rounded-xl shadow-2xl border border-white/20">

          {/* Header */}
          <div className="relative h-20 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-t-xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors duration-200 backdrop-blur-sm"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="absolute bottom-4 left-6">
              <h2 className="text-2xl font-semibold text-white flex items-center gap-3">
                <User className="w-6 h-6" />
                Add New Player
              </h2>
            </div>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">

            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Basic Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    className={`
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      transition-all duration-200
                      ${errors.firstName ? 'border-red-400' : 'border-white/20 hover:border-white/30'}
                    `}
                    placeholder="Enter first name"
                  />
                  {errors.firstName && (
                    <p className="text-red-400 text-sm mt-1">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    className={`
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      transition-all duration-200
                      ${errors.lastName ? 'border-red-400' : 'border-white/20 hover:border-white/30'}
                    `}
                    placeholder="Enter last name"
                  />
                  {errors.lastName && (
                    <p className="text-red-400 text-sm mt-1">{errors.lastName}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    <Calendar className="w-4 h-4 inline mr-1" />
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border border-white/20 rounded-lg
                      text-white
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      hover:border-white/30
                      transition-all duration-200
                    "
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    <MapPin className="w-4 h-4 inline mr-1" />
                    Nationality
                  </label>
                  <input
                    type="text"
                    value={formData.nationality}
                    onChange={(e) => handleInputChange('nationality', e.target.value)}
                    className="
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border border-white/20 rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      hover:border-white/30
                      transition-all duration-200
                    "
                    placeholder="e.g. England"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    <Users className="w-4 h-4 inline mr-1" />
                    Position
                  </label>
                  <select
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border border-white/20 rounded-lg
                      text-white
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      hover:border-white/30
                      transition-all duration-200
                      appearance-none
                    "
                  >
                    <option value="" className="bg-slate-800 text-white">Select position</option>
                    <option value="Goalkeeper" className="bg-slate-800 text-white">Goalkeeper</option>
                    <option value="Defender" className="bg-slate-800 text-white">Defender</option>
                    <option value="Midfielder" className="bg-slate-800 text-white">Midfielder</option>
                    <option value="Forward" className="bg-slate-800 text-white">Forward</option>
                    <option value="Striker" className="bg-slate-800 text-white">Striker</option>
                    <option value="Winger" className="bg-slate-800 text-white">Winger</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Club & Physical */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white mb-4">Club & Physical</h3>

              <div>
                <label className="block text-sm font-medium text-white/60 mb-2">Current Club</label>
                <input
                  type="text"
                  value={formData.club}
                  onChange={(e) => handleInputChange('club', e.target.value)}
                  className="
                    w-full px-4 py-3
                    bg-white/5 backdrop-blur-sm
                    border border-white/20 rounded-lg
                    text-white placeholder-white/50
                    focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                    hover:border-white/30
                    transition-all duration-200
                  "
                  placeholder="e.g. Manchester United"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    value={formData.height}
                    onChange={(e) => handleInputChange('height', e.target.value)}
                    className={`
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      transition-all duration-200
                      ${errors.height ? 'border-red-400' : 'border-white/20 hover:border-white/30'}
                    `}
                    placeholder="180"
                    min="50"
                    max="250"
                  />
                  {errors.height && (
                    <p className="text-red-400 text-sm mt-1">{errors.height}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    value={formData.weight}
                    onChange={(e) => handleInputChange('weight', e.target.value)}
                    className={`
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      transition-all duration-200
                      ${errors.weight ? 'border-red-400' : 'border-white/20 hover:border-white/30'}
                    `}
                    placeholder="75"
                    min="30"
                    max="150"
                  />
                  {errors.weight && (
                    <p className="text-red-400 text-sm mt-1">{errors.weight}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-white/60 mb-2">
                    Overall Rating (1-10)
                  </label>
                  <input
                    type="number"
                    value={formData.rating}
                    onChange={(e) => handleInputChange('rating', e.target.value)}
                    className={`
                      w-full px-4 py-3
                      bg-white/5 backdrop-blur-sm
                      border rounded-lg
                      text-white placeholder-white/50
                      focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                      transition-all duration-200
                      ${errors.rating ? 'border-red-400' : 'border-white/20 hover:border-white/30'}
                    `}
                    placeholder="8.0"
                    min="1"
                    max="10"
                    step="0.1"
                  />
                  {errors.rating && (
                    <p className="text-red-400 text-sm mt-1">{errors.rating}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">
                Scout Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="
                  w-full px-4 py-3
                  bg-white/5 backdrop-blur-sm
                  border border-white/20 rounded-lg
                  text-white placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                  hover:border-white/30
                  transition-all duration-200 resize-none
                "
                placeholder="Add any scouting notes or observations..."
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 pt-6 border-t border-white/20">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-white/10 border-2 border-white/20 text-white hover:bg-white/15 font-semibold py-3 px-6 rounded-xl transition-all duration-200 backdrop-blur-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Adding Player...' : 'Add Player'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}