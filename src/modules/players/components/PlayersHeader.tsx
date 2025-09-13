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
    <div className="bg-gradient-to-r from-[#020617]/60 via-[#0c1532]/50 via-[#1e3a8a]/40 to-[#0f1b3e]/60 border-b border-[#FFD700]/40 backdrop-blur-xl">
      <div className="p-6">
        {/* Title and Stats */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#FFD700] mb-2 drop-shadow-[0_4px_8px_rgba(255,215,0,0.3)]">
              Players
            </h1>
            <div className="flex items-center gap-4 text-sm text-[#f8fafc]/90 font-medium">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span>{totalPlayers} players</span>
              </div>
              {activeFiltersCount > 0 && (
                <div className="flex items-center gap-2 text-[#FFD700]/90">
                  <Filter className="w-4 h-4" />
                  <span>{activeFiltersCount} filters active</span>
                </div>
              )}
            </div>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg rounded-xl p-2 border border-[#FFD700]/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_4px_16px_rgba(255,215,0,0.1)]">
            <button
              onClick={() => onViewModeChange('grid')}
              className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                viewMode === 'grid'
                  ? 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0c1532] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_16px_rgba(255,215,0,0.4)] border border-[#FFD700]/80'
                  : 'bg-gradient-to-r from-[#f8fafc]/10 via-[#e5e7eb]/15 to-[#d1d5db]/10 text-[#f8fafc]/80 hover:text-[#f8fafc] hover:bg-gradient-to-r hover:from-[#f8fafc]/20 hover:via-[#e5e7eb]/25 hover:to-[#d1d5db]/20 border border-[#FFD700]/30 hover:border-[#FFD700]/50 backdrop-blur-md'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => onViewModeChange('list')}
              className={`p-3 rounded-xl transition-all duration-300 ease-out ${
                viewMode === 'list'
                  ? 'bg-gradient-to-r from-[#FFD700] via-[#FFA500] to-[#FFD700] text-[#0c1532] font-bold shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_16px_rgba(255,215,0,0.4)] border border-[#FFD700]/80'
                  : 'bg-gradient-to-r from-[#f8fafc]/10 via-[#e5e7eb]/15 to-[#d1d5db]/10 text-[#f8fafc]/80 hover:text-[#f8fafc] hover:bg-gradient-to-r hover:from-[#f8fafc]/20 hover:via-[#e5e7eb]/25 hover:to-[#d1d5db]/20 border border-[#FFD700]/30 hover:border-[#FFD700]/50 backdrop-blur-md'
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
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-[#FFD700]/80 w-5 h-5 drop-shadow-sm" />
            <input
              type="text"
              placeholder="Search players by name, club, or position..."
              value={filters.search || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="
                w-full pl-12 pr-4 py-3
                bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg
                border border-[#FFD700]/40 rounded-xl
                text-[#f8fafc] placeholder-[#f8fafc]/70 font-medium
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(255,215,0,0.1)]
                focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700]/80
                focus:bg-gradient-to-r focus:from-[#f8fafc]/25 focus:via-[#e5e7eb]/30 focus:to-[#d1d5db]/25
                focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(255,215,0,0.4)]
                transition-all duration-300 ease-out
                hover:border-[#FFD700]/60 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_24px_rgba(255,215,0,0.2)]
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
                px-4 py-3
                bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg
                border border-[#FFD700]/40 rounded-xl
                text-[#f8fafc] text-sm font-bold
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(255,215,0,0.1)]
                focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700]/80
                focus:bg-gradient-to-r focus:from-[#f8fafc]/25 focus:via-[#e5e7eb]/30 focus:to-[#d1d5db]/25
                focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(255,215,0,0.4)]
                hover:border-[#FFD700]/60 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_24px_rgba(255,215,0,0.2)]
                transition-all duration-300 ease-out cursor-pointer
              "
            >
              <option value="" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">All Positions</option>
              <option value="Goalkeeper" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Goalkeeper</option>
              <option value="Defender" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Defender</option>
              <option value="Midfielder" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Midfielder</option>
              <option value="Forward" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Forward</option>
              <option value="Striker" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Striker</option>
            </select>

            {/* Age Filter */}
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min Age"
                value={filters.ageMin || ''}
                onChange={(e) => handleFilterChange('ageMin', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3
                  bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg
                  border border-[#FFD700]/40 rounded-xl
                  text-[#f8fafc] text-sm font-bold placeholder-[#f8fafc]/70
                  shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(255,215,0,0.1)]
                  focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700]/80
                  focus:bg-gradient-to-r focus:from-[#f8fafc]/25 focus:via-[#e5e7eb]/30 focus:to-[#d1d5db]/25
                  focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(255,215,0,0.4)]
                  hover:border-[#FFD700]/60 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_24px_rgba(255,215,0,0.2)]
                  transition-all duration-300 ease-out
                "
              />
              <input
                type="number"
                placeholder="Max Age"
                value={filters.ageMax || ''}
                onChange={(e) => handleFilterChange('ageMax', e.target.value ? Number(e.target.value) : undefined)}
                className="
                  w-24 px-3 py-3
                  bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg
                  border border-[#FFD700]/40 rounded-xl
                  text-[#f8fafc] text-sm font-bold placeholder-[#f8fafc]/70
                  shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(255,215,0,0.1)]
                  focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700]/80
                  focus:bg-gradient-to-r focus:from-[#f8fafc]/25 focus:via-[#e5e7eb]/30 focus:to-[#d1d5db]/25
                  focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(255,215,0,0.4)]
                  hover:border-[#FFD700]/60 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_24px_rgba(255,215,0,0.2)]
                  transition-all duration-300 ease-out
                "
              />
            </div>

            {/* Nationality Filter */}
            <select
              value={filters.nationality || ''}
              onChange={(e) => handleFilterChange('nationality', e.target.value || undefined)}
              className="
                px-4 py-3
                bg-gradient-to-r from-[#f8fafc]/15 via-[#e5e7eb]/20 to-[#d1d5db]/15 backdrop-blur-lg
                border border-[#FFD700]/40 rounded-xl
                text-[#f8fafc] text-sm font-bold
                shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_4px_16px_rgba(255,215,0,0.1)]
                focus:outline-none focus:ring-4 focus:ring-[#FFD700]/30 focus:border-[#FFD700]/80
                focus:bg-gradient-to-r focus:from-[#f8fafc]/25 focus:via-[#e5e7eb]/30 focus:to-[#d1d5db]/25
                focus:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_8px_32px_rgba(255,215,0,0.4)]
                hover:border-[#FFD700]/60 hover:shadow-[inset_0_2px_4px_rgba(0,0,0,0.1),0_6px_24px_rgba(255,215,0,0.2)]
                transition-all duration-300 ease-out cursor-pointer
              "
            >
              <option value="" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">All Nationalities</option>
              <option value="England" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">England</option>
              <option value="Spain" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Spain</option>
              <option value="Germany" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Germany</option>
              <option value="France" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">France</option>
              <option value="Brazil" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Brazil</option>
              <option value="Argentina" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Argentina</option>
              <option value="Portugal" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Portugal</option>
              <option value="Netherlands" className="bg-gradient-to-r from-[#0c1532] to-[#1e3a8a] text-[#f8fafc] font-medium">Netherlands</option>
            </select>

            {/* Clear Filters */}
            {activeFiltersCount > 0 && (
              <button
                onClick={clearFilters}
                className="
                  px-6 py-3
                  bg-gradient-to-r from-[#FFD700]/25 via-[#FFA500]/20 to-[#FFD700]/15 backdrop-blur-lg
                  border border-[#FFD700]/50 text-[#FFD700] text-sm font-bold rounded-xl
                  shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_4px_16px_rgba(255,215,0,0.2)]
                  hover:bg-gradient-to-r hover:from-[#FFD700] hover:via-[#FFA500] hover:to-[#FFD700]
                  hover:text-[#0c1532] hover:border-[#FFD700]/80
                  hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_8px_32px_rgba(255,215,0,0.5)]
                  active:scale-[0.98] active:shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]
                  transition-all duration-300 ease-out cursor-pointer
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