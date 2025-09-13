'use client'

import { Search, Filter, Users, Grid, List } from 'lucide-react'
import { PlayerFilters } from '../types/player'

interface PlayersHeaderProps {
  filters: PlayerFilters
  onFiltersChange: (filters: PlayerFilters) => void
  totalPlayers: number
  viewMode: 'grid' | 'list'
  onViewModeChange: (mode: 'grid' | 'list') => void
}

export function PlayersHeader({
  filters,
  onFiltersChange,
  totalPlayers,
  viewMode,
  onViewModeChange
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
    <div className="bg-gradient-to-r from-[#1e3a8a]/20 to-[#3b82f6]/20 border-b border-[#FFD700]/20 backdrop-blur-sm">
      <div className="p-6">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#FFD700] mb-2 drop-shadow-lg">
              Players
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#f1f5f9]/80">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalPlayers} players</span>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  <span>{activeFiltersCount} filters active</span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#f1f5f9]/10 to-[#e2e8f0]/10 backdrop-blur-sm rounded-lg p-1 border border-[#FFD700]/20">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1e3a8a] shadow-lg font-semibold'
                  : 'text-[#f1f5f9]/60 hover:text-[#f1f5f9] hover:bg-[#f1f5f9]/10'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-[#1e3a8a] shadow-lg font-semibold'
                  : 'text-[#f1f5f9]/60 hover:text-[#f1f5f9] hover:bg-[#f1f5f9]/10'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search and Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search Field */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFD700]/70 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players by name, club, or position..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 bg-gradient-to-r from-[#f1f5f9]/10 to-[#e2e8f0]/10 backdrop-blur-sm
                border border-[#FFD700]/30 rounded-xl
                text-[#f1f5f9] placeholder-[#f1f5f9]/60
                focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/70
                focus:bg-[#f1f5f9]/20 transition-all duration-200
              "
            />
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-3">
            {/* Position Filter */}
            <select
              value={filters.position || ''}
              onChange={(e) => handleFilterChange('position', e.target.value || undefined)}
              className="
                px-4 py-3 bg-gradient-to-r from-[#f1f5f9]/20 to-[#e2e8f0]/20 backdrop-blur-sm
                border border-[#FFD700]/30 rounded-xl
                text-[#f1f5f9] text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/70
                focus:bg-gradient-to-r focus:from-[#f1f5f9]/30 focus:to-[#e2e8f0]/30
                transition-all duration-200
              "
            >
              <option value="" className="bg-[#1e3a8a] text-[#f1f5f9]">All Positions</option>
              <option value="Goalkeeper" className="bg-[#1e3a8a] text-[#f1f5f9]">Goalkeeper</option>
              <option value="Defender" className="bg-[#1e3a8a] text-[#f1f5f9]">Defender</option>
              <option value="Midfielder" className="bg-[#1e3a8a] text-[#f1f5f9]">Midfielder</option>
              <option value="Forward" className="bg-[#1e3a8a] text-[#f1f5f9]">Forward</option>
              <option value="Striker" className="bg-[#1e3a8a] text-[#f1f5f9]">Striker</option>
            </select>

            {/* Age Filter */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin || ''}
                onChange={(e) => handleFilterChange('ageMin', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3 bg-gradient-to-r from-[#f1f5f9]/20 to-[#e2e8f0]/20 backdrop-blur-sm
                  border border-[#FFD700]/30 rounded-xl
                  text-[#f1f5f9] text-sm placeholder-[#f1f5f9]/60
                  focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/70
                  focus:bg-gradient-to-r focus:from-[#f1f5f9]/30 focus:to-[#e2e8f0]/30
                  transition-all duration-200
                "
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax || ''}
                onChange={(e) => handleFilterChange('ageMax', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3 bg-gradient-to-r from-[#f1f5f9]/20 to-[#e2e8f0]/20 backdrop-blur-sm
                  border border-[#FFD700]/30 rounded-xl
                  text-[#f1f5f9] text-sm placeholder-[#f1f5f9]/60
                  focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/70
                  focus:bg-gradient-to-r focus:from-[#f1f5f9]/30 focus:to-[#e2e8f0]/30
                  transition-all duration-200
                "
              />
            </div>

            {/* Nationality Filter */}
            <select
              value={filters.nationality || ''}
              onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
              className="
                px-4 py-3 bg-gradient-to-r from-[#f1f5f9]/20 to-[#e2e8f0]/20 backdrop-blur-sm
                border border-[#FFD700]/30 rounded-xl
                text-[#f1f5f9] text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[#FFD700]/50 focus:border-[#FFD700]/70
                focus:bg-gradient-to-r focus:from-[#f1f5f9]/30 focus:to-[#e2e8f0]/30
                transition-all duration-200
              "
            >
              <option value="" className="bg-[#1e3a8a] text-[#f1f5f9]">All Nationalities</option>
              <option value="England" className="bg-[#1e3a8a] text-[#f1f5f9]">England</option>
              <option value="Spain" className="bg-[#1e3a8a] text-[#f1f5f9]">Spain</option>
              <option value="Germany" className="bg-[#1e3a8a] text-[#f1f5f9]">Germany</option>
              <option value="France" className="bg-[#1e3a8a] text-[#f1f5f9]">France</option>
              <option value="Brazil" className="bg-[#1e3a8a] text-[#f1f5f9]">Brazil</option>
              <option value="Argentina" className="bg-[#1e3a8a] text-[#f1f5f9]">Argentina</option>
              <option value="Portugal" className="bg-[#1e3a8a] text-[#f1f5f9]">Portugal</option>
              <option value="Netherlands" className="bg-[#1e3a8a] text-[#f1f5f9]">Netherlands</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="
                  px-4 py-3 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 hover:bg-gradient-to-r hover:from-[#FFD700]/30 hover:to-[#FFA500]/20
                  border border-[#FFD700]/40 text-[#FFD700] text-sm font-medium rounded-xl
                  transition-all duration-200 hover:shadow-lg hover:shadow-[#FFD700]/20 backdrop-blur-sm
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
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 text-[#FFD700] text-sm rounded-full border border-[#FFD700]/30 backdrop-blur-sm">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="text-[#FFD700]/70 hover:text-[#FFD700] transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.position && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 text-[#FFD700] text-sm rounded-full border border-[#FFD700]/30 backdrop-blur-sm">
                Position: {filters.position}
                <button
                  onClick={() => handleFilterChange('position', undefined)}
                  className="text-[#FFD700]/70 hover:text-[#FFD700] transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {filters.nationality && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 text-[#FFD700] text-sm rounded-full border border-[#FFD700]/30 backdrop-blur-sm">
                Nationality: {filters.nationality}
                <button
                  onClick={() => handleFilterChange('nationality', undefined)}
                  className="text-[#FFD700]/70 hover:text-[#FFD700] transition-colors duration-200"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.ageMin || filters.ageMax) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-[#FFD700]/20 to-[#FFA500]/10 text-[#FFD700] text-sm rounded-full border border-[#FFD700]/30 backdrop-blur-sm">
                Age: {filters.ageMin || '0'}-{filters.ageMax || '99'}
                <button
                  onClick={() => {
                    handleFilterChange('ageMin', undefined)
                    handleFilterChange('ageMax', undefined)
                  }}
                  className="text-[#FFD700]/70 hover:text-[#FFD700] transition-colors duration-200"
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