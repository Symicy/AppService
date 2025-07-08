import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/forms.css'
import '../styles/components/badges.css'

function Orders() {
  const [orders, setOrders] = useState([])
  const [clients, setClients] = useState([])
  const [devices, setDevices] = useState([])
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Mock data - replace with API calls
  useEffect(() => {
    // Mock orders data
    setOrders([
      {
        id: 1,
        orderNumber: 'ORD-2025-001',
        clientName: 'John Doe',
        clientType: 'persoana_fizica',
        deviceBrand: 'Dell',
        deviceModel: 'Inspiron 15',
        serialNumber: 'DL123456789',
        problem: 'Laptop won\'t boot, blue screen error',
        status: 'in_progress',
        priority: 'high',
        createdAt: '2025-07-08',
        estimatedCompletion: '2025-07-10',
        technician: 'Mike Wilson',
        qrCode: 'QR_001_2025070812345',
        totalCost: 150
      },
      {
        id: 2,
        orderNumber: 'ORD-2025-002',
        clientName: 'Tech Solutions SRL',
        clientType: 'persoana_juridica',
        deviceBrand: 'HP',
        deviceModel: 'ProBook 450',
        serialNumber: 'HP987654321',
        problem: 'Keyboard replacement needed',
        status: 'awaiting_parts',
        priority: 'medium',
        createdAt: '2025-07-07',
        estimatedCompletion: '2025-07-12',
        technician: 'Sarah Johnson',
        qrCode: 'QR_002_2025070712345',
        totalCost: 80
      }
    ])

    // Mock clients data
    setClients([
      { id: 1, name: 'John Doe', type: 'persoana_fizica', phone: '+40712345678' },
      { id: 2, name: 'Tech Solutions SRL', type: 'persoana_juridica', phone: '+40723456789' }
    ])
  }, [])

  const statusColors = {
    'pending': 'secondary',
    'in_progress': 'warning',
    'awaiting_parts': 'info',
    'completed': 'success',
    'cancelled': 'danger'
  }

  const priorityColors = {
    'low': 'success',
    'medium': 'warning',
    'high': 'danger'
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.deviceBrand.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const generateQRCode = (orderId) => {
    return `QR_${orderId}_${Date.now()}`
  }

  const generatePDF = (order) => {
    console.log('Generating PDF for order:', order.orderNumber)
    alert(`PDF generated for order ${order.orderNumber}`)
  }

  const printLabel = (order) => {
    console.log('Printing label for order:', order.orderNumber)
    window.print()
  }

  const sendNotification = (order, channel) => {
    console.log(`Sending ${channel} notification for order:`, order.orderNumber)
    alert(`${channel} notification sent to client`)
  }

  const handleCreateOrder = (e) => {
    e.preventDefault()
    const formData = new FormData(e.target)
    const newOrder = {
      id: orders.length + 1,
      orderNumber: `ORD-2025-${String(orders.length + 1).padStart(3, '0')}`,
      clientName: formData.get('clientName'),
      clientType: formData.get('clientType'),
      deviceBrand: formData.get('deviceBrand'),
      deviceModel: formData.get('deviceModel'),
      serialNumber: formData.get('serialNumber'),
      problem: formData.get('problem'),
      status: 'pending',
      priority: formData.get('priority'),
      createdAt: new Date().toISOString().split('T')[0],
      qrCode: generateQRCode(orders.length + 1),
      totalCost: 0
    }
    setOrders([...orders, newOrder])
    setShowNewOrderModal(false)
    e.target.reset()
  }

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(orders.map(order => 
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  return (
    <>
      {/* Updated Font Awesome CDN - using latest version */}
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
            <Link className="nav-link text-cyan" to="/orders">
              <i className="fas fa-clipboard-list me-2"></i>Orders
            </Link>
            <Link className="nav-link text-white" to="/clients">
              <i className="fas fa-users me-2"></i>Clients
            </Link>
            <Link className="nav-link text-white" to="/devices">
              <i className="fas fa-laptop me-2"></i>Devices
            </Link>
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh'}}>
        {/* Header with breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item"><Link to="/" className="text-cyan">Home</Link></li>
            <li className="breadcrumb-item text-white">Service Orders</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">Service Orders</h2>
            <p className="text-white mb-0">Manage and track all service orders</p>
          </div>
          <button 
            className="btn btn-kiva-action"
            onClick={() => setShowNewOrderModal(true)}
          >
            <i className="fas fa-plus me-2"></i>New Order
          </button>
        </div>

        {/* Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Orders</h6>
                    <h3 className="mb-0 text-white">{orders.length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-clipboard-list fa-2x text-cyan opacity-75"></i>
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
                    <h6 className="card-title text-cyan">In Progress</h6>
                    <h3 className="mb-0 text-white">{orders.filter(o => o.status === 'in_progress').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-tools fa-2x text-cyan opacity-75"></i>
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
                    <h6 className="card-title text-cyan">Completed</h6>
                    <h3 className="mb-0 text-white">{orders.filter(o => o.status === 'completed').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-check-circle fa-2x text-cyan opacity-75"></i>
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
                    <h6 className="card-title text-cyan">Awaiting Parts</h6>
                    <h3 className="mb-0 text-white">{orders.filter(o => o.status === 'awaiting_parts').length}</h3>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-hourglass-half fa-2x text-cyan opacity-75"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card card-kiva mb-4">
          <div className="card-body">
            <div className="row g-3">
              <div className="col-md-4">
                <label className="form-label text-cyan">Filter by Status</label>
                <select 
                  className="form-select form-select-kiva"
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="awaiting_parts">Awaiting Parts</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div className="col-md-8">
                <label className="form-label text-cyan">Search Orders</label>
                <input
                  type="text"
                  className="form-control form-control-kiva"
                  placeholder="Search by order number, client name, or device..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="card card-kiva">
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-hover table-kiva">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Client</th>
                    <th>Device</th>
                    <th>Status</th>
                    <th>Priority</th>
                    <th>Created</th>
                    <th>Technician</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map(order => (
                    <tr key={order.id}>
                      <td>
                        <strong className="text-cyan">{order.orderNumber}</strong>
                        <br />
                        <small className="text-white opacity-75">ID: {order.id}</small>
                      </td>
                      <td>
                        <div className="text-white">{order.clientName}</div>
                        <span className={`badge ${order.clientType === 'persoana_fizica' ? 'badge-kiva-individual' : 'badge-kiva-company'}`}>
                          {order.clientType === 'persoana_fizica' ? 'Individual' : 'Company'}
                        </span>
                      </td>
                      <td>
                        <div className="text-cyan"><strong>{order.deviceBrand} {order.deviceModel}</strong></div>
                        <small className="text-white opacity-75">SN: {order.serialNumber}</small>
                      </td>
                      <td>
                        <span className={`badge bg-${statusColors[order.status]}`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>
                        <span className={`badge bg-${priorityColors[order.priority]}`}>
                          {order.priority.toUpperCase()}
                        </span>
                      </td>
                      <td className="text-cyan">{order.createdAt}</td>
                      <td className="text-cyan">{order.technician || 'Unassigned'}</td>
                      <td>
                        <div className="btn-group btn-group-sm" role="group">
                          <button 
                            className="btn btn-kiva-action"
                            onClick={() => setSelectedOrder(order)}
                            data-bs-toggle="modal" 
                            data-bs-target="#orderDetailsModal"
                            title="View Details"
                          >
                            <i className="fas fa-eye"></i>
                          </button>
                          <button 
                            className="btn btn-kiva-action"
                            onClick={() => generatePDF(order)}
                            title="Generate PDF"
                          >
                            <i className="fas fa-file-pdf"></i>
                          </button>
                          <button 
                            className="btn btn-kiva-action"
                            onClick={() => printLabel(order)}
                            title="Print Label"
                          >
                            <i className="fas fa-print"></i>
                          </button>
                          <div className="btn-group btn-group-sm">
                            <button 
                              className="btn btn-kiva-action dropdown-toggle"
                              data-bs-toggle="dropdown"
                              title="More Actions"
                            >
                              <i className="fas fa-ellipsis-v"></i>
                            </button>
                            <ul className="dropdown-menu">
                              <li><button className="dropdown-item" onClick={() => sendNotification(order, 'SMS')}>📱 Send SMS</button></li>
                              <li><button className="dropdown-item" onClick={() => sendNotification(order, 'WhatsApp')}>💬 Send WhatsApp</button></li>
                              <li><hr className="dropdown-divider" /></li>
                              <li><button className="dropdown-item" onClick={() => updateOrderStatus(order.id, 'completed')}>✅ Mark Complete</button></li>
                              <li><button className="dropdown-item" onClick={() => updateOrderStatus(order.id, 'cancelled')}>❌ Cancel Order</button></li>
                            </ul>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
              <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                <h5 className="modal-title text-cyan">Create New Service Order</h5>
                <button 
                  type="button" 
                  className="btn-close btn-close-white"
                  onClick={() => setShowNewOrderModal(false)}
                ></button>
              </div>
              <form onSubmit={handleCreateOrder}>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan">Client Type</label>
                      <select name="clientType" className="form-select form-select-kiva" required>
                        <option value="persoana_fizica">Individual</option>
                        <option value="persoana_juridica">Legal Entity</option>
                      </select>
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan">Client Name</label>
                      <input name="clientName" type="text" className="form-control form-control-kiva" required />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-cyan">Device Brand</label>
                      <input name="deviceBrand" type="text" className="form-control form-control-kiva" required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-cyan">Device Model</label>
                      <input name="deviceModel" type="text" className="form-control form-control-kiva" required />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label text-cyan">Serial Number</label>
                      <input name="serialNumber" type="text" className="form-control form-control-kiva" required />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-cyan">Problem Description</label>
                    <textarea name="problem" className="form-control form-control-kiva" rows="3" required></textarea>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label text-cyan">Priority</label>
                      <select name="priority" className="form-select form-select-kiva" required>
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer" style={{borderTop: '1px solid #00ffff'}}>
                  <button type="button" className="btn btn-kiva-outline" onClick={() => setShowNewOrderModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-kiva-action">
                    <i className="fas fa-plus me-2"></i>Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="modal fade" id="orderDetailsModal" tabIndex="-1">
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{background: 'linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%)', border: '2px solid #00ffff'}}>
              <div className="modal-header" style={{borderBottom: '1px solid #00ffff'}}>
                <h5 className="modal-title text-cyan">Order Details - {selectedOrder.orderNumber}</h5>
                <button type="button" className="btn-close btn-close-white" data-bs-dismiss="modal"></button>
              </div>
              <div className="modal-body">
                <div className="row">
                  <div className="col-md-6">
                    <h6 className="text-cyan">Client Information</h6>
                    <p className="text-white"><strong>Name:</strong> {selectedOrder.clientName}</p>
                    <p className="text-white"><strong>Type:</strong> 
                      <span className={`badge ms-2 ${selectedOrder.clientType === 'persoana_fizica' ? 'badge-kiva-individual' : 'badge-kiva-company'}`}>
                        {selectedOrder.clientType === 'persoana_fizica' ? 'Individual' : 'Company'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="text-cyan">Device Information</h6>
                    <p className="text-white"><strong>Device:</strong> {selectedOrder.deviceBrand} {selectedOrder.deviceModel}</p>
                    <p className="text-white"><strong>Serial:</strong> {selectedOrder.serialNumber}</p>
                  </div>
                </div>
                <h6 className="text-cyan">Problem Description</h6>
                <p className="text-white">{selectedOrder.problem}</p>
                <div className="row">
                  <div className="col-md-6">
                    <p className="text-white"><strong>Status:</strong> <span className={`badge bg-${statusColors[selectedOrder.status]}`}>{selectedOrder.status}</span></p>
                    <p className="text-white"><strong>Priority:</strong> <span className={`badge bg-${priorityColors[selectedOrder.priority]}`}>{selectedOrder.priority}</span></p>
                  </div>
                  <div className="col-md-6">
                    <p className="text-white"><strong>QR Code:</strong> <span className="text-cyan">{selectedOrder.qrCode}</span></p>
                    <p className="text-white"><strong>Total Cost:</strong> <span className="text-cyan">${selectedOrder.totalCost}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  )
}

export default Orders