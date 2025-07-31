import React, { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, MapPin, Save, X } from 'lucide-react'
import { challengesService } from '../../services/challenges'
import { 
  CHALLENGE_CATEGORIES, 
  CATEGORY_LABELS, 
  SEVERITY_LEVELS, 
  SEVERITY_LABELS 
} from '../../utils/constants'
import { getCategoryLabel, getSeverityLabel, formatNumber } from '../../utils/helpers'
import Loading from '../common/Loading'
import '../../styles/components.css'

const ChallengeManager = ({ onUpdate }) => {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingChallenge, setEditingChallenge] = useState(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    severity: 1,
    region_name: '',
    latitude: '',
    longitude: '',
    population_affected: '',
    statistics: '{}'
  })

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const { data, error } = await challengesService.getChallenges()
      
      if (error) throw error
      
      setChallenges(data || [])
    } catch (err) {
      setError('Failed to load challenges')
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      category: '',
      severity: 1,
      region_name: '',
      latitude: '',
      longitude: '',
      population_affected: '',
      statistics: '{}'
    })
    setEditingChallenge(null)
    setShowAddForm(false)
  }

  const handleEdit = (challenge) => {
    // Extract coordinates for editing
    let lat = '', lng = ''
    if (challenge.location) {
      if (typeof challenge.location === 'string') {
        const match = challenge.location.match(/POINT\(([^)]+)\)/)
        if (match) {
          [lng, lat] = match[1].split(' ')
        }
      }
    }

    setFormData({
      title: challenge.title || '',
      description: challenge.description || '',
      category: challenge.category || '',
      severity: challenge.severity || 1,
      region_name: challenge.region_name || '',
      latitude: lat,
      longitude: lng,
      population_affected: challenge.population_affected || '',
      statistics: JSON.stringify(challenge.statistics || {}, null, 2)
    })
    setEditingChallenge(challenge)
    setShowAddForm(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setError('')
      
      // Validate required fields
      if (!formData.title || !formData.category || !formData.region_name) {
        setError('Please fill in all required fields')
        return
      }

      // Validate coordinates
      if (formData.latitude && formData.longitude) {
        const lat = parseFloat(formData.latitude)
        const lng = parseFloat(formData.longitude)
        
        if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
          setError('Please enter valid coordinates')
          return
        }
      }

      // Parse statistics JSON
      let statistics = {}
      if (formData.statistics.trim()) {
        try {
          statistics = JSON.parse(formData.statistics)
        } catch (err) {
          setError('Invalid JSON format in statistics field')
          return
        }
      }

      const challengeData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        severity: parseInt(formData.severity),
        region_name: formData.region_name,
        population_affected: formData.population_affected ? parseInt(formData.population_affected) : null,
        statistics,
        ...(formData.latitude && formData.longitude && {
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude)
        })
      }

      let result
      if (editingChallenge) {
        result = await challengesService.updateChallenge(editingChallenge.id, challengeData)
      } else {
        result = await challengesService.createChallenge(challengeData)
      }

      if (result.error) throw result.error

      await fetchChallenges()
      resetForm()
      onUpdate?.()
    } catch (err) {
      setError(err.message || 'Failed to save challenge')
      console.error('Error saving challenge:', err)
    }
  }

  const handleDelete = async (challengeId) => {
    if (!window.confirm('Are you sure you want to delete this challenge?')) {
      return
    }

    try {
      const { error } = await challengesService.deleteChallenge(challengeId)
      
      if (error) throw error

      await fetchChallenges()
      onUpdate?.()
    } catch (err) {
      setError('Failed to delete challenge')
      console.error('Error deleting challenge:', err)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (loading) {
    return <Loading text="Loading challenges..." />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Manage Challenges</h2>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Challenge
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingChallenge ? 'Edit Challenge' : 'Add New Challenge'}
            </h3>
            <button
              onClick={resetForm}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                name="title"
                required
                className="input-field"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                rows={4}
                className="form-textarea"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            <div className="form-group md:col-span-2">
              <label className="form-label">Statistics (JSON)</label>
              <textarea
                name="statistics"
                rows={4}
                className="form-textarea font-mono text-sm"
                placeholder='{"unemployment_rate": "15%", "literacy_rate": "60%"}'
                value={formData.statistics}
                onChange={handleInputChange}
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {editingChallenge ? 'Update' : 'Create'} Challenge
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Challenges List */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            All Challenges ({challenges.length})
          </h3>
        </div>

        <div className="divide-y divide-gray-200">
          {challenges.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              No challenges found. Add your first challenge to get started.
            </div>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h4 className="text-lg font-medium text-gray-900">
                        {challenge.title}
                      </h4>
                      <span className="badge badge-blue">
                        {getCategoryLabel(challenge.category)}
                      </span>
                      <span className="badge badge-red">
                        Level {challenge.severity}
                      </span>
                    </div>

                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 mr-1" />
                      {challenge.region_name}
                    </div>

                    {challenge.description && (
                      <p className="text-gray-700 mb-3">
                        {challenge.description}
                      </p>
                    )}

                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      {challenge.population_affected && (
                        <span>Population: {formatNumber(challenge.population_affected)}</span>
                      )}
                      <span>Created: {new Date(challenge.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="ml-4 flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(challenge)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Edit challenge"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(challenge.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Delete challenge"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
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

export default ChallengeManager