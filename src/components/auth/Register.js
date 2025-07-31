import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import AuthForm from './AuthForm'
import '../../styles/components.css'

const Register = () => {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleRegister = async (formData) => {
    try {
      setLoading(true)
      setError('')

      const { error } = await signUp(
        formData.email, 
        formData.password, 
        formData.fullName
      )
      
      if (error) {
        setError(error.message)
        return
      }

      setSuccess(true)
      // Navigate to dashboard after successful registration
      setTimeout(() => {
        navigate('/dashboard')
      }, 2000)
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
      console.error('Registration error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
              <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              Account Created Successfully!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Welcome to OpportunityMap. You'll be redirected to your dashboard shortly.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AuthForm
      type="register"
      onSubmit={handleRegister}
      loading={loading}
      error={error}
    />
  )
}

export default Register