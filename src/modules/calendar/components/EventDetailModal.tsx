'use client'

import { CalendarEvent } from '../types/calendar'

interface EventDetailModalProps {
  event: CalendarEvent
  onClose: () => void
}

export function EventDetailModal({
  event,
  onClose
}: EventDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Event Details</h2>
        <div className="text-white/60">
          <p className="text-white text-lg font-medium mb-2">{event.title}</p>
          <p>Event details modal - Coming soon</p>
        </div>
        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}