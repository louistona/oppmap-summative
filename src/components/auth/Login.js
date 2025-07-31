import React, { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from './AuthForm'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const Login = () => {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/dashboard'

  const handleLogin = async (formData) => {
    try {
      setLoading(true)
      setError('')

      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        setError(error.message)
        return
      }

      navigate(from, { replace: true })
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Login error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthForm
      type="login"
      onSubmit={handleLogin}
      loading={loading}
      error={error}
    />
  )
}

export default Login