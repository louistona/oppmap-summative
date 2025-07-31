import React, { useState, useEffect } from 'react'
import { Check, X, Clock, User, MapPin, Eye } from 'lucide-react'
import { solutionsService } from '../../services/solutions'
import { SOLUTION_STATUS } from '../../utils/constants'
import { formatDate } from '../../utils/helpers'
import Loading from '../common/Loading'
import '../../styles/components.css'

const SolutionModerator = ({ onUpdate }) => {
  const [solutions, setSolutions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('pending')
  const [selectedSolution, setSelectedSolution] = useState(null)
  const [actionLoading, setActionLoading] = useState(null)

  useEffect(() => {
    fetchSolutions()
  }, [filter])

  const fetchSolutions = async () => {
    try {
      setLoading(true)
      const { data, error } = await solutionsService.getAllSolutions(
        filter === 'all' ? null : filter
      )
      
      if (error) throw error
      
      setSolutions(data || [])
    } catch (err) {
      setError('Failed to load solutions')
      console.error('Error fetching solutions:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (solutionId, newStatus) => {
    try {
      setActionLoading(solutionId)
      setError('')

      const { error } = await solutionsService.updateSolutionStatus(solutionId, newStatus)
      
      if (error) throw error

      // Update local state
      setSolutions(prev => prev.map(solution => 
        solution.id === solutionId 
          ? { ...solution, status: newStatus }
          : solution
      ))

      onUpdate?.()
    } catch (err) {
      setError('Failed to update solution status')
      console.error('Error updating solution:', err)
    } finally {
      setActionLoading(null)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'approved':
        return 'badge-green'
      case 'rejected':
        return 'badge-red'
      case 'pending':
      default:
        return 'badge-yellow'
    }
  }

  const filterOptions = [
    { value: 'pending', label: 'Pending Review', icon: Clock },
    { value: 'approved', label: 'Approved', icon: Check },
    { value: 'rejected', label: 'Rejected', icon: X },
    { value: 'all', label: 'All Solutions', icon: Eye }
  ]

  if (loading) {
    return <Loading text="Loading solutions..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Moderate Solutions</h2>
        
        {/* Filter Tabs */}
        <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => setFilter(option.value)}
              className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === option.value
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <option.icon className="w-4 h-4 mr-2" />
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Solutions List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {filterOptions.find(opt => opt.value === filter)?.label} ({solutions.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {solutions.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No solutions found for the selected filter.
            </div>
          ) : (
            solutions.map((solution) => (
              <div key={solution.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {solution.title}
                      </h4>
                      <span className={`badge ${getStatusBadgeClass(solution.status)}`}>
                        {solution.status}
                      </span>
                    </div>

                    {/* Challenge Info */}
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="font-medium">{solution.challenges?.title}</span>
                      <span className="mx-2">•</span>
                      <span>{solution.challenges?.region_name}</span>
                    </div>

                    {/* Submitter Info */}
                    <div className="flex items-center text-sm text-gray-600 mb-3">
                      <User className="w-4 h-4 mr-1" />
                      <span>Submitted by {solution.user_profiles?.full_name}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(solution.created_at)}</span>
                    </div>

                    {/* Solution Description */}
                    <div className="mb-4">
                      <p className="text-gray-700">
                        {selectedSolution === solution.id ? (
                          solution.description
                        ) : (
                          solution.description?.length > 200 ? (
                            <>
                              {solution.description.substring(0, 200)}...
                              <button
                                onClick={() => setSelectedSolution(solution.id)}
                                className="text-blue-600 hover:text-blue-800 ml-1"
                              >
                                Read more
                              </button>
                            </>
                          ) : (
                            solution.description
                          )
                        )}
                      </p>
                      
                      {selectedSolution === solution.id && solution.description?.length > 200 && (
                        <button
                          onClick={() => setSelectedSolution(null)}
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2"
                        >
                          Show less
                        </button>
                      )}
                    </div>

                    {/* Timestamps */}
                    <div className="text-xs text-gray-500">
                      <span>Created: {formatDate(solution.created_at)}</span>
                      {solution.updated_at !== solution.created_at && (
                        <span className="ml-4">Updated: {formatDate(solution.updated_at)}</span>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="ml-4 flex items-center space-x-2">
                    {solution.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleStatusUpdate(solution.id, 'approved')}
                          disabled={actionLoading === solution.id}
                          className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          {actionLoading === solution.id ? (
                            <div className="spinner mr-2"></div>
                          ) : (
                            <Check className="w-4 h-4 mr-2" />
                          )}
                          Approve
                        </button>
                        
                        <button
                          onClick={() => handleStatusUpdate(solution.id, 'rejected')}
                          disabled={actionLoading === solution.id}
                          className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                        >
                          {actionLoading === solution.id ? (
                            <div className="spinner mr-2"></div>
                          ) : (
                            <X className="w-4 h-4 mr-2" />
                          )}
                          Reject
                        </button>
                      </>
                    )}

                    {solution.status === 'approved' && (
                      <button
                        onClick={() => handleStatusUpdate(solution.id, 'rejected')}
                        disabled={actionLoading === solution.id}
                        className="flex items-center px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors disabled:opacity-50"
                      >
                        {actionLoading === solution.id ? (
                          <div className="spinner mr-2"></div>
                        ) : (
                          <X className="w-4 h-4 mr-2" />
                        )}
                        Reject
                      </button>
                    )}

                    {solution.status === 'rejected' && (
                      <button
                        onClick={() => handleStatusUpdate(solution.id, 'approved')}
                        disabled={actionLoading === solution.id}
                        className="flex items-center px-3 py-2 text-sm font-medium text-green-700 bg-green-100 hover:bg-green-200 rounded-md transition-colors disabled:opacity-50"
                      >
                        {actionLoading === solution.id ? (
                          <div className="spinner mr-2"></div>
                        ) : (
                          <Check className="w-4 h-4 mr-2" />
                        )}
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SolutionModerator