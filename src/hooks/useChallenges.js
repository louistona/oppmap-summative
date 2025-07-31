import { useState, useEffect } from 'react'
import { challengesService } from '../services/challenges'

export const useChallenges = (initialFilters = {}) => {
  const [challenges, setChallenges] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filters, setFilters] = useState(initialFilters)

  // Fetch challenges with current filters
  const fetchChallenges = async () => {
    try {
      setLoading(true)
      const { data, error } = await challengesService.getChallenges(filters)
      
      if (error) throw error

      setChallenges(data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching challenges:', err)
    } finally {
      setLoading(false)
    }
  }

  // Update filters and refetch
  const updateFilters = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  // Clear all filters
  const clearFilters = () => {
    setFilters({})
  }

  // Refetch challenges
  const refetch = () => {
    fetchChallenges()
  }

  useEffect(() => {
    fetchChallenges()
  }, [filters])

  return {
    challenges,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refetch
  }
}