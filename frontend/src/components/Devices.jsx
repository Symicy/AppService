import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import KivaLogo from '../poze/3dlogo.png'
import * as devicesAPI from '../services/api/devicesAPI'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/forms.css'

function Devices() {
  const [devices, setDevices] = useState([])
  const [selectedDevice, setSelectedDevice] = useState(null)
  const [showEditDeviceModal, setShowEditDeviceModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')
  const [filterBrand, setFilterBrand] = useState('all')
  
  const navigate = useNavigate()
  const location = useLocation()
  
  // Extrage orderId direct din URL - înlocuiește useEffect-ul pentru filtrul de comenzi
  const params = new URLSearchParams(location.search)
  const filteredByOrder = params.get('orderId')
  
  // Calculează mărcile disponibile cu useMemo - înlocuiește useEffect-ul pentru mărci
  const availableBrands = useMemo(() => {
    if (devices.length === 0) return []
    return [...new Set(devices.map(device => device.brand).filter(Boolean))]
  }, [devices])
  
  // Păstrează acest useEffect pentru încărcarea inițială a datelor
  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = async () => {
    try {
      setIsLoading(true)
      setError('')
      const data = await devicesAPI.fetchAllDevices()
      setDevices(data)
      console.log('✅ Devices loaded:', data.length)
      console.log('Device 1:', data) // Afișează primul dispozitiv pentru verificare
    } catch (error) {
      console.error('❌ Error fetching devices:', error)
      setError('Failed to load devices from server')
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateDevice = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const result = await devicesAPI.updateDevice(selectedDevice.id, selectedDevice)
      
      // Update local state
      setDevices(devices.map(device => 
        device.id === selectedDevice.id ? result : device
      ))
      
      // Close modal
      setShowEditDeviceModal(false)
      console.log('✅ Device updated successfully:', result)
      
    } catch (error) {
      console.error('❌ Update device error:', error)
      
      if (error.response?.status === 403) {
        setError('Permission denied: You need administrator privileges to update devices')
      } else {
        setError('Failed to update device. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteDevice = async (deviceId, deviceIdentifier) => {
    if (window.confirm(`Are you sure you want to delete device "${deviceIdentifier}"? This action cannot be undone.`)) {
      try {
        setIsLoading(true)
        await devicesAPI.deleteDevice(deviceId)
        
        // Remove from local state
        setDevices(devices.filter(device => device.id !== deviceId))
        console.log('✅ Device deleted successfully!')
        
      } catch (error) {
        console.error('❌ Error deleting device:', error)
        
        if (error.response?.status === 403) {
          setError('Permission denied: You need administrator privileges to delete devices')
        } else {
          setError('Failed to delete device. Please try again.')
        }
      } finally {
        setIsLoading(false)
      }
    }
  }

  const openEditModal = (device) => {
    setSelectedDevice({...device})
    setShowEditDeviceModal(true)
  }
  
  const navigateToNewOrder = () => {
    navigate('/orders', { state: { openNewOrderModal: true } })
  }

  const filteredDevices = devices.filter(device => {
    // Aplică filtrul pentru comenzi dacă este activ
    if (filteredByOrder && device.order_id !== parseInt(filteredByOrder)) {
      return false;
    }
    
    const matchesBrand = filterBrand === 'all' || device.brand === filterBrand;
    const searchableText = [
      device.brand || '', 
      device.model || '', 
      device.serialNumber || '',
      device.note || ''
    ].join(' ').toLowerCase();
    
    return matchesBrand && (searchTerm === '' || searchableText.includes(searchTerm.toLowerCase()));
  })

  // Adaugă această funcție după celelalte handlere
  const handleUpdateDeviceStatus = async (deviceId, newStatus) => {
    setIsLoading(true);
    try {
      // Actualizare status dispozitiv
      const updatedDevice = await devicesAPI.updateDeviceStatus(deviceId, newStatus);
      
      // Actualizare date în state
      setDevices(devices.map(device => 
        device.id === deviceId ? updatedDevice : device
      ));
      
      console.log(`✅ Device #${deviceId} status updated to ${newStatus}`);
      
      // Dacă este deschis modalul de editare și este același dispozitiv, actualizează și acolo
      if (showEditDeviceModal && selectedDevice && selectedDevice.id === deviceId) {
        setSelectedDevice({...selectedDevice, status: newStatus});
      }
    } catch (error) {
      console.error('❌ Error updating device status:', error);
      setError('Failed to update device status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Adaugă această funcție pentru a afișa statusul corect
  const getStatusBadge = (status) => {
    switch(status) {
      case 'PRELUAT':
        return <span className="badge bg-info">Preluat</span>;
      case 'IN_LUCRU':
        return <span className="badge bg-warning">În lucru</span>;
      case 'IN_ASTEPTARE':
        return <span className="badge bg-secondary">În așteptare piese</span>;
      case 'FINALIZAT':
        return <span className="badge bg-success">Finalizat</span>;
      case 'PREDAT':
        return <span className="badge bg-danger">Predat</span>;
      default:
        return <span className="badge bg-secondary">{status || 'Necunoscut'}</span>;
    }
  };

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
            <Link className="nav-link text-cyan" to="/devices">
              <i className="fas fa-laptop me-2"></i>Devices
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh'}}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-cyan">Home</Link></li>
            <li className="breadcrumb-item text-white">Devices</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">
              <i className="fas fa-laptop me-3"></i>Device Management
            </h2>
            <p className="text-white mb-0">View and manage device information</p>
          </div>
          <button 
            className="btn btn-kiva-action"
            onClick={navigateToNewOrder}
          >
            <i className="fas fa-plus me-2"></i>Register New Device
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Devices</h6>
                    <h3 className="mb-0 text-white">{devices.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-laptop fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Unique Brands</h6>
                    <h3 className="mb-0 text-white">{availableBrands.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-tags fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">With Active Orders</h6>
                    <h3 className="mb-0 text-white">
                      {devices.filter(d => d.status !== 'PREDAT').length}
                    </h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-clipboard-check fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="alert alert-danger mb-4">
            <div className="d-flex align-items-center">
              <i className="fas fa-exclamation-circle fa-2x me-3"></i>
              <div>
                <h5 className="mb-1">Error</h5>
                <p className="mb-0">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="card card-kiva mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Filter by Brand</label>
                <select 
                  className="form-select form-select-kiva"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                >
                  <option value="all">All Brands</option>
                  {availableBrands.map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-cyan mb-2">Search</label>
                <input 
                  type="text"
                  className="form-control form-control-kiva"
                  placeholder="Search by brand, model, serial number..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filtered by Order Info */}
        {filteredByOrder && (
          <div className="alert mb-4" style={{background: 'rgba(0, 255, 255, 0.15)', border: '1px solid #00ffff'}}>
            <div className="d-flex align-items-center">
              <i className="fas fa-filter fa-lg me-3 text-dark"></i>
              <div>
                <h5 className="mb-1 text-dark">Filtered View</h5>
                <p className="mb-0 text-dark">Showing devices for Order #{filteredByOrder}</p>
              </div>
              <button 
                className="btn ms-auto" 
                style={{
                  background: 'transparent', 
                  border: '2px solid #000', 
                  color: '#000'
                }}
                onClick={() => navigate('/devices')}
              >
                <i className="fas fa-times me-2"></i>Clear Filter
              </button>
            </div>
          </div>
        )}

        {/* Devices Table */}
        <div className="card card-kiva">
          <div className="card-body">
            {isLoading ? (
              <div className="text-center py-5">
                <i className="fas fa-spinner fa-spin fa-3x text-cyan"></i>
                <p className="mt-3 text-white">Loading devices...</p>
              </div>
            ) : (
              <div className="table-responsive"
              style={{ minHeight: filteredDevices.length <= 3 ? '300px' : 'auto' }}>
                <table className="table table-hover table-kiva">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Brand / Model</th>
                      <th>Serial Number</th>
                      <th>Status</th>
                      <th>Order</th>
                      <th>Received Date</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDevices.length > 0 ? (
                      filteredDevices.map(device => (
                        <tr key={device.id}>
                          <td>
                            <strong className="text-cyan">{device.id}</strong>
                          </td>
                          <td>
                            <div className="text-white fw-bold">{device.brand || 'Unknown'}</div>
                            <small className="text-cyan">{device.model}</small>
                          </td>
                          <td className="text-cyan">
                            {device.serialNumber || 'Not specified'}
                          </td>
                          <td>
                            {getStatusBadge(device.status)}
                          </td>
                          <td>
                            {device.order_id ? (
                              <Link to={`/orders?deviceId=${device.id}`} className="badge bg-primary">
                                Order #{device.order_id}
                              </Link>
                            ) : (
                              <span className="badge bg-secondary">No Order</span>
                            )}
                          </td>
                          <td className="text-cyan">
                            {device.receivedDate || 'N/A'}
                          </td>
                          <td>
                            <small className="text-white text-truncate d-inline-block" style={{maxWidth: "150px"}}>
                              {device.note || 'No notes'}
                            </small>
                          </td>
                          <td>
                            <div className="btn-group btn-group-sm" role="group">
                              <button 
                                className="btn btn-kiva-action"
                                onClick={() => openEditModal(device)}
                                title="Edit Device"
                              >
                                <i className="fas fa-edit"></i>
                              </button>
                              
                              {/* Buton nou pentru schimbarea rapidă a statusului */}
                              <div className="dropdown">
                                <button 
                                  className="btn btn-kiva-action dropdown-toggle"
                                  type="button"
                                  id={`statusDropdown-${device.id}`}
                                  data-bs-toggle="dropdown"
                                  aria-expanded="false"
                                  title="Change Status"
                                >
                                  <i className="fas fa-tasks"></i>
                                </button>
                                <ul className="dropdown-menu dropdown-menu-dark" aria-labelledby={`statusDropdown-${device.id}`}>
                                  <li><h6 className="dropdown-header">Change Status</h6></li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleUpdateDeviceStatus(device.id, 'PRELUAT')}
                                    >Preluat</button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleUpdateDeviceStatus(device.id, 'IN_LUCRU')}
                                    >În lucru</button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleUpdateDeviceStatus(device.id, 'IN_ASTEPTARE')}
                                    >În așteptare (piese)</button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleUpdateDeviceStatus(device.id, 'FINALIZAT')}
                                    >Finalizat</button>
                                  </li>
                                  <li>
                                    <button 
                                      className="dropdown-item" 
                                      onClick={() => handleUpdateDeviceStatus(device.id, 'PREDAT')}
                                    >Predat</button>
                                  </li>
                                </ul>
                              </div>
                              
                              {device.order_id ? (
                                <Link 
                                  to={`/orders?deviceId=${device.id}`}
                                  className="btn btn-kiva-action"
                                  title="View Related Order"
                                >
                                  <i className="fas fa-clipboard-list"></i>
                                </Link>
                              ) : (
                                <button 
                                  className="btn btn-kiva-action"
                                  onClick={navigateToNewOrder}
                                  title="Create Order for this Device"
                                >
                                  <i className="fas fa-plus-circle"></i>
                                </button>
                              )}
                              <button 
                                className="btn btn-outline-danger"
                                onClick={() => handleDeleteDevice(device.id, `${device.brand} ${device.model}`)}
                                title="Delete Device"
                                disabled={!!device.order}
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="8" className="text-center text-muted py-4">
                          <i className="fas fa-laptop fa-2x mb-3"></i>
                          <br />
                          {devices.length === 0 ? 
                            "No devices found. Register your first device above!" :
                            "No devices match your search criteria."
                          }
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Device Modal */}
      {showEditDeviceModal && selectedDevice && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
              <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                <h5 className="modal-title text-cyan">
                  <i className="fas fa-edit me-2"></i>Edit Device
                </h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowEditDeviceModal(false)}
                ></button>
              </div>
              <form onSubmit={handleUpdateDevice}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-tag me-2"></i>Brand
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.brand || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, brand: e.target.value})}
                        required
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-info-circle me-2"></i>Model
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.model || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, model: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-barcode me-2"></i>Serial Number
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.serialNumber || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, serialNumber: e.target.value})}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-calendar-alt me-2"></i>Received Date
                      </label>
                      <input 
                        type="date" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.receivedDate || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, receivedDate: e.target.value})}
                        readOnly={!!selectedDevice.receivedDate}
                      />
                      {!!selectedDevice.receivedDate && (
                        <small className="text-muted">Received date cannot be changed</small>
                      )}
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-key me-2"></i>Credential
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.credential || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, credential: e.target.value})}
                        placeholder="Password or PIN if applicable"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-certificate me-2"></i>License Key
                      </label>
                      <input 
                        type="text" 
                        className="form-control form-control-kiva" 
                        value={selectedDevice.licenseKey || ''}
                        onChange={(e) => setSelectedDevice({...selectedDevice, licenseKey: e.target.value})}
                        placeholder="Software license if applicable"
                      />
                    </div>
                  </div>
                  
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan fw-bold">
                        <i className="fas fa-tasks me-2"></i>Status
                      </label>
                      <select 
                        className="form-select form-select-kiva" 
                        value={selectedDevice.status || 'PRELUAT'}
                        onChange={(e) => setSelectedDevice({...selectedDevice, status: e.target.value})}
                      >
                        <option value="PRELUAT">Preluat</option>
                        <option value="IN_LUCRU">În lucru</option>
                        <option value="IN_ASTEPTARE">În așteptare (piese comandate)</option>
                        <option value="FINALIZAT">Finalizat</option>
                        <option value="PREDAT">Predat</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      {/* Alt câmp existent */}
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label text-cyan fw-bold">
                      <i className="fas fa-sticky-note me-2"></i>Notes
                    </label>
                    <textarea 
                      className="form-control form-control-kiva" 
                      value={selectedDevice.note || ''}
                      onChange={(e) => setSelectedDevice({...selectedDevice, note: e.target.value})}
                      rows="3"
                      placeholder="Additional information about this device"
                    ></textarea>
                  </div>

                  {selectedDevice.order && (
                    <div className="alert" style={{background: 'rgba(0, 255, 255, 0.1)', border: '1px solid #00ffff', color: '#00ffff'}}>
                      <i className="fas fa-info-circle me-2"></i>
                      <strong>Note:</strong> This device is linked to Order #{selectedDevice.order_id}. Some fields may be locked.
                    </div>
                  )}
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button type="button" className="btn btn-kiva-outline" onClick={() => setShowEditDeviceModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-kiva-action" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <i className="fas fa-spinner fa-spin me-2"></i>Updating...
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

export default Devices