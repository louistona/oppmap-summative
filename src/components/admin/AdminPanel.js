import React, { useState, useEffect } from 'react'
import { Users, MapPin, CheckCircle, Clock, AlertTriangle, Plus } from 'lucide-react'
import { challengesService } from '../../services/challenges'
import { solutionsService } from '../../services/solutions'
import ChallengeManager from './ChallengeManager'
import SolutionModerator from './SolutionModerator'
import Loading from '../common/Loading'

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('overview')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddChallenge, setShowAddChallenge] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      
      const [challengeStatsRes, solutionStatsRes] = await Promise.all([
        challengesService.getChallengeStats(),
        solutionsService.getSolutionStats()
      ])

      if (challengeStatsRes.error) throw challengeStatsRes.error
      if (solutionStatsRes.error) throw solutionStatsRes.error

      setStats({
        challenges: challengeStatsRes.data,
        solutions: solutionStatsRes.data
      })
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'overview', name: 'Overview', icon: Users },
    { id: 'challenges', name: 'Challenges', icon: MapPin },
    { id: 'solutions', name: 'Solutions', icon: CheckCircle }
  ]

  if (loading) {
    return <Loading text="Loading admin panel..." />
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-gray-600 mt-2">
          Manage challenges, moderate solutions, and monitor platform activity.
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-number">{stats?.challenges?.totalChallenges || 0}</p>
                  <p className="stat-label">Total Challenges</p>
                </div>
                <MapPin className="stat-icon" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-number">{stats?.solutions?.totalSolutions || 0}</p>
                  <p className="stat-label">Total Solutions</p>
                </div>
                <CheckCircle className="stat-icon" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-number">{stats?.solutions?.statusStats?.pending || 0}</p>
                  <p className="stat-label">Pending Review</p>
                </div>
                <Clock className="stat-icon text-yellow-600" />
              </div>
            </div>

            <div className="stat-card">
              <div className="flex items-center justify-between">
                <div>
                  <p className="stat-number">{stats?.solutions?.statusStats?.approved || 0}</p>
                  <p className="stat-label">Approved Solutions</p>
                </div>
                <CheckCircle className="stat-icon text-green-600" />
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setActiveTab('challenges')}
                className="btn-primary flex items-center"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Challenge
              </button>
              <button
                onClick={() => setActiveTab('solutions')}
                className="btn-secondary flex items-center"
              >
                <Clock className="w-4 h-4 mr-2" />
                Review Solutions ({stats?.solutions?.statusStats?.pending || 0})
              </button>
            </div>
          </div>

          {/* Category Breakdown */}
          {stats?.challenges?.categoryStats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Challenges by Category</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(stats.challenges.categoryStats).map(([category, count]) => (
                  <div key={category} className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{count}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {category.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Severity Breakdown */}
          {stats?.challenges?.severityStats && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Challenges by Severity</h2>
              <div className="grid grid-cols-5 gap-4">
                {[1, 2, 3, 4, 5].map((severity) => {
                  const count = stats.challenges.severityStats[severity] || 0
                  const colors = {
                    1: 'text-green-600',
                    2: 'text-yellow-600',
                    3: 'text-orange-600',
                    4: 'text-red-600',
                    5: 'text-red-800'
                  }
                  return (
                    <div key={severity} className="text-center">
                      <div className={`text-2xl font-bold ${colors[severity]}`}>{count}</div>
                      <div className="text-sm text-gray-600">Level {severity}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Pending Actions */}
          {stats?.solutions?.statusStats?.pending > 0 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
              <div className="flex items-center">
                <AlertTriangle className="w-6 h-6 text-yellow-600 mr-3" />
                <div>
                  <h3 className="text-lg font-medium text-yellow-800">
                    Action Required
                  </h3>
                  <p className="text-yellow-700">
                    You have {stats.solutions.statusStats.pending} solution{stats.solutions.statusStats.pending !== 1 ? 's' : ''} waiting for review.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('solutions')}
                  className="ml-auto btn-primary"
                >
                  Review Now
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {activeTab === 'challenges' && (
        <ChallengeManager onUpdate={fetchStats} />
      )}

      {activeTab === 'solutions' && (
        <SolutionModerator onUpdate={fetchStats} />
      )}
    </div>
  )
}

export default AdminPanel