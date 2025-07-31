import React, { useState, useEffect } from 'react'
import { X, Send, Search } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { challengesService } from '../../services/challenges'
import { solutionsService } from '../../services/solutions'
import { getCategoryLabel, truncateText, debounce } from '../../utils/helpers'
import Loading from '../common/Loading'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const SubmitSolution = ({ onClose, onSubmitted, challengeId = null }) => {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState([])
  const [selectedChallenge, setSelectedChallenge] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  })
  const [loading, setLoading] = useState(false)
  const [challengesLoading, setChallengesLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchChallenges()
  }, [])

  useEffect(() => {
    if (challengeId) {
      // If a specific challenge ID is provided, find and select it
      const challenge = challenges.find(c => c.id === challengeId)
      if (challenge) {
        setSelectedChallenge(challenge)
      }
    }
  }, [challengeId, challenges])

  const fetchChallenges = async () => {
    try {
      setChallengesLoading(true)
      const { data, error } = await challengesService.getChallenges()
      
      if (error) throw error
      
      setChallenges(data || [])
    } catch (err) {
      console.error('Error fetching challenges:', err)
      setError('Failed to load challenges')
    } finally {
      setChallengesLoading(false)
    }
  }

  const handleSearchChange = debounce((value) => {
    setSearchTerm(value)
  }, 300)

  const filteredChallenges = challenges.filter(challenge =>
    challenge.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.region_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    challenge.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!selectedChallenge) {
      setError('Please select a challenge')
      return
    }

    if (!formData.title.trim() || !formData.description.trim()) {
      setError('Please fill in all fields')
      return
    }

    try {
      setLoading(true)
      setError('')

      const solutionData = {
        challenge_id: selectedChallenge.id,
        user_id: user.id,
        title: formData.title.trim(),
        description: formData.description.trim(),
        status: 'pending'
      }

      const { error } = await solutionsService.createSolution(solutionData)
      
      if (error) throw error

      onSubmitted()
    } catch (err) {
      console.error('Error submitting solution:', err)
      setError('Failed to submit solution. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl">
        <div className="modal-header">
          <div className="flex items-center justify-between">
            <h2 className="modal-title">Submit Solution</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Challenge Selection */}
            <div className="form-group">
              <label className="form-label">Select Challenge *</label>
              
              {!challengeId && (
                <div className="relative mb-4">
                  <input
                    type="text"
                    placeholder="Search challenges..."
                    onChange={(e) => handleSearchChange(e.target.value)}
                    className="input-field pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>
              )}

              {challengesLoading ? (
                <Loading size="sm" text="Loading challenges..." />
              ) : (
                <div className="max-h-60 overflow-y-auto border border-gray-300 rounded-lg">
                  {filteredChallenges.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No challenges found
                    </div>
                  ) : (
                    filteredChallenges.map((challenge) => (
                      <div
                        key={challenge.id}
                        onClick={() => setSelectedChallenge(challenge)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                          selectedChallenge?.id === challenge.id ? 'bg-blue-50 border-blue-200' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900">{challenge.title}</h3>
                            <p className="text-sm text-gray-600 mt-1">
                              {challenge.region_name} • {getCategoryLabel(challenge.category)}
                            </p>
                            <p className="text-sm text-gray-700 mt-2">
                              {truncateText(challenge.description, 80)}
                            </p>
                          </div>
                          <div className="ml-4">
                            <span className="badge badge-gray text-xs">
                              Level {challenge.severity}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Solution Title */}
            <div className="form-group">
              <label htmlFor="title" className="form-label">
                Solution Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                className="input-field"
                placeholder="Enter a descriptive title for your solution"
                value={formData.title}
                onChange={handleInputChange}
              />
            </div>

            {/* Solution Description */}
            <div className="form-group">
              <label htmlFor="description" className="form-label">
                Solution Description *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={6}
                className="form-textarea"
                placeholder="Describe your solution in detail. Include implementation approach, expected impact, resource requirements, etc."
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>

            {/* Selected Challenge Preview */}
            {selectedChallenge && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-medium text-blue-900 mb-2">Selected Challenge:</h4>
                <p className="text-blue-800 font-medium">{selectedChallenge.title}</p>
                <p className="text-blue-700 text-sm">
                  {selectedChallenge.region_name} • {getCategoryLabel(selectedChallenge.category)}
                </p>
              </div>
            )}

            {/* Submission Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <p className="text-sm text-yellow-800">
                <strong>Note:</strong> Your solution will be reviewed by our team before being published. 
                You'll receive a notification once the review is complete.
              </p>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !selectedChallenge}
              className="btn-primary flex items-center"
            >
              {loading ? (
                <>
                  <div className="spinner mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Solution
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default SubmitSolution