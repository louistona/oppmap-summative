import React from 'react'
import { Popup } from 'react-leaflet'
import { Bookmark, BookmarkIcon, Users, MapPin } from 'lucide-react'
import { 
  getCategoryLabel, 
  getSeverityLabel, 
  formatNumber, 
  truncateText,
  getCategoryColor,
  getSeverityColor
} from '../../utils/helpers'
import { useAuth } from '../../contexts/AuthContext'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const ChallengePopup = ({ challenge, onBookmark, isBookmarked }) => {
  const { user } = useAuth()

  const handleBookmarkClick = (e) => {
    e.stopPropagation()
    if (onBookmark) {
      onBookmark(challenge.id)
    }
  }

  const categoryColor = getCategoryColor(challenge.category)
  const severityColor = getSeverityColor(challenge.severity)

  return (
    <Popup 
      maxWidth={300}
      className="challenge-popup"
      closeButton={true}
      autoPan={true}
    >
      <div className="map-popup">
        {/* Header */}
        <div className="popup-header">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h3 className="popup-title">{challenge.title}</h3>
              <div className="popup-location flex items-center mt-1">
                <MapPin className="w-3 h-3 mr-1" />
                {challenge.region_name}
              </div>
            </div>
            {user && (
              <button
                onClick={handleBookmarkClick}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors duration-200"
                title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
              >
                {isBookmarked ? (
                  <BookmarkIcon className="w-4 h-4 text-blue-600" />
                ) : (
                  <Bookmark className="w-4 h-4 text-gray-400" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="popup-body">
          <p className="popup-description">
            {truncateText(challenge.description, 120)}
          </p>

          <div className="popup-stats">
            <div className="popup-stat">
              <span className="popup-stat-label">Category:</span>
              <span 
                className="popup-category text-white px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: categoryColor }}
              >
                {getCategoryLabel(challenge.category)}
              </span>
            </div>

            <div className="popup-stat">
              <span className="popup-stat-label">Severity:</span>
              <span 
                className="popup-severity text-white px-2 py-1 rounded text-xs font-medium"
                style={{ backgroundColor: severityColor }}
              >
                {getSeverityLabel(challenge.severity)}
              </span>
            </div>

            {challenge.population_affected && (
              <div className="popup-stat">
                <span className="popup-stat-label">Population Affected:</span>
                <span className="popup-stat-value flex items-center">
                  <Users className="w-3 h-3 mr-1" />
                  {formatNumber(challenge.population_affected)}
                </span>
              </div>
            )}

            {challenge.statistics && Object.keys(challenge.statistics).length > 0 && (
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-700 mb-2">Key Statistics:</p>
                {Object.entries(challenge.statistics).slice(0, 3).map(([key, value]) => (
                  <div key={key} className="popup-stat">
                    <span className="popup-stat-label capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="popup-stat-value">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="popup-footer">
          <div className="text-xs text-gray-500">
            Click marker for more details
          </div>
          <div className="flex items-center space-x-2">
            {user && (
              <span className="text-xs text-gray-500">
                {isBookmarked ? 'Bookmarked' : 'Click to bookmark'}
              </span>
            )}
          </div>
        </div>
      </div>
    </Popup>
  )
}

export default ChallengePopup