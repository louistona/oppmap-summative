import { useState, useEffect } from 'react'
import { supabase } from '../services/supabase'
import { useAuth } from '../contexts/AuthContext'

export const useBookmarks = () => {
  const { user } = useAuth()
  const [bookmarks, setBookmarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch user's bookmarks
  const fetchBookmarks = async () => {
    if (!user) {
      setBookmarks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('user_bookmarks')
        .select(`
          *,
          challenges!inner(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      setBookmarks(data || [])
      setError(null)
    } catch (err) {
      setError(err.message)
      console.error('Error fetching bookmarks:', err)
    } finally {
      setLoading(false)
    }
  }

  // Add bookmark
  const addBookmark = async (challengeId) => {
    if (!user) {
      throw new Error('Must be logged in to bookmark')
    }

    try {
      const { data, error } = await supabase
        .from('user_bookmarks')
        .insert({
          user_id: user.id,
          challenge_id: challengeId
        })
        .select(`
          *,
          challenges!inner(*)
        `)
        .single()

      if (error) throw error

      setBookmarks(prev => [data, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error adding bookmark:', err)
      return { data: null, error: err.message }
    }
  }

  // Remove bookmark
  const removeBookmark = async (challengeId) => {
    if (!user) {
      throw new Error('Must be logged in to remove bookmark')
    }

    try {
      const { error } = await supabase
        .from('user_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('challenge_id', challengeId)

      if (error) throw error

      setBookmarks(prev => prev.filter(bookmark => bookmark.challenge_id !== challengeId))
      return { error: null }
    } catch (err) {
      console.error('Error removing bookmark:', err)
      return { error: err.message }
    }
  }

  // Check if challenge is bookmarked
  const isBookmarked = (challengeId) => {
    return bookmarks.some(bookmark => bookmark.challenge_id === challengeId)
  }

  // Toggle bookmark
  const toggleBookmark = async (challengeId) => {
    if (isBookmarked(challengeId)) {
      return await removeBookmark(challengeId)
    } else {
      return await addBookmark(challengeId)
    }
  }

  useEffect(() => {
    fetchBookmarks()
  }, [user])

  return {
    bookmarks,
    loading,
    error,
    addBookmark,
    removeBookmark,
    toggleBookmark,
    isBookmarked,
    refetch: fetchBookmarks
  }
}