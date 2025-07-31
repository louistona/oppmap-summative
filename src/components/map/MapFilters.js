import React, { useState } from 'react'
import { Filter, X, Search } from 'lucide-react'
import { 
  CHALLENGE_CATEGORIES, 
  CATEGORY_LABELS, 
  SEVERITY_LEVELS, 
  SEVERITY_LABELS 
} from '../../utils/constants'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const MapFilters = ({ filters, onFiltersChange, onClearFilters }) => {
  const [isExpanded, setIsExpanded] = useState(false)
  const [searchTerm, setSearchTerm] = useState(filters.search || '')

  const handleFilterChange = (key, value) => {
    onFiltersChange({ [key]: value })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchTerm(value)
    // Debounced search
    clearTimeout(window.searchTimeout)
    window.searchTimeout = setTimeout(() => {
      handleFilterChange('search', value)
    }, 300)
  }

  const handleClearFilters = () => {
    setSearchTerm('')
    onClearFilters()
  }

  const hasActiveFilters = Object.values(filters).some(value => value)

  return (
    <div className="map-filters">
      <div className="map-filters-header">
        <h3 className="map-filters-title flex items-center">
          <Filter className="w-4 h-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <span className="ml-2 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
              Active
            </span>
          )}
        </h3>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="map-filters-toggle"
        >
          {isExpanded ? <X className="w-4 h-4" /> : <Filter className="w-4 h-4" />}
        </button>
      </div>

      {isExpanded && (
        <div className="map-filters-body">
          {/* Search */}
          <div className="map-filter-group">
            <label className="map-filter-label">Search</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search by title or region..."
                value={searchTerm}
                onChange={handleSearchChange}
                className="map-filter-select pl-8"
              />
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            </div>
          </div>

          {/* Category Filter */}
          <div className="map-filter-group">
            <label className="map-filter-label">Category</label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value || null)}
              className="map-filter-select"
            >
              <option value="">All Categories</option>
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Severity Filter */}
          <div className="map-filter-group">
            <label className="map-filter-label">Minimum Severity</label>
            <select
              value={filters.severity || ''}
              onChange={(e) => handleFilterChange('severity', e.target.value ? parseInt(e.target.value) : null)}
              className="map-filter-select"
            >
              <option value="">All Severities</option>
              {Object.entries(SEVERITY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label} ({value})
                </option>
              ))}
            </select>
          </div>

          {/* Category Checkboxes (Alternative view) */}
          <div className="map-filter-group">
            <label className="map-filter-label">Show Categories</label>
            <div className="map-filter-checkbox-group">
              {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                <div key={value} className="map-filter-checkbox">
                  <input
                    type="checkbox"
                    id={`category-${value}`}
                    checked={!filters.category || filters.category === value}
                    onChange={(e) => {
                      if (e.target.checked && filters.category) {
                        handleFilterChange('category', null)
                      } else if (!e.target.checked && !filters.category) {
                        // If unchecking when no filter is set, set filter to exclude this category
                        // This is complex logic, so we'll keep it simple for MVP
                      }
                    }}
                    className="form-checkbox text-blue-600"
                  />
                  <label htmlFor={`category-${value}`} className="text-sm text-gray-700">
                    {label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <div className="pt-3 border-t border-gray-200">
              <button
                onClick={handleClearFilters}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default MapFilters