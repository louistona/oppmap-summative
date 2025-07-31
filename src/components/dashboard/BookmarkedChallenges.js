import React from 'react'
import { MapPin, Users, Bookmark } from 'lucide-react'
import { useBookmarks } from '../../hooks/useBookmarks'
import { 
  getCategoryLabel, 
  getSeverityLabel, 
  formatNumber, 
  truncateText,
  getCategoryColor,
  getSeverityColor
} from '../../utils/helpers'
import Loading from '../common/Loading'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const BookmarkedChallenges = ({ limit = null }) => {
  const { bookmarks, loading, toggleBookmark } = useBookmarks()

  const handleRemoveBookmark = async (challengeId) => {
    try {
      await toggleBookmark(challengeId)
    } catch (error) {
      console.error('Failed to remove bookmark:', error)
    }
  }

  if (loading) {
    return <Loading text="Loading bookmarks..." />
  }

  if (bookmarks.length === 0) {
    return (
      <div className="empty-state">
        <Bookmark className="empty-state-icon" />
        <h3 className="empty-state-title">No Bookmarks Yet</h3>
        <p className="empty-state-description">
          Start exploring the map and bookmark interesting opportunities.
        </p>
      </div>
    )
  }

  const displayedBookmarks = limit ? bookmarks.slice(0, limit) : bookmarks

  return (
    <div className="space-y-4">
      {displayedBookmarks.map((bookmark) => {
        const challenge = bookmark.challenges
        if (!challenge) return null

        return (
          <div key={bookmark.id} className="card-hover p-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                  <button
                    onClick={() => handleRemoveBookmark(challenge.id)}
                    className="text-blue-600 hover:text-blue-800"
                    title="Remove bookmark"
                  >
                    <Bookmark className="w-4 h-4 fill-current" />
                  </button>
                </div>
                
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {challenge.region_name}
                </div>

                <p className="text-sm text-gray-700 mb-3">
                  {truncateText(challenge.description, 100)}
                </p>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <span 
                      className="badge text-white text-xs"
                      style={{ backgroundColor: getCategoryColor(challenge.category) }}
                    >
                      {getCategoryLabel(challenge.category)}
                    </span>
                    
                    <span 
                      className="badge text-white text-xs"
                      style={{ backgroundColor: getSeverityColor(challenge.severity) }}
                    >
                      Severity {challenge.severity}
                    </span>
                  </div>

                  {challenge.population_affected && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Users className="w-4 h-4 mr-1" />
                      {formatNumber(challenge.population_affected)}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {limit && bookmarks.length > limit && (
        <div className="text-center">
          <p className="text-sm text-gray-600">
            Showing {limit} of {bookmarks.length} bookmarks
          </p>
        </div>
      )}
    </div>
  )
}

export default BookmarkedChallenges