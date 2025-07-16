import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Orders from './components/Orders'
import Dashboard from './components/Dashboard'
import Users from './components/Users'
import Login from './components/Login'
import KivaLogo from './poze/3dlogo.png'
import './App.css'
import './styles/global.css'
import './styles/components/navbar.css'
import './styles/components/buttons.css'
import './styles/components/cards.css'
import './styles/components/tables.css'

// Home component (your original homepage content)
function Home() {
  const { currentUser, logout, isLoading, authInitialized } = useAuth()
  const navigate = useNavigate()

  // Add this debug console log
  console.log('🔍 Current User Debug:', {
    user: currentUser,
    role: currentUser?.role,
    roleType: typeof currentUser?.role,
    isAdmin: currentUser?.role === 'ADMIN',
    isAdminLower: currentUser?.role === 'admin'
  })

  const navigateToModule = (module) => {
    navigate(`/${module}`)
  }

  // Show loading only if auth is not initialized yet
  if (!authInitialized || isLoading) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x text-cyan mb-3"></i>
          <h4 className="text-white">Loading...</h4>
        </div>
      </div>
    )
  }

  // If no user after auth is initialized, this should not happen with ProtectedRoute
  // but adding as safety net
  if (!currentUser) {
    return <Login />
  }

  const isAdmin = currentUser.role === 'ADMIN' || currentUser.role === 'admin'

  return (
    <div className="app-background">
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src={KivaLogo} alt="KIVA Logo" className="kiva-logo" />
            <span className="text-cyan">KIVA</span> <span className="text-white ms-2">Service Manager</span>
          </Link>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3 text-white">
              Welcome, {currentUser.fullName || currentUser.username} 
              <span className="badge ms-2" style={{background: '#00ffff', color: '#000000'}}>{currentUser.role}</span>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout} style={{borderColor: '#00ffff', color: '#00ffff'}}>
              <i className="fas fa-sign-out-alt me-2"></i>Sign Out
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="text-white py-5" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-lg-8">
              <h1 className="display-4 fw-bold mb-3">
                <span className="text-cyan">Service Management</span> <span className="text-white">HOME</span>
              </h1>
              <p className="lead mb-4 text-white">
                Welcome back, {currentUser.username}! {isAdmin && <span className="text-cyan">• Administrator Access</span>}
              </p>
            </div>
            <div className="col-lg-4 text-center">
              <div className="stats-card rounded p-4">
                <h3 className="text-cyan">Quick Stats</h3>
                <div className="row text-center">
                  <div className="col-6">
                    <h4 className="text-white">23</h4>
                    <small className="text-cyan">Active Orders</small>
                  </div>
                  <div className="col-6">
                    <h4 className="text-white">156</h4>
                    <small className="text-cyan">Total Clients</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="container py-5" style={{background: 'transparent'}}>
        <div className="text-center mb-5">
          <h2 className="fw-bold text-cyan">Modules</h2>
        </div>

        <div className="row g-4">
          {/* Dashboard Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('dashboard')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-chart-line fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Dashboard</h5>
                <p className="card-text text-white">
                  View analytics, reports, and key performance indicators
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('dashboard')
                  }}
                >
                  <i className="fas fa-chart-line me-2"></i>Open Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Orders Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('orders')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-clipboard-list fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Service Orders</h5>
                <p className="card-text text-white">
                  Manage service requests, track progress, and update statuses
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('orders')
                  }}
                >
                  <i className="fas fa-clipboard-list me-2"></i>Manage Orders
                </button>
              </div>
            </div>
          </div>

          {/* Users Module - Only for Admins */}
          {isAdmin && (
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('users')}>
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)'}}>
                    <i className="fas fa-user-cog fa-2x text-white"></i>
                  </div>
                  <h5 className="card-title fw-bold text-cyan">User Management</h5>
                  <p className="card-text text-white">
                    Create and manage system users (Admin Only)
                  </p>
                  <button 
                    className="btn btn-kiva-outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      navigateToModule('users')
                    }}
                  >
                    <i className="fas fa-user-cog me-2"></i>Manage Users
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Clients Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('clients')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-users fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Clients</h5>
                <p className="card-text text-white">
                  Manage client information and contact details
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('clients')
                  }}
                >
                  <i className="fas fa-users me-2"></i>Manage Clients
                </button>
              </div>
            </div>
          </div>

          {/* Devices Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('devices')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-laptop fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Devices</h5>
                <p className="card-text text-white">
                  Track and manage device inventory and specifications
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('devices')
                  }}
                >
                  <i className="fas fa-laptop me-2"></i>Manage Devices
                </button>
              </div>
            </div>
          </div>

          {/* Reports Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('reports')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-file-alt fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Reports</h5>
                <p className="card-text text-white">
                  Generate detailed reports and analytics
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('reports')
                  }}
                >
                  <i className="fas fa-file-alt me-2"></i>View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Main App with Router and AuthProvider (keeping all your original routes)
function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />
          
          {/* Protected routes - using your original structure but with ProtectedRoute wrapper */}
          <Route path="/" element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          } />
          
          <Route path="/orders" element={
            <ProtectedRoute>
              <Orders />
            </ProtectedRoute>
          } />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Admin-only route */}
          <Route path="/users" element={
            <ProtectedRoute requiredRole="ADMIN">
              <Users />
            </ProtectedRoute>
          } />
          
          {/* Your original placeholder routes */}
          <Route path="/clients" element={
            <ProtectedRoute>
              <div style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
                minHeight: '100vh', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <h2 className="text-cyan">Clients Coming Soon</h2>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/devices" element={
            <ProtectedRoute>
              <div style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
                minHeight: '100vh', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <h2 className="text-cyan">Devices Coming Soon</h2>
              </div>
            </ProtectedRoute>
          } />
          
          <Route path="/reports" element={
            <ProtectedRoute>
              <div style={{
                background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', 
                minHeight: '100vh', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center'
              }}>
                <h2 className="text-cyan">Reports Coming Soon</h2>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  )
}

export default App