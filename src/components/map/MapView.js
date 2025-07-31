import React, { useEffect, useState } from 'react'
import { MapContainer, TileLayer, useMap , Popup , Marker } from 'react-leaflet'
import { Maximize2, Minimize2 } from 'lucide-react'
import { MAP_CONFIG } from '../../utils/constants'
import { useChallenges } from '../../hooks/useChallenges'
import { useBookmarks } from '../../hooks/useBookmarks'
import ChallengeMarker from './ChallengeMarker'
import MapFilters from './MapFilters'
import Loading from '../common/Loading'
import 'leaflet/dist/leaflet.css'
import * as L from 'leaflet'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

// Component to handle map updates
const MapUpdater = ({ challenges }) => {
  const map = useMap()

  useEffect(() => {
    if (challenges.length > 0) {
      // Get bounds of all challenges
      const group = new L.featureGroup(
        challenges.map(challenge => {
          const getCoordinates = (location) => {
            if (!location) return [0, 0]
            
            if (typeof location === 'string') {
              const match = location.match(/POINT\(([^)]+)\)/)
              if (match) {
                const [lng, lat] = match[1].split(' ').map(Number)
                return [lat, lng]
              }
            }
            
            if (location.coordinates) {
              return [location.coordinates[1], location.coordinates[0]]
            }
            
            return [0, 0]
          }

          const position = getCoordinates(challenge.location)
          return L.marker(position)
        })
      )

      try {
        map.fitBounds(group.getBounds(), { padding: [20, 20] })
      } catch (error) {
        // If fitBounds fails, center on default location
        map.setView(MAP_CONFIG.DEFAULT_CENTER, MAP_CONFIG.DEFAULT_ZOOM)
      }
    }
  }, [challenges, map])

  return null
}

const MapView = () => {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [mapFilters, setMapFilters] = useState({})
  
  const { 
    challenges, 
    loading: challengesLoading, 
    error: challengesError,
    updateFilters,
    clearFilters
  } = useChallenges()

  const {
    toggleBookmark,
    isBookmarked,
    loading: bookmarksLoading
  } = useBookmarks()

  const handleFiltersChange = (newFilters) => {
    const updatedFilters = { ...mapFilters, ...newFilters }
    setMapFilters(updatedFilters)
    updateFilters(updatedFilters)
  }

  const handleClearFilters = () => {
    setMapFilters({})
    clearFilters()
  }

  const handleBookmark = async (challengeId) => {
    if (bookmarksLoading) return
    
    try {
      await toggleBookmark(challengeId)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen)
  }

  if (challengesError) {
    return (
      <div className="map-container">
        <div className="map-error">
          <div className="map-error-content">
            <div className="map-error-icon">⚠️</div>
            <h3 className="map-error-title">Failed to Load Map</h3>
            <p className="map-error-description">
              There was an error loading the challenges data. Please try again.
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="map-error-button"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={isFullscreen ? 'map-fullscreen' : ''}>
      <div className="relative">
        {/* Map Filters */}
        <div className={isFullscreen ? 'absolute top-4 right-4 z-[1000]' : 'mb-4'}>
          <MapFilters
            filters={mapFilters}
            onFiltersChange={handleFiltersChange}
            onClearFilters={handleClearFilters}
          />
        </div>

        {/* Map Container */}
        <div className="map-container">
          {challengesLoading}

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="absolute top-4 left-4 z-[1000] bg-white hover:bg-gray-50 border border-gray-300 rounded-md p-2 shadow-sm"
            title={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize2 className="w-5 h-5 text-gray-600" />
            ) : (
              <Maximize2 className="w-5 h-5 text-gray-600" />
            )}
          </button>

          <MapContainer
            center={MAP_CONFIG.DEFAULT_CENTER}
            zoom={MAP_CONFIG.DEFAULT_ZOOM}
            minZoom={MAP_CONFIG.MIN_ZOOM}
            maxZoom={MAP_CONFIG.MAX_ZOOM}
            className="map-wrapper"
            zoomControl={true}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            {/* Challenge Markers */}
            {challenges.map((challenge) => (
              <ChallengeMarker
                key={challenge.id}
                challenge={challenge}
                onBookmark={handleBookmark}
                isBookmarked={isBookmarked(challenge.id)}
              />
            ))}

            {/* Map Updater */}
            <MapUpdater challenges={challenges} />
          </MapContainer>

          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <h4 className="font-medium text-gray-900 mb-2 text-sm">Severity Levels</h4>
            <div className="space-y-1">
              {[1, 2, 3, 4, 5].map((severity) => (
                <div key={severity} className="flex items-center space-x-2">
                  <div 
                    className="w-4 h-4 rounded-full border-2 border-white shadow-sm"
                    style={{ 
                      backgroundColor: severity === 1 ? '#10B981' :
                                     severity === 2 ? '#F59E0B' :
                                     severity === 3 ? '#EF4444' :
                                     severity === 4 ? '#DC2626' : '#7F1D1D'
                    }}
                  ></div>
                  <span className="text-xs text-gray-700">
                    Level {severity} {severity === 1 ? '(Low)' : severity === 5 ? '(Critical)' : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Challenge Count */}
          {!challengesLoading && (
            <div className="absolute bottom-4 right-4 z-[1000] bg-white rounded-lg shadow-lg border border-gray-200 px-3 py-2">
              <span className="text-sm text-gray-700">
                {challenges.length} challenge{challenges.length !== 1 ? 's' : ''} found
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MapView