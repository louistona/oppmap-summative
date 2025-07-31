import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Bookmark, Plus, TrendingUp, MapPin, Users, AlertTriangle } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useBookmarks } from '../../hooks/useBookmarks'
import { solutionsService } from '../../services/solutions'
import { challengesService } from '../../services/challenges'
import BookmarkedChallenges from './BookmarkedChallenges'
import SubmitSolution from './SubmitSolution'
import Loading from '../common/Loading'
import { formatNumber, getCategoryLabel, getSeverityLabel } from '../../utils/helpers'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const UserDashboard = () => {
  const { user, profile } = useAuth()
  const { bookmarks, loading: bookmarksLoading } = useBookmarks()
  const [userSolutions, setUserSolutions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showSubmitSolution, setShowSubmitSolution] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [user])

  const fetchDashboardData = async () => {
    if (!user) return

    try {
      setLoading(true)
      
      // Fetch user's solutions
      const { data: solutions, error: solutionsError } = await solutionsService.getUserSolutions(user.id)
      if (solutionsError) throw solutionsError
      setUserSolutions(solutions || [])

      // Fetch general stats
      const { data: challengeStats, error: statsError } = await challengesService.getChallengeStats()
      if (statsError) throw statsError
      setStats(challengeStats)

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSolutionSubmitted = () => {
    setShowSubmitSolution(false)
    fetchDashboardData() // Refresh solutions
  }

  if (loading || bookmarksLoading) {
    return <Loading text="Loading dashboard..." />
  }

  const approvedSolutions = userSolutions.filter(s => s.status === 'approved').length
  const pendingSolutions = userSolutions.filter(s => s.status === 'pending').length

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {profile?.full_name || 'User'}!
        </h1>
        <p className="text-gray-600 mt-2">
          Discover opportunities and make an impact in underserved regions.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-number">{bookmarks.length}</p>
              <p className="stat-label">Bookmarked Opportunities</p>
            </div>
            <Bookmark className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-number">{userSolutions.length}</p>
              <p className="stat-label">Solutions Submitted</p>
            </div>
            <Plus className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-number">{approvedSolutions}</p>
              <p className="stat-label">Solutions Approved</p>
            </div>
            <TrendingUp className="stat-icon" />
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="stat-number">{stats?.totalChallenges || 0}</p>
              <p className="stat-label">Total Opportunities</p>
            </div>
            <MapPin className="stat-icon" />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-4">
          <Link to="/" className="btn-primary flex items-center">
            <MapPin className="w-4 h-4 mr-2" />
            Explore Map
          </Link>
          <button
            onClick={() => setShowSubmitSolution(true)}
            className="btn-secondary flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" />
            Submit Solution
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Bookmarked Challenges */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Bookmarks</h2>
            <Link to="/" className="text-sm text-blue-600 hover:text-blue-800">
              View all on map
            </Link>
          </div>
          <BookmarkedChallenges limit={5} />
        </div>

        {/* Recent Solutions */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Your Solutions</h2>
            <button
              onClick={() => setShowSubmitSolution(true)}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              Submit new
            </button>
          </div>
          
          <div className="space-y-4">
            {userSolutions.length === 0 ? (
              <div className="empty-state">
                <Plus className="empty-state-icon" />
                <h3 className="empty-state-title">No Solutions Yet</h3>
                <p className="empty-state-description">
                  Start by submitting your first solution to a challenge.
                </p>
                <button
                  onClick={() => setShowSubmitSolution(true)}
                  className="btn-primary"
                >
                  Submit Solution
                </button>
              </div>
            ) : (
              userSolutions.slice(0, 5).map((solution) => (
                <div key={solution.id} className="card p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{solution.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        For: {solution.challenges?.title}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {solution.challenges?.region_name}
                      </p>
                    </div>
                    <div className="ml-4">
                      <span
                        className={`badge ${
                          solution.status === 'approved'
                            ? 'badge-green'
                            : solution.status === 'pending'
                            ? 'badge-yellow'
                            : 'badge-red'
                        }`}
                      >
                        {solution.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {pendingSolutions > 0 && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800">
                  You have {pendingSolutions} solution{pendingSolutions !== 1 ? 's' : ''} pending review.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Platform Statistics */}
      {stats && (
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(stats.categoryStats || {}).map(([category, count]) => (
              <div key={category} className="text-center">
                <div className="text-2xl font-bold text-gray-900">{count}</div>
                <div className="text-sm text-gray-600">{getCategoryLabel(category)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Submit Solution Modal */}
      {showSubmitSolution && (
        <SubmitSolution
          onClose={() => setShowSubmitSolution(false)}
          onSubmitted={handleSolutionSubmitted}
        />
      )}
    </div>
  )
}

export default UserDashboard