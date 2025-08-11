import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { authAPI } from '../services/api/authAPI' // Add this import
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/forms.css'
import '../styles/components/badges.css'

function Users() {
  const { currentUser, logout, register } = useAuth()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingUsers, setIsLoadingUsers] = useState(true) // Add this for initial load
  const [error, setError] = useState('')
  const [showNewUserModal, setShowNewUserModal] = useState(false)
  const [newUserForm, setNewUserForm] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    role: 'TECHNICIAN'
  })

  // Adaugă următoarele state-uri la începutul componentei
  const [showEditUserModal, setShowEditUserModal] = useState(false);
  const [editUserForm, setEditUserForm] = useState({
    id: null,
    username: '',
    email: '',
    phone: '',
    role: '',
    password: '' // Opțional pentru editare
  });

  // Define the admin check function FIRST, before using it
  const isAdmin = (role) => {
    if (!role) return false
    const roleStr = role.toString().toUpperCase()
    return roleStr === 'ADMIN' || roleStr === 'ADMINISTRATOR'
  }

  // Check if user is admin (AFTER defining isAdmin function)
  const userIsAdmin = isAdmin(currentUser?.role)

  // Fetch users when component loads
  useEffect(() => {
    const fetchUsers = async () => {
      if (!userIsAdmin) return // Don't fetch if not admin
      
      try {
        setIsLoadingUsers(true)
        console.log('📋 Fetching users from backend...')
        const fetchedUsers = await authAPI.getAllUsers()
        
        // Filter out the current admin user from the list
        const otherUsers = fetchedUsers.filter(user => user.username !== currentUser?.username)
        setUsers(otherUsers)
        
        console.log('✅ Users loaded:', otherUsers.length)
      } catch (error) {
        console.error('❌ Error fetching users:', error)
        setError('Failed to load users from server')
      } finally {
        setIsLoadingUsers(false)
      }
    }

    if (userIsAdmin) {
      fetchUsers()
    }
  }, [userIsAdmin, currentUser?.username])

  const handleCreateUser = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      console.log('👤 Creating new user:', newUserForm.username)
      const result = await register(newUserForm)
      
      if (result.success) {
        // Instead of manually adding to state, refetch from backend
        try {
          const updatedUsers = await authAPI.getAllUsers()
          const otherUsers = updatedUsers.filter(user => user.username !== currentUser?.username)
          setUsers(otherUsers)
          console.log('✅ Users list refreshed after creation')
        } catch (fetchError) {
          console.error('❌ Error refreshing users list:', fetchError)
          // Fallback: add to local state if refresh fails
          const newUser = {
            id: Date.now(),
            username: newUserForm.username,
            email: newUserForm.email,
            phone: newUserForm.phone,
            role: newUserForm.role,
            createdAt: new Date().toISOString().split('T')[0]
          }
          setUsers([...users, newUser])
        }
        
        // Close modal and reset form
        setShowNewUserModal(false)
        setNewUserForm({
          username: '',
          password: '',
          email: '',
          phone: '',
          role: 'TECHNICIAN'
        })
        
        // Show success message
        console.log('✅ User created successfully!')
        alert(`User "${newUserForm.username}" created successfully! They can now log in with their credentials.`)
        
      } else {
        console.log('❌ User creation failed:', result.error)
        setError(result.error)
      }
    } catch (error) {
      console.error('❌ Create user error:', error)
      setError('Failed to create user. Please try again.')
    }
    
    setIsLoading(false)
  }

  const deleteUser = async (userId, username) => {
    // Prevent deleting current user
    if (username === currentUser?.username) {
      alert('You cannot delete your own account!')
      return
    }

    if (window.confirm(`Are you sure you want to permanently delete user "${username}"? This action cannot be undone.`)) {
      try {
        console.log('🗑️ Deleting user:', username, 'ID:', userId)
        
        // Call backend API to delete user
        await authAPI.deleteUser(userId)
        
        // Remove from local state after successful deletion
        setUsers(users.filter(user => user.id !== userId))
        
        console.log('✅ User deleted successfully from database')
        alert(`User "${username}" has been permanently deleted!`)
        
      } catch (error) {
        console.error('❌ Error deleting user:', error)
        
        let errorMessage = 'Failed to delete user'
        
        if (error.response?.status === 404) {
          errorMessage = 'User not found'
        } else if (error.response?.status === 403) {
          errorMessage = 'You do not have permission to delete this user'
        } else if (error.response?.status === 500) {
          errorMessage = 'Server error occurred while deleting user'
        }
        
        setError(errorMessage)
        alert(`Error: ${errorMessage}`)
      }
    }
  }

  // Adaugă această funcție pentru a deschide modalul de editare
  const openEditUserModal = (user) => {
    setEditUserForm({
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone || '',
      role: user.role,
      password: '' // Gol inițial, va fi opțional
    });
    setShowEditUserModal(true);
  };

  // Adaugă această funcție pentru a actualiza utilizatorul
  const handleUpdateUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('👤 Updating user:', editUserForm.username, 'ID:', editUserForm.id);
      
      // Creăm un obiect de actualizare, excludem parola dacă e goală
      const updateData = {
        ...editUserForm,
        password: editUserForm.password.trim() === '' ? undefined : editUserForm.password
      };
      
      // Apelăm API-ul pentru actualizare
      await authAPI.updateUser(editUserForm.id, updateData);
      
      // Actualizăm lista locală de utilizatori
      setUsers(users.map(user => 
        user.id === editUserForm.id 
          ? { ...user, 
              username: editUserForm.username, 
              email: editUserForm.email,
              phone: editUserForm.phone,
              role: editUserForm.role
            } 
          : user
      ));
      
      // Închidem modalul și resetăm formularul
      setShowEditUserModal(false);
      setEditUserForm({
        id: null,
        username: '',
        email: '',
        phone: '',
        role: '',
        password: ''
      });
      
      // Afișăm mesaj de succes
      alert(`User "${editUserForm.username}" has been updated successfully!`);
      
    } catch (error) {
      console.error('❌ Update user error:', error);
      setError('Failed to update user. Please try again.');
    }
    
    setIsLoading(false);
  };

  // If not admin, show access denied
  if (!userIsAdmin) {
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
          <p className="text-white mb-4">Only administrators can access user management.</p>
          <p className="text-muted">Your current role: <strong>{currentUser?.role || 'Unknown'}</strong></p>
          <p className="text-muted">Required role: <strong>ADMIN</strong></p>
          <Link to="/" className="btn btn-kiva-action">
            <i className="fas fa-home me-2"></i>Return to Home
          </Link>
        </div>
      </div>
    )
  }

  // Show loading while fetching users
  if (isLoadingUsers) {
    return (
      <div className="d-flex align-items-center justify-content-center min-vh-100" 
           style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="text-center">
          <i className="fas fa-spinner fa-spin fa-3x text-cyan mb-3"></i>
          <h4 className="text-white">Loading Users...</h4>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src={KivaLogo} alt="KIVA Logo" className="kiva-logo" />
            <span className="text-cyan">KIVA</span> 
            <span className="text-white ms-2">Service Manager</span>
          </Link>
          <div className="navbar-nav">
            <Link className="nav-link text-white" to="/">
              <i className="fas fa-home me-2"></i>Home
            </Link>
            <Link className="nav-link text-white" to="/orders">
              <i className="fas fa-clipboard-list me-2"></i>Orders
            </Link>
            <Link className="nav-link text-white" to="/clients">
              <i className="fas fa-users me-2"></i>Clients
            </Link>
            <Link className="nav-link text-white" to="/devices">
              <i className="fas fa-laptop me-2"></i>Devices
            </Link>
            <Link className="nav-link text-cyan" to="/users">
              <i className="fas fa-user-cog me-2"></i>Users
            </Link>
          </div>
          <div className="navbar-nav ms-auto">
            <span className="navbar-text me-3 text-white">
              {currentUser?.fullName || currentUser?.username}
              <span className="badge ms-2" style={{background: '#00ffff', color: '#000000'}}>
                {currentUser?.role}
              </span>
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={logout} style={{borderColor: '#00ffff', color: '#00ffff'}}>
              <i className="fas fa-sign-out-alt me-2"></i>Sign Out
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh'}}>
        {/* Header with breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-cyan">Home</Link></li>
            <li className="breadcrumb-item text-white">User Management</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">
              <i className="fas fa-user-cog me-3"></i>User Management
            </h2>
            <p className="text-white mb-0">Create and manage system users (Admin Only)</p>
            <small className="text-success">✅ Admin access confirmed for: {currentUser?.username}</small>
          </div>
          <button 
            className="btn btn-kiva-action"
            onClick={() => setShowNewUserModal(true)}
          >
            <i className="fas fa-user-plus me-2"></i>Create New User
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Users</h6>
                    <h3 className="mb-0 text-white">{users.length + 1}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-users fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Administrators</h6>
                    <h3 className="mb-0 text-white">{users.filter(u => isAdmin(u.role)).length + 1}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-shield fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Technicians</h6>
                    <h3 className="mb-0 text-white">{users.filter(u => u.role === 'TECHNICIAN').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-wrench fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Active Today</h6>
                    <h3 className="mb-0 text-white">1</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-user-check fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <i className="fas fa-exclamation-triangle me-2"></i>
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="card card-kiva">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-kiva">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Role</th>
                    <th>Created</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Current Admin User */}
                  <tr>
                    <td>
                      <strong className="text-cyan">1</strong>
                    </td>
                    <td>
                      <div className="text-white">{currentUser?.username}</div>
                      <span className="badge" style={{background: '#28a745', color: 'white'}}>Current User</span>
                    </td>
                    <td className="text-cyan">{currentUser?.email || 'admin@kiva.com'}</td>
                    <td className="text-cyan">+40 123 456 789</td>
                    <td>
                      <span className="badge" style={{background: '#dc3545', color: 'white'}}>
                        {currentUser?.role}
                      </span>
                    </td>
                    <td className="text-cyan">2025-01-01</td>
                    <td>
                      <span className="badge" style={{background: '#28a745', color: 'white'}}>
                        <i className="fas fa-circle me-1"></i>Active
                      </span>
                    </td>
                    <td>
                      <span className="text-muted small">Protected Account</span>
                    </td>
                  </tr>
                  
                  {/* Other Users from Backend */}
                  {users.map((user, index) => (
                    <tr key={user.id}>
                      <td>
                        <strong className="text-cyan">{user.id}</strong>
                      </td>
                      <td>
                        <div className="text-white">{user.username}</div>
                      </td>
                      <td className="text-cyan">{user.email}</td>
                      <td className="text-cyan">{user.phone || 'N/A'}</td>
                      <td>
                        <span className={`badge ${isAdmin(user.role) ? 'bg-danger' : 'bg-primary'}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="text-cyan">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className="badge bg-success">
                          <i className="fas fa-circle me-1"></i>Active
                        </span>
                      </td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-kiva-action"
                            onClick={() => openEditUserModal(user)}
                            title="Edit User"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn btn-outline-danger"
                            onClick={() => deleteUser(user.id, user.username)}
                            title="Delete User"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  
                  {/* Show message if no users */}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center text-muted py-4">
                        <i className="fas fa-users fa-2x mb-3"></i>
                        <br />
                        No additional users found. Create your first user above!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Create New User Modal - Same as before */}
      {showNewUserModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
              <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                <h5 className="modal-title text-cyan">
                  <i className="fas fa-user-plus me-2"></i>Create New User
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowNewUserModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-user me-2"></i>Username
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva"
                        placeholder="Enter username"
                        value={newUserForm.username}
                        onChange={(e) => setNewUserForm({...newUserForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-envelope me-2"></i>Email
                      </label>
                      <input 
                        type="email" 
                        className="form-control form-control-kiva"
                        placeholder="Enter email"
                        value={newUserForm.email}
                        onChange={(e) => setNewUserForm({...newUserForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-lock me-2"></i>Password
                      </label>
                      <input 
                        type="password" 
                        className="form-control form-control-kiva"
                        placeholder="Enter password"
                        value={newUserForm.password}
                        onChange={(e) => setNewUserForm({...newUserForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-phone me-2"></i>Phone
                      </label>
                      <input 
                        type="tel" 
                        className="form-control form-control-kiva"
                        placeholder="Enter phone number"
                        value={newUserForm.phone}
                        onChange={(e) => setNewUserForm({...newUserForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-cyan fw-bold">
                      <i className="fas fa-user-tag me-2"></i>Role
                    </label>
                    <select 
                      className="form-select form-select-kiva"
                      value={newUserForm.role}
                      onChange={(e) => setNewUserForm({...newUserForm, role: e.target.value})}
                      required
                    >
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> New users will be able to log in immediately after creation.
                  </div>
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button type="button" className="btn btn-kiva-outline" onClick={() => setShowNewUserModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-kiva-action" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Creating...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-user-plus me-2"></i>Create User
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal - New Section */}
      {showEditUserModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
              <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                <h5 className="modal-title text-cyan">
                  <i className="fas fa-edit me-2"></i>Edit User
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditUserModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateUser}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-user me-2"></i>Username
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva"
                        placeholder="Enter username"
                        value={editUserForm.username}
                        onChange={(e) => setEditUserForm({...editUserForm, username: e.target.value})}
                        required
                      />
                      <small className="text-warning">
                        <i className="fas fa-info-circle me-1"></i>
                        Changing username may affect user's login
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-envelope me-2"></i>Email
                      </label>
                      <input 
                        type="email" 
                        className="form-control form-control-kiva"
                        placeholder="Enter email"
                        value={editUserForm.email}
                        onChange={(e) => setEditUserForm({...editUserForm, email: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-lock me-2"></i>Password
                      </label>
                      <input 
                        type="password" 
                        className="form-control form-control-kiva"
                        placeholder="Leave empty to keep current password"
                        value={editUserForm.password}
                        onChange={(e) => setEditUserForm({...editUserForm, password: e.target.value})}
                      />
                      <small className="text-info">
                        <i className="fas fa-info-circle me-1"></i>
                        Optional - leave empty to keep current password
                      </small>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-phone me-2"></i>Phone
                      </label>
                      <input 
                        type="tel" 
                        className="form-control form-control-kiva"
                        placeholder="Enter phone number"
                        value={editUserForm.phone}
                        onChange={(e) => setEditUserForm({...editUserForm, phone: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-cyan fw-bold">
                      <i className="fas fa-user-tag me-2"></i>Role
                    </label>
                    <select 
                      className="form-select form-select-kiva"
                      value={editUserForm.role}
                      onChange={(e) => setEditUserForm({...editUserForm, role: e.target.value})}
                      required
                    >
                      <option value="TECHNICIAN">Technician</option>
                      <option value="ADMIN">Administrator</option>
                    </select>
                  </div>

                  <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                    <i className="fas fa-info-circle me-2"></i>
                    <strong>Note:</strong> Changes will take effect immediately.
                  </div>
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button type="button" className="btn btn-kiva-outline" onClick={() => setShowEditUserModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-kiva-action" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save me-2"></i>Save Changes
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Users