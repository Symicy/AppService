import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom'
import Orders from './components/Orders'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import KivaLogo from './poze/3dlogo.png'
import './App.css'
import './styles/global.css'
import './styles/components/navbar.css'
import './styles/components/buttons.css'
import './styles/components/cards.css'
import './styles/components/tables.css'

// Home component (your current homepage)
function Home() {
  const [currentUser, setCurrentUser] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const savedUser = localStorage.getItem('kivaUser')
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser))
    }
  }, [])

  const handleLogout = () => {
    setCurrentUser(null)
    localStorage.removeItem('kivaUser')
  }

  const navigateToModule = (module) => {
    navigate(`/${module}`)
  }

  if (!currentUser) {
    return <Login setCurrentUser={setCurrentUser} />
  }

  return (
    <div className="app-background">
      <link 
        href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" 
        rel="stylesheet" 
      />
      <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" 
        integrity="sha512-DTOQO9RWCH3ppGqcWaEA1BIZOC6xxalwEsw9c2QQeAIftl+Vegovlnee1c9QX4TctnWMn13TZye+giMm8e2LwA==" 
        crossorigin="anonymous" 
        referrerpolicy="no-referrer" 
      />
      
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
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout} style={{borderColor: '#00ffff', color: '#00ffff'}}>
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
                Sefu' la bani
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

      {/* Main Modules */}
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
                  Create, track, and manage service orders with PDF and QR codes
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

          {/* Clients Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('clients')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-users fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Client Management</h5>
                <p className="card-text text-white">
                  Manage individual and corporate client information
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
                <h5 className="card-title fw-bold text-cyan">Device Registry</h5>
                <p className="card-text text-white">
                  Track and manage all devices in service
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

          {/* Users Module - Admin Only */}
          {currentUser.role === 'admin' && (
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('users')}>
                <div className="card-body text-center p-4">
                  <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                    <i className="fas fa-user-cog fa-2x text-dark"></i>
                  </div>
                  <h5 className="card-title fw-bold text-cyan">User Management</h5>
                  <p className="card-text text-white">
                    Manage system users and access permissions
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

          {/* Reports Module */}
          <div className="col-md-6 col-lg-4">
            <div className="card h-100 shadow-sm border-0 hover-card" onClick={() => navigateToModule('reports')}>
              <div className="card-body text-center p-4">
                <div className="rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px', background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)'}}>
                  <i className="fas fa-chart-bar fa-2x text-dark"></i>
                </div>
                <h5 className="card-title fw-bold text-cyan">Reports</h5>
                <p className="card-text text-white">
                  Generate and view detailed system reports
                </p>
                <button 
                  className="btn btn-kiva-outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    navigateToModule('reports')
                  }}
                >
                  <i className="fas fa-chart-bar me-2"></i>View Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="py-5" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)'}}>
        <div className="container">
          <div className="text-center mb-4">
            <h3 className="fw-bold text-cyan">Quick Actions</h3>
          </div>
          <div className="row justify-content-center">
            <div className="col-auto">
              <button 
                className="btn btn-kiva-primary btn-lg me-3"
                onClick={() => navigateToModule('orders')}
              >
                <i className="fas fa-plus me-2"></i>New Order
              </button>
              <button 
                className="btn btn-kiva-outline btn-lg me-3"
                onClick={() => navigateToModule('clients')}
              >
                <i className="fas fa-user-plus me-2"></i>Add Client
              </button>
              <button 
                className="btn btn-kiva-outline btn-lg"
                onClick={() => navigateToModule('reports')}
              >
                <i className="fas fa-chart-line me-2"></i>Daily Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </div>
  )
}

// Main App with Router
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/clients" element={<div style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 className="text-cyan">Clients Coming Soon</h2></div>} />
        <Route path="/devices" element={<div style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 className="text-cyan">Devices Coming Soon</h2></div>} />
        <Route path="/users" element={<div style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 className="text-cyan">Users Coming Soon</h2></div>} />
        <Route path="/reports" element={<div style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><h2 className="text-cyan">Reports Coming Soon</h2></div>} />
      </Routes>
    </Router>
  )
}

export default App