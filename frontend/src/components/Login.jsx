import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useNavigate } from 'react-router-dom'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/login.css'

function Login() {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { login, currentUser, isAuthenticated, authInitialized } = useAuth()
  const navigate = useNavigate()

  // Redirect if already authenticated
  useEffect(() => {
    if (authInitialized && isAuthenticated && currentUser) {
      console.log('🔄 User already authenticated, redirecting to home')
      navigate('/', { replace: true })
    }
  }, [authInitialized, isAuthenticated, currentUser, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    
    if (isLoading) {
      console.log('⏳ Login already in progress, ignoring duplicate request')
      return
    }
    
    setIsLoading(true)
    setError('')

    try {
      console.log('🔐 Attempting login...')
      const result = await login(loginForm.username, loginForm.password)
      
      if (result.success) {
        console.log('✅ Login successful, will redirect automatically')
        // Don't manually navigate - let the useEffect handle it
      } else {
        console.log('❌ Login failed:', result.error)
        setError(result.error)
      }
    } catch (error) {
      console.error('❌ Login error:', error)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while auth is initializing
  if (!authInitialized) {
    return (
      <div className="login-container">
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-info mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-white">Initializing...</h4>
          </div>
        </div>
      </div>
    )
  }

  // If user is already authenticated, show loading while redirecting
  if (isAuthenticated && currentUser) {
    return (
      <div className="login-container">
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center">
            <div className="spinner-border text-success mb-3" role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <h4 className="text-white">Welcome back! Redirecting...</h4>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="login-container">
      {/* Floating Background Elements */}
      <div className="floating-elements">
        <div className="floating-element"></div>
        <div className="floating-element"></div>
        <div className="floating-element"></div>
      </div>

      <div className="d-flex align-items-center justify-content-center min-vh-100 p-4">
        <div className="login-card" style={{width: '500px', maxWidth: '100%'}}>
          <div className="p-5">
            {/* Logo and Header */}
            <div className="text-center mb-5">
              <div className="mb-3">
                <img src={KivaLogo} alt="KIVA Logo" className="login-logo" />
              </div>
              <h1 className="h2 fw-bold logo-section mb-2">
                KIVA NET SERVICE MANAGER
              </h1>
              <p className="text-white mb-3">Internal Management System</p>
              <span className="version-badge">v2.0.1</span>
            </div>

            {/* System Info */}
            <div className="system-info text-center mb-4">
              <h6 className="text-cyan mb-2">
                <i className="fas fa-shield-alt me-2"></i>
                Secure Access Portal
              </h6>
              <small className="text-white opacity-75">
                Authorized personnel only • All activities are logged
              </small>
            </div>

            {/* Error Display */}
            {error && (
              <div className="alert alert-danger mb-4">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {error}
              </div>
            )}
            
            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <div className="mb-4">
                <label className="form-label text-cyan fw-bold">
                  <i className="fas fa-user me-2"></i>Username
                </label>
                <input 
                  type="text" 
                  className="form-control form-control-kiva"
                  placeholder="Enter your username"
                  value={loginForm.username}
                  onChange={(e) => setLoginForm({...loginForm, username: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="mb-5">
                <label className="form-label text-cyan fw-bold">
                  <i className="fas fa-lock me-2"></i>Password
                </label>
                <input 
                  type="password" 
                  className="form-control form-control-kiva"
                  placeholder="Enter your password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({...loginForm, password: e.target.value})}
                  disabled={isLoading}
                  required
                />
              </div>
              <button 
                type="submit" 
                className="btn btn-kiva-login w-100"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <i className="fas fa-spinner fa-spin me-2"></i>
                    Signing In...
                  </>
                ) : (
                  <>
                    <i className="fas fa-sign-in-alt me-2"></i>
                    Sign In to System
                  </>
                )}
              </button>
            </form>

            {/* Demo Credentials */}
            <div className="demo-credentials text-center mt-4">
              <small>
                <i className="fas fa-info-circle me-2"></i>
                <strong>Default Admin:</strong> admin / admin123
              </small>
            </div>

            {/* Footer */}
            <div className="text-center mt-4 pt-3" style={{borderTop: '1px solid rgba(0, 255, 255, 0.2)'}}>
              <small className="text-white opacity-50">
                © 2025 KIVA Service Manager
              </small>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login