import { supabase } from './supabase'

export const challengesService = {
  // Get all challenges with optional filters
  getChallenges: async (filters = {}) => {
    let query = supabase
      .from('challenges')
      .select('*')

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category)
    }

    if (filters.severity) {
      query = query.eq('severity', filters.severity)
    }

    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,region_name.ilike.%${filters.search}%`)
    }

    // Order by severity (highest first) then by created_at
    query = query.order('severity', { ascending: false }).order('created_at', { ascending: false })

    const { data, error } = await query

    return { data, error }
  },

  // Get a single challenge by ID
  getChallenge: async (id) => {
    const { data, error } = await supabase
      .from('challenges')
      .select('*')
      .eq('id', id)
      .single()

    return { data, error }
  },

  // Create a new challenge (admin only)
  createChallenge: async (challenge) => {
    // Convert lat/lng to PostGIS point format
    const challengeData = {
      ...challenge,
      location: `POINT(${challenge.longitude} ${challenge.latitude})`
    }

    // Remove lat/lng as they're not stored directly
    delete challengeData.latitude
    delete challengeData.longitude

    const { data, error } = await supabase
      .from('challenges')
      .insert(challengeData)
      .select()
      .single()

    return { data, error }
  },

  // Update a challenge (admin only)
  updateChallenge: async (id, updates) => {
    // Handle location update if lat/lng provided
    if (updates.latitude && updates.longitude) {
      updates.location = `POINT(${updates.longitude} ${updates.latitude})`
      delete updates.latitude
      delete updates.longitude
    }

    const { data, error } = await supabase
      .from('challenges')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    return { data, error }
  },

  // Delete a challenge (admin only)
  deleteChallenge: async (id) => {
    const { error } = await supabase
      .from('challenges')
      .delete()
      .eq('id', id)

    return { error }
  },

  // Get challenges near a location (using PostGIS)
  getChallengesNearLocation: async (latitude, longitude, radiusKm = 50) => {
    const { data, error } = await supabase.rpc('get_challenges_near_location', {
      lat: latitude,
      lng: longitude,
      radius_km: radiusKm
    })

    return { data, error }
  },

  // Get challenge statistics
  getChallengeStats: async () => {
    const { data: categoryStats, error: categoryError } = await supabase
      .from('challenges')
      .select('category')
      .then(({ data, error }) => {
        if (error) return { data: null, error }
        
        const stats = data.reduce((acc, challenge) => {
          acc[challenge.category] = (acc[challenge.category] || 0) + 1
          return acc
        }, {})
        
        return { data: stats, error: null }
      })

    const { data: severityStats, error: severityError } = await supabase
      .from('challenges')
      .select('severity')
      .then(({ data, error }) => {
        if (error) return { data: null, error }
        
        const stats = data.reduce((acc, challenge) => {
          acc[challenge.severity] = (acc[challenge.severity] || 0) + 1
          return acc
        }, {})
        
        return { data: stats, error: null }
      })

    const { count: totalChallenges, error: countError } = await supabase
      .from('challenges')
      .select('*', { count: 'exact', head: true })

    return {
      data: {
        categoryStats: categoryStats || {},
        severityStats: severityStats || {},
        totalChallenges: totalChallenges || 0
      },
      error: categoryError || severityError || countError
    }
  }
}