'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Building2, Target, Calendar, ChevronRight, Clock, AlertCircle, CheckCircle2, Search, Filter } from 'lucide-react'
import { MainNav } from '@/components/main-nav'
import { WindowBadge } from '@/components/ui/WindowBadge'

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

export default function RequestsPage() {
  const params = useParams()
  const tenant = params.tenant as string

  const [requests, setRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [creatingTestData, setCreatingTestData] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club: '',
    position: ''
  })

  // Fetch requests
  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/requests?tenantId=tenant-test-1`)
      const result = await response.json()

      if (result.success) {
        setRequests(result.data)
      } else {
        console.error('Failed to fetch requests')
      }
    } catch (error) {
      console.error('Error fetching requests:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch('/api/requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenantId: 'tenant-test-1',
          ...formData
        })
      })

      const result = await response.json()

      if (result.success) {
        setRequests([result.data, ...requests])
        setFormData({ title: '', description: '', club: '', position: '' })
        setShowForm(false)
        alert('Request created successfully!')
      } else {
        alert('Failed to create request: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating request:', error)
      alert('Error creating request')
    }
  }

  const createTestData = async () => {
    try {
      setCreatingTestData(true)

      const response = await fetch('/api/test-window-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      })

      const result = await response.json()

      if (result.success) {
        alert(`Test data created! ${result.data.requestsCreated} requests with different window scenarios added.`)
        fetchRequests() // Refresh the list
      } else {
        alert('Failed to create test data: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating test data:', error)
      alert('Error creating test data')
    } finally {
      setCreatingTestData(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'in_progress': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1532] to-[#1e3a8a] p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-white text-lg">Loading requests...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#020617] via-[#0c1532] to-[#1e3a8a]">
      {/* Navigation */}
      <div className="border-b border-white/10 bg-white/5 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <MainNav tenant={tenant} />
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Scout Requests</h1>
            <p className="text-blue-200">Manage club requests and opportunities</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={createTestData}
              disabled={creatingTestData}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-4 py-3 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 disabled:opacity-50"
            >
              {creatingTestData ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
              ) : (
                <span className="text-lg">🧪</span>
              )}
              Test Data
            </button>
            <button
              onClick={() => setShowForm(!showForm)}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
            >
              <Plus className="w-5 h-5" />
              {showForm ? 'Cancel' : 'Add Request'}
            </button>
          </div>
        </div>

        {/* Add Request Form */}
        {showForm && (
          <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 mb-8">
            <h2 className="text-xl font-semibold text-white mb-6">Create New Request</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                    placeholder="e.g., Young striker for academy"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-white mb-2">
                    Club *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                    <input
                      type="text"
                      value={formData.club}
                      onChange={(e) => setFormData({ ...formData, club: e.target.value })}
                      className="w-full bg-white/10 border border-white/20 rounded-lg pl-11 pr-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                      placeholder="e.g., Arsenal FC"
                      required
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  rows={3}
                  placeholder="Detailed requirements and preferences..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Position
                </label>
                <div className="relative">
                  <Target className="absolute left-3 top-3 w-5 h-5 text-white/60" />
                  <select
                    value={formData.position}
                    onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    className="w-full bg-white/10 border border-white/20 rounded-lg pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm"
                  >
                    <option value="" className="bg-gray-800">Select position</option>
                    <option value="GK" className="bg-gray-800">Goalkeeper</option>
                    <option value="LB" className="bg-gray-800">Left Back</option>
                    <option value="LCB" className="bg-gray-800">Left Center Back</option>
                    <option value="CB" className="bg-gray-800">Center Back</option>
                    <option value="RCB" className="bg-gray-800">Right Center Back</option>
                    <option value="RB" className="bg-gray-800">Right Back</option>
                    <option value="LM" className="bg-gray-800">Left Midfielder</option>
                    <option value="LCM" className="bg-gray-800">Left Center Mid</option>
                    <option value="CM" className="bg-gray-800">Center Midfielder</option>
                    <option value="RCM" className="bg-gray-800">Right Center Mid</option>
                    <option value="RM" className="bg-gray-800">Right Midfielder</option>
                    <option value="LW" className="bg-gray-800">Left Winger</option>
                    <option value="CAM" className="bg-gray-800">Attacking Midfielder</option>
                    <option value="RW" className="bg-gray-800">Right Winger</option>
                    <option value="ST" className="bg-gray-800">Striker</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-lg hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Create Request
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="inline-flex items-center gap-2 bg-white/10 text-white px-6 py-3 rounded-lg hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {requests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-12">
                <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">No requests found</p>
                <p className="text-white/60">Create your first scout request to get started!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {requests.map((request) => (
                <div key={request.id} className="group">
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200 hover:border-white/30 hover:shadow-xl hover:shadow-blue-500/10">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-white group-hover:text-blue-200 transition-colors">
                            {request.title}
                          </h3>
                          <WindowBadge
                            windowOpenAt={request.windowOpenAt}
                            windowCloseAt={request.windowCloseAt}
                            graceDays={request.graceDays}
                            size="sm"
                          />
                        </div>
                        {request.description && (
                          <p className="text-white/70 mb-4 line-clamp-2">{request.description}</p>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/80 group-hover:translate-x-1 transition-all duration-200" />
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <Building2 className="w-4 h-4 text-white/60" />
                        <span className="text-white/80 font-medium">{request.club}</span>
                      </div>

                      {request.position && (
                        <div className="flex items-center gap-3">
                          <Target className="w-4 h-4 text-white/60" />
                          <span className="text-white/80">{request.position}</span>
                        </div>
                      )}

                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-white/60" />
                        <span className="text-white/80">
                          {new Date(request.createdAt).toLocaleDateString('sv-SE', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/10">
                      <div className="flex gap-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(request.status)}`}>
                          {request.status}
                        </span>
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${getPriorityColor(request.priority)}`}>
                          {request.priority}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-white/40">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs">
                          {new Date(request.updatedAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>
    </div>
  )
}