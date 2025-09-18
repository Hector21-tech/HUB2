'use client'

import { useState, useMemo } from 'react'
import { useTrialsQuery } from '../hooks/useTrialsQuery'
import { useDeleteTrial } from '../hooks/useTrialMutations'
import { TrialsHeader } from './TrialsHeader'
import { TrialCard } from './TrialCard'
import { AddTrialModal } from './AddTrialModal'
import { TrialStatusBadge } from './TrialStatusBadge'
import { Trial, TrialFilters } from '../types/trial'
import { Calendar, MapPin, User, Edit, Trash2 } from 'lucide-react'
import { useAvatarUrl } from '../../players/hooks/useAvatarUrl'
import { getPlayerInitials } from '@/lib/formatters'

interface TrialsPageProps {
  tenantId: string
}

export function TrialsPage({ tenantId }: TrialsPageProps) {
  const [filters, setFilters] = useState<TrialFilters>({})
  const [selectedTrial, setSelectedTrial] = useState<Trial | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  // Fetch trials with filters
  const { data: trials = [], isLoading, error } = useTrialsQuery(tenantId, filters)
  const deleteTrial = useDeleteTrial(tenantId)

  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date()
    return {
      total: trials.length,
      upcoming: trials.filter(t =>
        t.status === 'SCHEDULED' && new Date(t.scheduledAt) > now
      ).length,
      completed: trials.filter(t => t.status === 'COMPLETED').length,
      pendingEvaluation: trials.filter(t =>
        t.status === 'COMPLETED' && !t.rating
      ).length
    }
  }, [trials])

  const handleAddTrial = () => {
    setShowAddModal(true)
  }

  const handleEditTrial = (trial: Trial) => {
    setSelectedTrial(trial)
    setShowAddModal(true)
  }

  const handleDeleteTrial = (trial: Trial) => {
    setShowDeleteConfirm(trial.id)
  }

  const confirmDelete = async () => {
    if (!showDeleteConfirm) return

    try {
      await deleteTrial.mutateAsync(showDeleteConfirm)
      setShowDeleteConfirm(null)
    } catch (error) {
      console.error('Failed to delete trial:', error)
      // TODO: Show error toast
    }
  }

  const handleEvaluateTrial = (trial: Trial) => {
    // TODO: Open evaluation modal
    console.log('Evaluate trial:', trial.id)
  }

  const handleTrialClick = (trial: Trial) => {
    // TODO: Open trial detail drawer
    console.log('View trial details:', trial.id)
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1532] via-[#1e3a8a] via-[#0f1b3e] to-[#020510] relative p-6">
        {/* Ultra-deep ocean effect with radial gradients */}
        <div className="absolute inset-0 bg-radial-gradient from-[#1e40af]/10 via-transparent to-[#0c1532]/20 pointer-events-none"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative">
          <div className="bg-red-500/20 border border-red-400/30 rounded-lg p-4 backdrop-blur-sm">
            <h3 className="text-red-300 font-medium">Error loading trials</h3>
            <p className="text-red-200 text-sm mt-1">
              There was a problem loading the trials. Please try again.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-[#020617] via-[#0c1532] via-[#1e3a8a] via-[#0f1b3e] to-[#020510] relative">
      {/* Ultra-deep ocean effect with radial gradients */}
      <div className="absolute inset-0 bg-radial-gradient from-[#1e40af]/10 via-transparent to-[#0c1532]/20 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-[#020617]/50 to-transparent pointer-events-none"></div>

      <div className="relative p-6">
        <div className="max-w-7xl mx-auto space-y-6">
        <TrialsHeader
          onAddTrial={handleAddTrial}
          onFiltersChange={setFilters}
          trialsCount={stats.total}
          upcomingCount={stats.upcoming}
          completedCount={stats.completed}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
        />

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 animate-pulse"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-white/20 rounded-full" />
                      <div className="space-y-2">
                        <div className="h-4 bg-white/20 rounded w-24" />
                        <div className="h-3 bg-white/20 rounded w-16" />
                      </div>
                    </div>
                    <div className="h-6 bg-white/20 rounded-full w-20" />
                  </div>
                  <div className="space-y-3">
                    <div className="h-4 bg-white/20 rounded w-full" />
                    <div className="h-4 bg-white/20 rounded w-3/4" />
                    <div className="h-4 bg-white/20 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Trials Content */}
          {!isLoading && trials.length > 0 && (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {trials.map((trial) => (
                  <TrialCard
                    key={trial.id}
                    trial={trial}
                    onEdit={handleEditTrial}
                    onDelete={handleDeleteTrial}
                    onEvaluate={handleEvaluateTrial}
                    onClick={handleTrialClick}
                  />
                ))}
              </div>
            ) : (
              /* List View */
              <div className="bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden">
                {/* Desktop List Header */}
                <div className="hidden lg:grid lg:grid-cols-12 gap-4 p-4 bg-white/10 backdrop-blur-md border-b border-white/20 text-sm font-medium text-white/60">
                  <div className="col-span-2">Player</div>
                  <div className="col-span-2">Date & Time</div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-2">Club</div>
                  <div className="col-span-2">Actions</div>
                </div>

                {/* List Items */}
                <div className="divide-y divide-white/20">
                  {trials.map((trial) => {
                    const playerName = trial.player
                      ? `${trial.player.firstName} ${trial.player.lastName}`
                      : 'Unknown Player'
                    const trialDate = new Date(trial.scheduledAt)
                    const isUpcoming = trialDate > new Date()

                    const formatDate = (date: Date) => {
                      return new Intl.DateTimeFormat('sv-SE', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }).format(date)
                    }

                    return (
                      <TrialListItem
                        key={trial.id}
                        trial={trial}
                        playerName={playerName}
                        trialDate={trialDate}
                        isUpcoming={isUpcoming}
                        formatDate={formatDate}
                        onTrialClick={handleTrialClick}
                        onEditTrial={handleEditTrial}
                        onDeleteTrial={handleDeleteTrial}
                      />
                    )
                  })}
                            <div>
                              <p className="font-medium text-white/90">{playerName}</p>
                              <p className="text-xs text-white/60">{trial.player?.position || 'N/A'}</p>
                            </div>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className={`text-sm ${
                              isUpcoming ? 'text-blue-400 font-medium' : 'text-white/90'
                            }`}>
                              {formatDate(trialDate)}
                            </span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-sm text-white/90 truncate">{trial.location || 'N/A'}</span>
                          </div>
                          <div className="col-span-2 flex items-center">
                            <TrialStatusBadge status={trial.status} size="sm" />
                          </div>
                          <div className="col-span-2 flex items-center">
                            <span className="text-sm text-white/90 truncate">{trial.player?.club || 'Free Agent'}</span>
                          </div>
                          <div className="col-span-2 flex items-center gap-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleEditTrial(trial)
                              }}
                              className="p-1 text-white/40 hover:text-blue-400 transition-colors"
                              title="Edit trial"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                handleDeleteTrial(trial)
                              }}
                              className="p-1 text-white/40 hover:text-red-400 transition-colors"
                              title="Delete trial"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Mobile Layout */}
                        <div className="lg:hidden p-4">
                          <div className="flex items-start gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-lg flex items-center justify-center overflow-hidden flex-shrink-0">
                              {/* TODO: Add avatar implementation here */}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <p className="font-medium text-white/90 truncate">{playerName}</p>
                                  <p className="text-sm text-white/60">{trial.player?.position || 'N/A'}</p>
                                </div>
                                <TrialStatusBadge status={trial.status} size="sm" />
                              </div>
                              <div className="mt-2 space-y-1">
                                <p className="text-sm text-white/70">
                                  <Calendar className="w-3 h-3 inline mr-1" />
                                  {formatDate(trialDate)}
                                </p>
                                {trial.location && (
                                  <p className="text-sm text-white/70">
                                    <MapPin className="w-3 h-3 inline mr-1" />
                                    {trial.location}
                                  </p>
                                )}
                                {trial.player?.club && (
                                  <p className="text-sm text-white/70">
                                    <User className="w-3 h-3 inline mr-1" />
                                    {trial.player.club}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          )}

          {/* Empty State */}
          {!isLoading && trials.length === 0 && (
            <div className="text-center py-12">
              <div className="max-w-md mx-auto">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-white/60"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  No trials found
                </h3>
                <p className="text-white/70 mb-6">
                  {Object.keys(filters).length > 0
                    ? 'No trials match your current filters. Try adjusting your search criteria.'
                    : 'Get started by scheduling your first trial session with a player.'
                  }
                </p>
                <button
                  onClick={handleAddTrial}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg"
                >
                  Schedule Trial
                </button>
              </div>
            </div>
          )}

          {/* Pending Evaluation Banner */}
          {stats.pendingEvaluation > 0 && (
            <div className="fixed bottom-6 right-6 bg-yellow-500/90 backdrop-blur-sm text-white p-4 rounded-lg shadow-xl border border-yellow-400/30">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 bg-yellow-600 rounded-full flex items-center justify-center text-sm font-bold">
                  {stats.pendingEvaluation}
                </div>
                <div>
                  <p className="font-medium">Evaluations Pending</p>
                  <p className="text-sm opacity-90">
                    {stats.pendingEvaluation} completed trial{stats.pendingEvaluation > 1 ? 's' : ''} need evaluation
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-[#020617] via-[#0c1532] to-[#1e3a8a] rounded-lg max-w-md w-full p-6 border border-white/20 backdrop-blur-sm">
            <h3 className="text-lg font-medium text-white mb-2">
              Delete Trial
            </h3>
            <p className="text-white/70 mb-6">
              Are you sure you want to delete this trial? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="px-4 py-2 text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleteTrial.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 shadow-lg"
              >
                {deleteTrial.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Trial Modal */}
      {showAddModal && (
        <AddTrialModal
          isOpen={showAddModal}
          trial={selectedTrial}
          onClose={() => {
            setShowAddModal(false)
            setSelectedTrial(null)
          }}
          tenantId={tenantId}
        />
      )}
    </div>
  )
}