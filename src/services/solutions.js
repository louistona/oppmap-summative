import { supabase } from './supabase'

export const solutionsService = {
  // Get solutions for a specific challenge
  getSolutionsForChallenge: async (challengeId) => {
    const { data, error } = await supabase
      .from('solutions')
      .select(`
        *,
        user_profiles!inner(full_name)
      `)
      .eq('challenge_id', challengeId)
      .eq('status', 'approved')
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Get all solutions (admin only)
  getAllSolutions: async (status = null) => {
    let query = supabase
      .from('solutions')
      .select(`
        *,
        challenges!inner(title, region_name),
        user_profiles!inner(full_name)
      `)

    if (status) {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    return { data, error }
  },

  // Get user's solutions
  getUserSolutions: async (userId) => {
    const { data, error } = await supabase
      .from('solutions')
      .select(`
        *,
        challenges!inner(title, region_name)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return { data, error }
  },

  // Create a new solution
  createSolution: async (solution) => {
    const { data, error } = await supabase
      .from('solutions')
      .insert(solution)
      .select()
      .single()

    return { data, error }
  },

  // Update solution status (admin only)
  updateSolutionStatus: async (solutionId, status) => {
    const { data, error } = await supabase
      .from('solutions')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionId)
      .select()
      .single()

    return { data, error }
  },

  // Update user's own solution
  updateSolution: async (solutionId, updates) => {
    const { data, error } = await supabase
      .from('solutions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', solutionId)
      .select()
      .single()

    return { data, error }
  },

  // Delete solution
  deleteSolution: async (solutionId) => {
    const { error } = await supabase
      .from('solutions')
      .delete()
      .eq('id', solutionId)

    return { error }
  },

  // Get solution statistics
  getSolutionStats: async () => {
    const { data: statusStats, error: statusError } = await supabase
      .from('solutions')
      .select('status')
      .then(({ data, error }) => {
        if (error) return { data: null, error }
        
        const stats = data.reduce((acc, solution) => {
          acc[solution.status] = (acc[solution.status] || 0) + 1
          return acc
        }, {})
        
        return { data: stats, error: null }
      })

    const { count: totalSolutions, error: countError } = await supabase
      .from('solutions')
      .select('*', { count: 'exact', head: true })

    return {
      data: {
        statusStats: statusStats || {},
        totalSolutions: totalSolutions || 0
      },
      error: statusError || countError
    }
  }
}