import axios from 'axios'

const API_BASE_URL = 'http://localhost:8080/api'

// Define TokenManager FIRST
export const TokenManager = {
  getToken: () => {
    return localStorage.getItem('kivaToken')
  },
  
  setToken: (token) => {
    localStorage.setItem('kivaToken', token)
  },
  
  removeToken: () => {
    localStorage.removeItem('kivaToken')
    localStorage.removeItem('kivaUser')
  },
  
  isTokenValid: (token) => {
    if (!token) return false
    
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Date.now() / 1000
      return payload.exp > currentTime
    } catch (error) {
      return false
    }
  },
  
  decodeToken: (token) => {
    if (!token) return null
    
    try {
      return JSON.parse(atob(token.split('.')[1]))
    } catch (error) {
      console.error('Error decoding token:', error)
      return null
    }
  }
}

// Create axios instance AFTER TokenManager is defined
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add request interceptor to include auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('🔑 Adding token to request:', token?.substring(0, 20) + '...')
    } else {
      console.log('⚠️ No token found for request')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle 403 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 403) {
      console.error('🚫 403 Forbidden - Token or role issue:', {
        url: error.config?.url,
        method: error.config?.method,
        headers: error.config?.headers,
        data: error.response?.data
      })
    }
    return Promise.reject(error)
  }
)

export const authAPI = {
  login: async (username, password) => {
    console.log('🔐 Making login request to:', `${API_BASE_URL}/users/login`)
    try {
      const response = await apiClient.post('/users/login', {
        username,
        password
      })
      console.log('✅ Login API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Login API error:', error.response?.data || error.message)
      throw error
    }
  },

  register: async (userData) => {
    console.log('📝 Making registration request to:', `${API_BASE_URL}/users/register`)
    console.log('📝 Registration data:', userData)
    
    try {
      const response = await apiClient.post('/users/register', {
        username: userData.username,
        password: userData.password,
        email: userData.email,
        phone: userData.phone || '',
        role: userData.role || 'TECHNICIAN'
      })
      console.log('✅ Registration API response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Registration API error:', error.response?.data || error.message)
      throw error
    }
  },

  logout: async () => {
    console.log('🚪 Making logout request')
    try {
      // Call backend logout if needed
      await apiClient.post('/users/logout')
    } catch (error) {
      console.error('❌ Logout API error:', error)
      // Don't throw error - logout should always succeed locally
    }
  },

  getCurrentUser: async () => {
    console.log('👤 Getting current user info')
    try {
      const response = await apiClient.get('/users/me')
      return response.data
    } catch (error) {
      console.error('❌ Get current user error:', error)
      throw error
    }
  },

  getAllUsers: async () => {
    console.log('👥 Getting all users')
    try {
      const response = await apiClient.get('/users/all')
      console.log('✅ Get all users response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Get all users error:', error)
      throw error
    }
  },

  // Add update user method
  updateUser: async (userId, userData) => {
    console.log('✏️ Updating user with ID:', userId)
    console.log('📝 Update data:', userData)
    try {
      const response = await apiClient.put(`/users/update/${userId}`, userData)
      console.log('✅ Update user response:', response.data)
      return response.data
    } catch (error) {
      console.error('❌ Update user error:', error.response?.data || error.message)
      throw error
    }
  },

  deleteUser: async (userId) => {
    console.log('🗑️ Deleting user with ID:', userId)
    try {
      const response = await apiClient.delete(`/users/delete/${userId}`)
      console.log('✅ Delete user response:', response.status)
      return response.data
    } catch (error) {
      console.error('❌ Delete user error:', error)
      throw error
    }
  }
}

export default authAPI