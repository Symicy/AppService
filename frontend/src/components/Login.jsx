import { useState } from 'react'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/login.css'

function Login({ setCurrentUser }) {
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })

  const handleLogin = (e) => {
    e.preventDefault()
    const mockUser = {
      id: 1,
      username: loginForm.username,
      role: 'admin',
      fullName: 'John Admin'
    }
    setCurrentUser(mockUser)
    localStorage.setItem('kivaUser', JSON.stringify(mockUser))
  }

  return (
    <>
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
      <link 
        href="https://fonts.googleapis.com/css2?family=Oxanium:wght@200;300;400;500;600;700;800&display=swap" 
        rel="stylesheet" 
      />

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
                    required
                  />
                </div>
                <button 
                  type="submit" 
                  className="btn btn-kiva-login w-100"
                >
                  <i className="fas fa-sign-in-alt me-2"></i>
                  Sign In to System
                </button>
              </form>

              {/* Demo Credentials */}
              <div className="demo-credentials text-center mt-4">
                <small>
                  <i className="fas fa-info-circle me-2"></i>
                  <strong>Demo Access:</strong> admin / password
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

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  )
}

export default Login