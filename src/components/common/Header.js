import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Menu, X, User, LogOut, Settings, MapPin } from 'lucide-react'
import '../../styles/index.css'
import '../../styles/components.css'
import '../../styles/map.css'

const Header = () => {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
    setUserMenuOpen(false)
  }

  const isActiveRoute = (path) => {
    return location.pathname === path
  }

  const navigation = [
    { name: 'Map', href: '/', icon: MapPin },
    ...(user ? [
      { name: 'Dashboard', href: '/dashboard', icon: User },
      ...(profile?.role === 'admin' ? [
        { name: 'Admin', href: '/admin', icon: Settings }
      ] : [])
    ] : [])
  ]

  return (
    <header className="header">
      <div className="header-content">
        <nav className="header-nav">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="logo">
              OpportunityMap
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="nav-links">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`nav-link ${isActiveRoute(item.href) ? 'active' : ''}`}
              >
                <item.icon className="w-4 h-4 inline mr-1" />
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {user ? (
              <div className="user-menu">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="user-menu-button"
                >
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                    {profile?.full_name?.charAt(0) || user.email?.charAt(0) || 'U'}
                  </div>
                </button>

                {userMenuOpen && (
                  <div className="user-menu-dropdown">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      {profile?.role === 'admin' && (
                        <p className="text-xs text-blue-600 font-medium">Admin</p>
                      )}
                    </div>
                    <Link
                      to="/dashboard"
                      className="user-menu-item"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <User className="w-4 h-4 inline mr-2" />
                      Dashboard
                    </Link>
                    <button
                      onClick={handleSignOut}
                      className="user-menu-item w-full text-left"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="text-gray-600 hover:text-gray-900">
                  Sign In
                </Link>
                <Link to="/register" className="btn-primary">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="mobile-menu">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="mobile-menu-button"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="mobile-menu-panel">
            <div className="mobile-nav-links">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`mobile-nav-link ${isActiveRoute(item.href) ? 'bg-blue-50 text-blue-600' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <item.icon className="w-4 h-4 inline mr-2" />
                  {item.name}
                </Link>
              ))}
              
              {user ? (
                <>
                  <div className="border-t border-gray-200 mt-3 pt-3">
                    <div className="px-3 mb-2">
                      <p className="text-sm font-medium text-gray-900">
                        {profile?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="mobile-nav-link w-full text-left"
                    >
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </div>
                </>
              ) : (
                <div className="border-t border-gray-200 mt-3 pt-3 space-y-1">
                  <Link
                    to="/login"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    className="mobile-nav-link"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Click outside to close dropdowns */}
      {(userMenuOpen || mobileMenuOpen) && (
        <div
          className="fixed inset-0 z-10"
          onClick={() => {
            setUserMenuOpen(false)
            setMobileMenuOpen(false)
          }}
        />
      )}
    </header>
  )
}

export default Header