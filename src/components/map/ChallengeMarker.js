import React from 'react'
import { Marker } from 'react-leaflet'
import L from 'leaflet'
import { getCategoryColor, getSeverityColor } from '../../utils/helpers'
import ChallengePopup from './ChallengePopup'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const ChallengeMarker = ({ challenge, onBookmark, isBookmarked }) => {
  // Extract coordinates from PostGIS point format
  const getCoordinates = (location) => {
    if (!location) return [0, 0]
    
    // Handle different location formats
    if (typeof location === 'string') {
      // Extract from "POINT(lng lat)" format
      const match = location.match(/POINT\(([^)]+)\)/)
      if (match) {
        const [lng, lat] = match[1].split(' ').map(Number)
        return [lat, lng]
      }
    }
    
    if (location.coordinates) {
      // GeoJSON format
      return [location.coordinates[1], location.coordinates[0]]
    }
    
    return [0, 0]
  }

  const position = getCoordinates(challenge.location)

  // Create custom marker icon
  const createCustomIcon = () => {
    const color = getCategoryColor(challenge.category)
    const size = Math.max(24, challenge.severity * 6)
    
    const iconHtml = `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: ${Math.max(10, size * 0.4)}px;
        cursor: pointer;
        transition: transform 0.2s ease;
      " onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        ${challenge.severity}
      </div>
    `

    return L.divIcon({
      html: iconHtml,
      className: 'custom-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
      popupAnchor: [0, -size / 2]
    })
  }

  return (
    <Marker 
      position={position} 
      icon={createCustomIcon()}
    >
      <ChallengePopup 
        challenge={challenge}
        onBookmark={onBookmark}
        isBookmarked={isBookmarked}
      />
    </Marker>
  )
}

export default ChallengeMarker