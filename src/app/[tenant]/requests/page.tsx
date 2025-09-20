'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { Plus, Building2, Target, Calendar, ChevronRight, Clock, AlertCircle, CheckCircle2, Search, Filter, Download } from 'lucide-react'
import { MainNav } from '@/components/main-nav'
import { WindowBadge } from '@/components/ui/WindowBadge'
import { AdvancedFilters } from '@/components/ui/AdvancedFilters'
import { RequestExporter } from '@/lib/export/request-export'

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
  const [selectedRequests, setSelectedRequests] = useState<Set<string>>(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [advancedFilters, setAdvancedFilters] = useState({
    search: '',
    status: [] as string[],
    priority: [] as string[],
    positions: [] as string[],
    clubs: [] as string[],
    countries: [] as string[],
    dateRange: { from: '', to: '' },
    windowStatus: [] as string[]
  })
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    club: '',
    position: ''
  })

  // Filter requests based on search term
  const filteredRequests = requests.filter(request => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    return (
      request.title.toLowerCase().includes(searchLower) ||
      request.description.toLowerCase().includes(searchLower) ||
      request.club.toLowerCase().includes(searchLower) ||
      (request.position && request.position.toLowerCase().includes(searchLower))
    )
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

  // Bulk selection functions
  const toggleRequestSelection = (requestId: string) => {
    const newSelected = new Set(selectedRequests)
    if (newSelected.has(requestId)) {
      newSelected.delete(requestId)
    } else {
      newSelected.add(requestId)
    }
    setSelectedRequests(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const selectAllRequests = () => {
    const allIds = new Set(requests.map(r => r.id))
    setSelectedRequests(allIds)
    setShowBulkActions(true)
  }

  const clearSelection = () => {
    setSelectedRequests(new Set())
    setShowBulkActions(false)
  }

  const bulkUpdateStatus = async (newStatus: string) => {
    if (selectedRequests.size === 0) return

    try {
      const updatePromises = Array.from(selectedRequests).map(requestId =>
        fetch(`/api/requests/${requestId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus })
        })
      )

      await Promise.all(updatePromises)

      // Update local state
      setRequests(requests.map(request =>
        selectedRequests.has(request.id)
          ? { ...request, status: newStatus }
          : request
      ))

      clearSelection()
      alert(`Updated ${selectedRequests.size} requests to ${newStatus}`)
    } catch (error) {
      console.error('Error updating requests:', error)
      alert('Failed to update requests')
    }
  }

  const bulkDelete = async () => {
    if (selectedRequests.size === 0) return

    const confirmed = confirm(`Delete ${selectedRequests.size} selected requests? This cannot be undone.`)
    if (!confirmed) return

    try {
      const deletePromises = Array.from(selectedRequests).map(requestId =>
        fetch(`/api/requests/${requestId}`, { method: 'DELETE' })
      )

      await Promise.all(deletePromises)

      // Update local state
      setRequests(requests.filter(request => !selectedRequests.has(request.id)))
      clearSelection()
      alert(`Deleted ${selectedRequests.size} requests`)
    } catch (error) {
      console.error('Error deleting requests:', error)
      alert('Failed to delete requests')
    }
  }

  // Export functions
  const exportSelected = (format: 'csv' | 'json' | 'summary') => {
    const selectedRequestsData = requests.filter(r => selectedRequests.has(r.id))
    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'csv':
        RequestExporter.exportToCSV(selectedRequestsData, `scout-requests-${timestamp}.csv`)
        break
      case 'json':
        RequestExporter.exportToJSON(selectedRequestsData, `scout-requests-${timestamp}.json`)
        break
      case 'summary':
        RequestExporter.exportSummaryReport(selectedRequestsData, `scout-requests-summary-${timestamp}.txt`)
        break
    }

    clearSelection()
  }

  const exportAll = (format: 'csv' | 'json' | 'summary') => {
    const timestamp = new Date().toISOString().split('T')[0]

    switch (format) {
      case 'csv':
        RequestExporter.exportToCSV(requests, `all-scout-requests-${timestamp}.csv`)
        break
      case 'json':
        RequestExporter.exportToJSON(requests, `all-scout-requests-${timestamp}.json`)
        break
      case 'summary':
        RequestExporter.exportSummaryReport(requests, `all-scout-requests-summary-${timestamp}.txt`)
        break
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
        {/* Header - Match Players Design */}
        <div className="relative z-40 bg-gradient-to-r from-[#020617]/60 via-[#0c1532]/50 via-[#1e3a8a]/40 to-[#0f1b3e]/60 border-b border-[#3B82F6]/40 backdrop-blur-xl">
          <div className="p-4 sm:p-6">
            {/* Title and Stats */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-3 sm:gap-0">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Scout Requests</h1>
                <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm text-white/70">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4" />
                    <span>{filteredRequests.length} requests</span>
                    {searchTerm && filteredRequests.length !== requests.length && (
                      <span className="text-xs text-white/50">of {requests.length}</span>
                    )}
                  </div>
                  {selectedRequests.size > 0 && (
                    <div className="flex items-center gap-2 text-blue-400">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{selectedRequests.size} selected</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
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
                  onClick={() => setShowAdvancedFilters(true)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-600 to-orange-700 text-white px-4 py-3 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-lg hover:shadow-orange-500/25"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {(advancedFilters.status.length > 0 || advancedFilters.priority.length > 0 || searchTerm) && (
                    <span className="bg-white/20 text-xs px-2 py-1 rounded-full">
                      {[...advancedFilters.status, ...advancedFilters.priority, searchTerm ? 'search' : ''].filter(Boolean).length}
                    </span>
                  )}
                </button>
                <div className="relative group">
                  <button className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-4 py-3 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-lg hover:shadow-green-500/25">
                    <Download className="w-5 h-5" />
                    Export All
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <button
                      onClick={() => exportAll('csv')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg whitespace-nowrap"
                    >
                      CSV File ({requests.length} requests)
                    </button>
                    <button
                      onClick={() => exportAll('json')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 whitespace-nowrap"
                    >
                      JSON File ({requests.length} requests)
                    </button>
                    <button
                      onClick={() => exportAll('summary')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg whitespace-nowrap"
                    >
                      Summary Report ({requests.length} requests)
                    </button>
                  </div>
                </div>
                <button
                  onClick={() => setShowForm(!showForm)}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-blue-500/25"
                >
                  <Plus className="w-5 h-5" />
                  {showForm ? 'Cancel' : 'Add Request'}
                </button>
              </div>
            </div>

            {/* Search Bar - Match Players Design */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search requests by title, club, position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="
                    w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-3 text-base
                    bg-white/5 backdrop-blur-sm
                    border border-white/20 rounded-lg
                    text-white placeholder-white/50
                    focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                    hover:border-white/30
                    transition-all duration-200
                  "
                />
              </div>
            </div>
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

        {/* Bulk Actions Toolbar */}
        {showBulkActions && (
          <div className="bg-blue-600/20 backdrop-blur-sm rounded-xl border border-blue-400/30 p-4 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className="text-white font-medium">
                  {selectedRequests.size} request{selectedRequests.size !== 1 ? 's' : ''} selected
                </span>
                <button
                  onClick={clearSelection}
                  className="text-blue-300 hover:text-white text-sm transition-colors"
                >
                  Clear selection
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-blue-200 text-sm">Change status:</span>
                  <select
                    onChange={(e) => e.target.value && bulkUpdateStatus(e.target.value)}
                    className="bg-blue-700/50 border border-blue-400/30 rounded-lg px-3 py-1 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                    defaultValue=""
                  >
                    <option value="">Select status...</option>
                    <option value="OPEN">Open</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="CANCELLED">Cancelled</option>
                    <option value="EXPIRED">Expired</option>
                  </select>
                </div>

                <div className="relative group">
                  <button className="bg-green-600/80 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm transition-colors flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Export Selected
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white rounded-lg shadow-lg border z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                    <button
                      onClick={() => exportSelected('csv')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      CSV File
                    </button>
                    <button
                      onClick={() => exportSelected('json')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                    >
                      JSON File
                    </button>
                    <button
                      onClick={() => exportSelected('summary')}
                      className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-b-lg"
                    >
                      Summary Report
                    </button>
                  </div>
                </div>

                <button
                  onClick={bulkDelete}
                  className="bg-red-600/80 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  Delete Selected
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Requests List */}
        <div className="space-y-4">
          {/* Select All Header */}
          {filteredRequests.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedRequests.size === filteredRequests.length && filteredRequests.length > 0}
                    onChange={(e) => e.target.checked ? selectAllRequests() : clearSelection()}
                    className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-2"
                  />
                  <span className="text-white/80 text-sm">
                    Select all ({filteredRequests.length} visible requests)
                  </span>
                </label>
                {selectedRequests.size > 0 && (
                  <span className="text-blue-300 text-sm">
                    • {selectedRequests.size} selected
                  </span>
                )}
              </div>
            </div>
          )}

          {filteredRequests.length === 0 && requests.length > 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-12">
                <Search className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">No requests match your search</p>
                <p className="text-white/60">Try different search terms or clear the search</p>
                <button
                  onClick={() => setSearchTerm('')}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Search
                </button>
              </div>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-12">
                <AlertCircle className="w-16 h-16 text-white/40 mx-auto mb-4" />
                <p className="text-white/80 text-lg mb-2">No requests found</p>
                <p className="text-white/60">Create your first scout request to get started!</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredRequests.map((request) => (
                <div key={request.id} className="group">
                  <div className={`bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/15 transition-all duration-200 hover:border-white/30 hover:shadow-xl hover:shadow-blue-500/10 ${
                    selectedRequests.has(request.id) ? 'ring-2 ring-blue-400/50 bg-blue-500/10' : ''
                  }`}>
                    {/* Checkbox */}
                    <div className="flex items-start gap-4">
                      <label className="flex items-center mt-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedRequests.has(request.id)}
                          onChange={() => toggleRequestSelection(request.id)}
                          className="w-4 h-4 rounded border-white/20 bg-white/10 text-blue-600 focus:ring-blue-500 focus:ring-2"
                        />
                      </label>

                      <div className="flex-1">
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        </div>
      </div>

      {/* Advanced Filters Modal */}
      {showAdvancedFilters && (
        <AdvancedFilters
          filters={advancedFilters}
          onFiltersChange={(newFilters) => {
            setAdvancedFilters(newFilters)
            // TODO: Apply filters to requests
          }}
          onClose={() => setShowAdvancedFilters(false)}
          availableClubs={Array.from(new Set(requests.map(r => r.club).filter(Boolean)))}
          availableCountries={[]}
        />
      )}
    </div>
  )
}