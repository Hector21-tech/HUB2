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
    <div className="bg-gradient-to-r from-[#FAF8F3] to-[#F8F6F0] border-b border-[#D7CCC8]/30">
      <div className="p-6">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#D4AF37] mb-2">
              Players
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#3E2723]/70">
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
          <div className="flex items-center gap-2 bg-white/50 rounded-lg p-1 border border-[#D7CCC8]/20">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'grid'
                  ? 'bg-[#D4AF37] text-white shadow-sm'
                  : 'text-[#3E2723]/60 hover:text-[#3E2723] hover:bg-white/50'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-2 rounded-md transition-all duration-200 ${
                viewMode === 'list'
                  ? 'bg-[#D4AF37] text-white shadow-sm'
                  : 'text-[#3E2723]/60 hover:text-[#3E2723] hover:bg-white/50'
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#3E2723]/40 w-5 h-5" />
            <input
              type="text"
              placeholder="Search players by name, club, or position..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3 bg-white/70 border border-[#D7CCC8]/30 rounded-xl
                text-[#3E2723] placeholder-[#3E2723]/50
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50
                transition-all duration-200
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
                px-4 py-3 bg-white/70 border border-[#D7CCC8]/30 rounded-xl
                text-[#3E2723] text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50
                transition-all duration-200
              "
            >
              <option value="">All Positions</option>
              <option value="Goalkeeper">Goalkeeper</option>
              <option value="Defender">Defender</option>
              <option value="Midfielder">Midfielder</option>
              <option value="Forward">Forward</option>
              <option value="Striker">Striker</option>
            </select>

            {/* Age Filter */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin || ''}
                onChange={(e) => handleFilterChange('ageMin', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3 bg-white/70 border border-[#D7CCC8]/30 rounded-xl
                  text-[#3E2723] text-sm placeholder-[#3E2723]/50
                  focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50
                  transition-all duration-200
                "
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax || ''}
                onChange={(e) => handleFilterChange('ageMax', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3 bg-white/70 border border-[#D7CCC8]/30 rounded-xl
                  text-[#3E2723] text-sm placeholder-[#3E2723]/50
                  focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50
                  transition-all duration-200
                "
              />
            </div>

            {/* Nationality Filter */}
            <select
              value={filters.nationality || ''}
              onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
              className="
                px-4 py-3 bg-white/70 border border-[#D7CCC8]/30 rounded-xl
                text-[#3E2723] text-sm font-medium
                focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/30 focus:border-[#D4AF37]/50
                transition-all duration-200
              "
            >
              <option value="">All Nationalities</option>
              <option value="England">England</option>
              <option value="Spain">Spain</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Brazil">Brazil</option>
              <option value="Argentina">Argentina</option>
              <option value="Portugal">Portugal</option>
              <option value="Netherlands">Netherlands</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="
                  px-4 py-3 bg-[#3E2723]/10 hover:bg-[#3E2723]/20 border border-[#3E2723]/20
                  text-[#3E2723] text-sm font-medium rounded-xl
                  transition-all duration-200 hover:shadow-sm
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
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-full border border-[#D4AF37]/20">
                Search: "{filters.search}"
                <button
                  onClick={() => handleFilterChange('search', undefined)}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.position && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-full border border-[#D4AF37]/20">
                Position: {filters.position}
                <button
                  onClick={() => handleFilterChange('position', undefined)}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37]"
                >
                  ×
                </button>
              </span>
            )}
            {filters.nationality && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-full border border-[#D4AF37]/20">
                Nationality: {filters.nationality}
                <button
                  onClick={() => handleFilterChange('nationality', undefined)}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37]"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.ageMin || filters.ageMax) && (
              <span className="inline-flex items-center gap-2 px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-sm rounded-full border border-[#D4AF37]/20">
                Age: {filters.ageMin || '0'}-{filters.ageMax || '99'}
                <button
                  onClick={() => {
                    handleFilterChange('ageMin', undefined)
                    handleFilterChange('ageMax', undefined)
                  }}
                  className="text-[#D4AF37]/60 hover:text-[#D4AF37]"
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