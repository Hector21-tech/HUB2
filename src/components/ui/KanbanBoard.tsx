'use client'

import { useState } from 'react'
import { Building2, Target, Calendar, Clock, AlertTriangle, CheckCircle2, XCircle, MoreVertical } from 'lucide-react'
import { WindowBadge } from './WindowBadge'

interface Request {
  id: string
  title: string
  description: string
  club: string
  position: string | null
  status: string
  priority: string
  createdAt: string
  updatedAt: string
  windowOpenAt?: string | null
  windowCloseAt?: string | null
  deadline?: string | null
  graceDays?: number
}

interface KanbanBoardProps {
  requests: Request[]
  onRequestUpdate: (requestId: string, newStatus: string) => void
  onRequestSelect: (requestId: string) => void
  selectedRequests: Set<string>
}

const BOARD_COLUMNS = [
  {
    id: 'OPEN',
    title: 'New',
    color: 'bg-blue-500',
    bgColor: 'bg-blue-50 border-blue-200',
    description: 'Recently received requests'
  },
  {
    id: 'IN_PROGRESS',
    title: 'In Progress',
    color: 'bg-yellow-500',
    bgColor: 'bg-yellow-50 border-yellow-200',
    description: 'Active negotiations'
  },
  {
    id: 'OFFER_SENT',
    title: 'Offer Sent',
    color: 'bg-orange-500',
    bgColor: 'bg-orange-50 border-orange-200',
    description: 'Waiting for response'
  },
  {
    id: 'AGREEMENT',
    title: 'Agreement',
    color: 'bg-purple-500',
    bgColor: 'bg-purple-50 border-purple-200',
    description: 'Terms agreed upon'
  },
  {
    id: 'COMPLETED',
    title: 'Won',
    color: 'bg-green-500',
    bgColor: 'bg-green-50 border-green-200',
    description: 'Successfully completed'
  },
  {
    id: 'CANCELLED',
    title: 'Lost',
    color: 'bg-red-500',
    bgColor: 'bg-red-50 border-red-200',
    description: 'Deal fell through'
  }
]

export function KanbanBoard({ requests, onRequestUpdate, onRequestSelect, selectedRequests }: KanbanBoardProps) {
  const [draggedRequest, setDraggedRequest] = useState<string | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const getRequestsByStatus = (status: string) => {
    return requests.filter(request => request.status === status)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'border-l-red-500 bg-red-50/50'
      case 'high': return 'border-l-orange-500 bg-orange-50/50'
      case 'medium': return 'border-l-blue-500 bg-blue-50/50'
      case 'low': return 'border-l-gray-500 bg-gray-50/50'
      default: return 'border-l-gray-500 bg-gray-50/50'
    }
  }

  const handleDragStart = (e: React.DragEvent, requestId: string) => {
    setDraggedRequest(requestId)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnId)
  }

  const handleDragLeave = () => {
    setDragOverColumn(null)
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedRequest && draggedRequest !== newStatus) {
      onRequestUpdate(draggedRequest, newStatus)
    }
    setDraggedRequest(null)
    setDragOverColumn(null)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('sv-SE', {
      month: 'short',
      day: 'numeric'
    })
  }

  return (
    <div className="flex gap-6 overflow-x-auto pb-6">
      {BOARD_COLUMNS.map(column => {
        const columnRequests = getRequestsByStatus(column.id)
        const isDropTarget = dragOverColumn === column.id

        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-80 ${column.bgColor} rounded-lg border-2 transition-all duration-200 ${
              isDropTarget ? 'border-blue-400 bg-blue-50' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            {/* Column Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-gray-900">{column.title}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded-full">
                    {columnRequests.length}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-600">{column.description}</p>
            </div>

            {/* Column Content */}
            <div className="p-3 space-y-3 min-h-[400px]">
              {columnRequests.map(request => (
                <div
                  key={request.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, request.id)}
                  className={`bg-white rounded-lg border-l-4 shadow-sm hover:shadow-md transition-all duration-200 cursor-move ${
                    getPriorityColor(request.priority)
                  } ${
                    selectedRequests.has(request.id) ? 'ring-2 ring-blue-400 shadow-lg' : ''
                  } ${
                    draggedRequest === request.id ? 'opacity-50 rotate-2' : ''
                  }`}
                  onClick={() => onRequestSelect(request.id)}
                >
                  <div className="p-4">
                    {/* Card Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 text-sm line-clamp-2 mb-1">
                          {request.title}
                        </h4>
                        <div className="flex items-center gap-2 mb-2">
                          <WindowBadge
                            windowOpenAt={request.windowOpenAt}
                            windowCloseAt={request.windowCloseAt}
                            graceDays={request.graceDays}
                            size="sm"
                          />
                        </div>
                      </div>
                      <button className="p-1 hover:bg-gray-100 rounded">
                        <MoreVertical className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>

                    {/* Card Content */}
                    <div className="space-y-2 text-xs text-gray-600">
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3 h-3" />
                        <span className="truncate">{request.club}</span>
                      </div>

                      {request.position && (
                        <div className="flex items-center gap-2">
                          <Target className="w-3 h-3" />
                          <span>{request.position}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(request.createdAt)}</span>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-100">
                      <div className="flex items-center gap-1">
                        {request.priority === 'URGENT' && (
                          <AlertTriangle className="w-3 h-3 text-red-500" />
                        )}
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          request.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                          request.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                          request.priority === 'MEDIUM' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {request.priority}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {formatDate(request.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* Empty State */}
              {columnRequests.length === 0 && (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-gray-100 flex items-center justify-center">
                      {column.id === 'COMPLETED' ? <CheckCircle2 className="w-6 h-6" /> :
                       column.id === 'CANCELLED' ? <XCircle className="w-6 h-6" /> :
                       <Clock className="w-6 h-6" />}
                    </div>
                    <p className="text-xs">No requests</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}