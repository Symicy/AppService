import { createContext, useContext, useState, useEffect } from 'react'
import { authAPI, TokenManager } from '../services/api/authAPI'

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [authInitialized, setAuthInitialized] = useState(false)

  // Initialize auth state on app load - ONLY ONCE
  useEffect(() => {
    if (!authInitialized) {
      initializeAuth()
    }
  }, [authInitialized])

  const initializeAuth = async () => {
    console.log('🔍 Initializing authentication...')
    setIsLoading(true)
    
    try {
      const token = TokenManager.getToken()
      const userData = localStorage.getItem('kivaUser')
      
      console.log('🔑 Checking stored credentials:', {
        hasToken: !!token,
        hasUserData: !!userData,
        tokenValid: token ? TokenManager.isTokenValid(token) : false
      })
      
      if (token && TokenManager.isTokenValid(token) && userData) {
        // Token exists and is valid
        const user = JSON.parse(userData)
        
        // Decode token to get latest user info
        const tokenPayload = TokenManager.decodeToken(token)
        if (tokenPayload) {
          user.role = tokenPayload.role || user.role
          user.exp = tokenPayload.exp
        }
        
        setCurrentUser(user)
        setIsAuthenticated(true)
        
        console.log('✅ User restored from storage:', user.username)
      } else {
        // No valid token, clear everything but DON'T call logout (prevents loop)
        console.log('❌ No valid credentials found, clearing storage')
        TokenManager.removeToken()
        setCurrentUser(null)
        setIsAuthenticated(false)
      }
    } catch (error) {
      console.error('❌ Error initializing auth:', error)
      TokenManager.removeToken()
      setCurrentUser(null)
      setIsAuthenticated(false)
    }
    
    setIsLoading(false)
    setAuthInitialized(true)
    console.log('🎯 Authentication initialization complete')
  }

  const login = async (username, password) => {
    try {
      console.log('🚀 Login attempt for:', username)
      setIsLoading(true)
      
      const response = await authAPI.login(username, password)
      
      if (!response.token) {
        console.log('❌ No token received from server')
        return { 
          success: false, 
          error: 'No authentication token received from server' 
        }
      }
      
      // Store the JWT token
      TokenManager.setToken(response.token)
      
      // Decode token to get user information
      const tokenPayload = TokenManager.decodeToken(response.token)
      console.log('🔍 Decoded JWT payload:', tokenPayload)
      
      // Create user object with priority: response data > token data > defaults
      const userData = {
        username: response.username || tokenPayload?.sub || username,
        role: response.role || tokenPayload?.role || 'USER', // Use response role first
        fullName: response.fullName || response.name || username,
        email: response.email || tokenPayload?.email || '',
        exp: tokenPayload?.exp,
        iat: tokenPayload?.iat,
        userId: tokenPayload?.userId,
        token: response.token
      }
      
      console.log('👤 User data created:', {
        username: userData.username,
        role: userData.role,
        roleFromResponse: response.role,
        roleFromToken: tokenPayload?.role
      })
      
      // Store user data
      localStorage.setItem('kivaUser', JSON.stringify(userData))
      setCurrentUser(userData)
      setIsAuthenticated(true)
      
      console.log('✅ Login successful:', {
        username: userData.username,
        role: userData.role,
        tokenExp: userData.exp ? new Date(userData.exp * 1000).toLocaleString() : 'N/A'
      })
      
      return { success: true, user: userData }
      
    } catch (error) {
      console.error('❌ Login error:', error)
      
      let errorMessage = 'Login failed'
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8080.'
      } else if (error.response?.status === 403) {
        errorMessage = 'Access forbidden. Please check your credentials.'
      } else if (error.response?.status === 401) {
        errorMessage = 'Invalid username or password'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData) => {
    try {
      console.log('🚀 Registration attempt for:', userData.username)
      
      const response = await authAPI.register(userData)
      
      console.log('✅ Registration successful:', {
        username: userData.username,
        role: userData.role
      })
      
      // DON'T auto-login - just return success
      return { 
        success: true, 
        data: response,
        message: 'User created successfully! They can now log in with their credentials.'
      }
      
    } catch (error) {
      console.error('❌ Registration error:', error)
      
      let errorMessage = 'Registration failed'
      
      if (error.code === 'ECONNREFUSED' || error.message.includes('Network Error')) {
        errorMessage = 'Cannot connect to server. Please check if the backend is running on port 8080.'
      } else if (error.response?.status === 409) {
        errorMessage = 'Username or email already exists'
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      
      return { 
        success: false, 
        error: errorMessage
      }
    }
  }

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...')
      // Call backend logout if needed
      await authAPI.logout()
    } catch (error) {
      console.error('❌ Logout error:', error)
    } finally {
      // Always clear local state
      TokenManager.removeToken()
      setCurrentUser(null)
      setIsAuthenticated(false)
      console.log('✅ User logged out successfully')
    }
  }

  // Check if user has specific role
  const hasRole = (role) => {
    return currentUser?.role === role
  }

  // Check if user is admin
  const isAdmin = () => {
    return hasRole('ADMIN') || hasRole('admin')
  }

  const value = {
    currentUser,
    isAuthenticated,
    isLoading,
    authInitialized,
    login,
    register,
    logout,
    hasRole,
    isAdmin
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}