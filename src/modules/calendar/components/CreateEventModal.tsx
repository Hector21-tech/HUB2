'use client'

interface CreateEventModalProps {
  tenantId: string
  initialDate?: Date | null
  onClose: () => void
}

export function CreateEventModal({
  tenantId,
  initialDate,
  onClose
}: CreateEventModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border border-white/20 rounded-xl p-6 w-full max-w-lg">
        <h2 className="text-xl font-semibold text-white mb-4">Create Event</h2>
        <div className="text-center text-white/60">
          <p>Event creation modal - Coming soon</p>
          <p className="text-sm mt-2">Initial date: {initialDate?.toLocaleDateString()}</p>
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