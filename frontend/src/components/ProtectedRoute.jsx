import { useAuth } from '../contexts/AuthContext'
import Login from './Login'

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { currentUser, isLoading, isAuthenticated } = useAuth()

  // Helper function to check admin role
  const isAdmin = (role) => {
    if (!role) return false
    const roleStr = role.toString().toUpperCase()
    return roleStr === 'ADMIN' || roleStr === 'ADMINISTRATOR'
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" 
           style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x text-cyan mb-3"></i>
          <h4 className="text-white">Authenticating...</h4>
        </div>
      </div>
    )
  }

  // If not authenticated, show login
  if (!isAuthenticated || !currentUser) {
    return <Login />
  }

  // If specific role required, check it
  if (requiredRole) {
    let hasRequiredRole = false
    
    if (requiredRole.toUpperCase() === 'ADMIN') {
      hasRequiredRole = isAdmin(currentUser.role)
    } else {
      hasRequiredRole = currentUser.role === requiredRole
    }
    
    if (!hasRequiredRole) {
      return (
        <div style={{
          background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
          minHeight: '100vh', 
          color: 'white', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center'
        }}>
          <div className="text-center">
            <i className="fas fa-shield-alt fa-3x text-danger mb-3"></i>
            <h2 className="text-danger">Access Denied</h2>
            <p className="text-white mb-4">
              You need {requiredRole} privileges to access this page.
            </p>
            <p className="text-muted">Your role: <strong>{currentUser.role}</strong></p>
            <p className="text-muted">Required: <strong>{requiredRole}</strong></p>
          </div>
        </div>
      )
    }
  }

  // User is authenticated and has required role
  return children
}

export default ProtectedRoute