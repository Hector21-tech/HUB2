'use client'

import { Search, Filter, Users, Grid, List } from 'lucide-react'
import { PlayerFilters } from '../types/player'

interface PlayersHeaderProps {
  filters: PlayerFilters
  onFiltersChange: (filters: PlayerFilters) => void
  totalPlayers: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
  onAddPlayer: () => void
}

export function PlayersHeader({
  filters,
  onFiltersChange,
  totalPlayers,
  viewMode,
  onViewModeChange,
  onAddPlayer
}: PlayersHeaderProps) {
  const handleSearchChange = (search: string) => {
    onFiltersChange({ ...filters, search })
  }

  const handleFilterChange = (key: keyof PlayerFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearFilters = () => {
    onFiltersChange({})
  }

  const activeFiltersCount = Object.keys(filters).filter(
    key => filters[key as keyof PlayerFilters] !== undefined && filters[key as keyof PlayerFilters] !== ''
  ).length

  return (
    <div className="bg-gradient-to-r from-[#020617]/60 via-[#0c1532]/50 via-[#1e3a8a]/40 to-[#0f1b3e]/60 border-b border-[#3B82F6]/40 backdrop-blur-xl">
      <div className="p-6">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-semibold text-white/90 mb-2">
              Players
            </h1>
            <div className="flex items-center gap-4 text-sm text-white/70">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalPlayers} players</span>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 text-blue-400">
                  <Filter className="w-4 h-4" />
                  <span>{activeFiltersCount} filters active</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Add Player Button */}
            <button
              onClick={onAddPlayer}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl flex items-center gap-2"
            >
              <Users className="w-5 h-5" />
              Add Player
            </button>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-lg p-1 border border-white/20">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
            </div>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Field */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/60 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players by name, club, or position..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3
                bg-white/5 backdrop-blur-sm
                border border-white/20 rounded-lg
                text-white placeholder-white/50
                focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                hover:border-white/30
                transition-all duration-200
              "
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Position Filter */}
            <div className="relative">
              <select
                value={filters.position || ''}
                onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
                className="
                  px-4 py-3 pr-10
                  bg-white/5 backdrop-blur-sm
                  border border-white/20 rounded-lg
                  text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                  hover:border-white/30
                  transition-all duration-200 cursor-pointer
                  appearance-none w-full
                "
              >
              <option value="" className="bg-slate-800 text-white">All Positions</option>
              <option value="Goalkeeper" className="bg-slate-800 text-white">Goalkeeper</option>
              <option value="Defender" className="bg-slate-800 text-white">Defender</option>
              <option value="Midfielder" className="bg-slate-800 text-white">Midfielder</option>
              <option value="Forward" className="bg-slate-800 text-white">Forward</option>
              <option value="Striker" className="bg-slate-800 text-white">Striker</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Age Filter */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin || ''}
                onChange={(e) => handleFilterChange('ageMin', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3
                  bg-white/5 backdrop-blur-sm
                  border border-white/20 rounded-lg
                  text-white text-sm placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                  hover:border-white/30
                  transition-all duration-200
                "
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax || ''}
                onChange={(e) => handleFilterChange('ageMax', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3
                  bg-white/5 backdrop-blur-sm
                  border border-white/20 rounded-lg
                  text-white text-sm placeholder-white/50
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                  hover:border-white/30
                  transition-all duration-200
                "
              />
            </div>

            {/* Nationality Filter */}
            <div className="relative">
              <select
                value={filters.nationality || ''}
                onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
                className="
                  px-4 py-3 pr-10
                  bg-white/5 backdrop-blur-sm
                  border border-white/20 rounded-lg
                  text-white text-sm
                  focus:outline-none focus:ring-2 focus:ring-blue-400/20 focus:border-blue-400
                  hover:border-white/30
                  transition-all duration-200 cursor-pointer
                  appearance-none w-full
                "
              >
              <option value="" className="bg-slate-800 text-white">All Nationalities</option>
              <option value="England" className="bg-slate-800 text-white">England</option>
              <option value="Spain" className="bg-slate-800 text-white">Spain</option>
              <option value="Germany" className="bg-slate-800 text-white">Germany</option>
              <option value="France" className="bg-slate-800 text-white">France</option>
              <option value="Brazil" className="bg-slate-800 text-white">Brazil</option>
              <option value="Argentina" className="bg-slate-800 text-white">Argentina</option>
              <option value="Portugal" className="bg-slate-800 text-white">Portugal</option>
              <option value="Netherlands" className="bg-slate-800 text-white">Netherlands</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="w-4 h-4 text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="
                  px-4 py-3
                  bg-white/10 backdrop-blur-sm
                  border border-white/20 text-white text-sm rounded-lg
                  hover:bg-white/15 hover:border-white/30
                  transition-all duration-200 cursor-pointer
                "
              >
                Clear Filters
              </button>
            )}
          </div>
        </div>

        {/* Active Filters Display */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {filters.search && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="text-blue-400/70 hover:text-blue-400 transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.position && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                Position: {filters.position}
                <button
                  onClick={() => handleFilterChange('position', undefined)}
                  className="text-blue-400/70 hover:text-blue-400 transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.nationality && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                Nationality: {filters.nationality}
                <button
                  onClick={() => handleFilterChange('nationality', undefined)}
                  className="text-blue-400/70 hover:text-blue-400 transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.ageMin || filters.ageMax) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 text-sm rounded-full border border-blue-500/30">
                Age: {filters.ageMin || '0'}-{filters.ageMax || '99'}
                <button
                  onClick={() => {
                    handleFilterChange('ageMin', undefined)
                    handleFilterChange('ageMax', undefined)
                  }}
                  className="text-blue-400/70 hover:text-blue-400 transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}