'use client'

import { Calendar, MapPin, User, Star, Clock, Edit, Trash2 } from 'lucide-react'
import { Trial } from '../types/trial'
import { TrialStatusBadge } from './TrialStatusBadge'
import { formatPositionsDisplay } from '@/lib/positions'

interface TrialCardProps {
  trial: Trial
  onEdit?: (trial: Trial) => void
  onDelete?: (trial: Trial) => void
  onEvaluate?: (trial: Trial) => void
  onClick?: (trial: Trial) => void
}

export function TrialCard({ trial, onEdit, onDelete, onEvaluate, onClick }: TrialCardProps) {
  const playerName = trial.player
    ? `${trial.player.firstName} ${trial.player.lastName}`
    : 'Unknown Player'

  const playerPositions = trial.player?.positions
    ? formatPositionsDisplay(trial.player.positions)
    : ''

  const trialDate = new Date(trial.scheduledAt)
  const isUpcoming = trialDate > new Date()
  const isPast = trialDate < new Date()
  const canEvaluate = trial.status === 'COMPLETED' && !trial.rating

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('sv-SE', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  }

  const handleCardClick = () => {
    onClick?.(trial)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(trial)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(trial)
  }

  const handleEvaluate = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEvaluate?.(trial)
  }

  return (
    <div
      className={`
        group relative bg-white/80 backdrop-blur-sm rounded-xl border border-white/20
        shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer
        hover:scale-[1.02] hover:bg-white/90
        ${canEvaluate ? 'ring-2 ring-yellow-400/50' : ''}
      `}
      onClick={handleCardClick}
    >
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{playerName}</h3>
              <p className="text-sm text-gray-600">{playerPositions}</p>
            </div>
          </div>
          <TrialStatusBadge status={trial.status} size="sm" />
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-3">
        {/* Date & Time */}
        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span className={`
            ${isUpcoming ? 'text-blue-600 font-medium' : ''}
            ${isPast ? 'text-gray-500' : ''}
          `}>
            {formatDate(trialDate)}
          </span>
          {isUpcoming && (
            <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded-full">
              Upcoming
            </span>
          )}
        </div>

        {/* Location */}
        {trial.location && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{trial.location}</span>
          </div>
        )}

        {/* Club */}
        {trial.player?.club && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <User className="w-4 h-4 text-gray-400" />
            <span>{trial.player.club}</span>
          </div>
        )}

        {/* Notes Preview */}
        {trial.notes && (
          <div className="text-sm text-gray-600 line-clamp-2">
            {trial.notes}
          </div>
        )}

        {/* Rating */}
        {trial.rating && (
          <div className="flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-500 fill-current" />
            <span className="font-medium text-gray-900">{trial.rating}/10</span>
          </div>
        )}

        {/* Evaluation Required Banner */}
        {canEvaluate && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                Evaluation Required
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 p-4 pt-0">
        {canEvaluate && (
          <button
            onClick={handleEvaluate}
            className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 transition-colors"
          >
            Evaluate
          </button>
        )}

        <button
          onClick={handleEdit}
          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
          title="Edit trial"
        >
          <Edit className="w-4 h-4" />
        </button>

        <button
          onClick={handleDelete}
          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
          title="Delete trial"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Request Connection */}
      {trial.request && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 bg-green-500 rounded-full" title={`Connected to request: ${trial.request.title}`} />
        </div>
      )}
    </div>
  )
}