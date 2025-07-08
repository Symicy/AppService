import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/badges.css'

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    awaitingParts: 0,
    pending: 0,
    cancelled: 0,
    totalClients: 0,
    totalDevices: 0,
    revenue: 0,
    recentOrders: [],
    topTechnicians: [],
    statusDistribution: [],
    monthlyRevenue: []
  })

  // Mock data - replace with API calls
  useEffect(() => {
    setDashboardData({
      totalOrders: 156,
      inProgress: 23,
      completed: 89,
      awaitingParts: 12,
      pending: 18,
      cancelled: 14,
      totalClients: 87,
      totalDevices: 142,
      revenue: 15420,
      recentOrders: [
        { id: 1, orderNumber: 'ORD-2025-001', client: 'John Doe', device: 'Dell Inspiron 15', status: 'in_progress', priority: 'high' },
        { id: 2, orderNumber: 'ORD-2025-002', client: 'Tech Solutions SRL', device: 'HP ProBook 450', status: 'awaiting_parts', priority: 'medium' },
        { id: 3, orderNumber: 'ORD-2025-003', client: 'Maria Popescu', device: 'MacBook Pro 13', status: 'completed', priority: 'low' },
        { id: 4, orderNumber: 'ORD-2025-004', client: 'Digital Corp', device: 'Lenovo ThinkPad', status: 'pending', priority: 'high' },
        { id: 5, orderNumber: 'ORD-2025-005', client: 'Alex Smith', device: 'ASUS ROG Laptop', status: 'in_progress', priority: 'medium' }
      ],
      topTechnicians: [
        { name: 'Mike Wilson', orders: 34, rating: 4.8 },
        { name: 'Sarah Johnson', orders: 28, rating: 4.6 },
        { name: 'David Brown', orders: 22, rating: 4.7 },
        { name: 'Lisa Garcia', orders: 19, rating: 4.5 }
      ]
    })
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

      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-dark" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src={KivaLogo} alt="KIVA Logo" className="kiva-logo" />
            <span className="text-cyan">KIVA</span> 
            <span className="text-white ms-2">Service Manager</span>
          </Link>
          <div className="navbar-nav">
            <Link className="nav-link text-cyan" to="/">
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
          </div>
        </div>
      </nav>

      <div className="container-fluid px-4 py-3" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)', minHeight: '100vh'}}>
        {/* Breadcrumb */}
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb">
            <li className="breadcrumb-item text-cyan">Dashboard</li>
          </ol>
        </nav>

        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <h2 className="fw-bold text-cyan">Dashboard</h2>
            <p className="text-white mb-0">Service management overview and analytics</p>
          </div>
          <div className="d-flex gap-2">
            <Link to="/orders" className="btn btn-kiva-outline">
              <i className="fas fa-plus me-2"></i>New Order
            </Link>
            <button className="btn btn-kiva-primary">
              <i className="fas fa-download me-2"></i>Export Report
            </button>
          </div>
        </div>

        {/* Main Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-3 col-md-6">
            <div className="card stats-card-cyan text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title text-cyan">Total Orders</h6>
                    <h3 className="mb-0 text-white">{dashboardData.totalOrders}</h3>
                    <small className="text-white opacity-75">This month</small>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-clipboard-list metric-icon text-cyan"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card stats-card-warning text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title" style={{color: '#ffc107'}}>In Progress</h6>
                    <h3 className="mb-0 text-white">{dashboardData.inProgress}</h3>
                    <small className="text-white opacity-75">Active repairs</small>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-tools metric-icon" style={{color: '#ffc107'}}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card stats-card-success text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title" style={{color: '#28a745'}}>Completed</h6>
                    <h3 className="mb-0 text-white">{dashboardData.completed}</h3>
                    <small className="text-white opacity-75">This month</small>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-check-circle metric-icon" style={{color: '#28a745'}}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6">
            <div className="card stats-card-info text-white">
              <div className="card-body">
                <div className="d-flex justify-content-between">
                  <div>
                    <h6 className="card-title" style={{color: '#0dcaf0'}}>Revenue</h6>
                    <h3 className="mb-0 text-white">${dashboardData.revenue.toLocaleString()}</h3>
                    <small className="text-white opacity-75">This month</small>
                  </div>
                  <div className="align-self-center">
                    <i className="fas fa-dollar-sign metric-icon" style={{color: '#0dcaf0'}}></i>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Secondary Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-3">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-users fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.totalClients}</h5>
                <small className="text-white">Total Clients</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-laptop fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.totalDevices}</h5>
                <small className="text-white">Devices Serviced</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-hourglass-half fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.awaitingParts}</h5>
                <small className="text-white">Awaiting Parts</small>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-clock fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.pending}</h5>
                <small className="text-white">Pending Orders</small>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="row g-3 mb-4">
          <div className="col-lg-8">
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-chart-line me-2"></i>Monthly Performance
                </h5>
              </div>
              <div className="card-body">
                <div className="chart-placeholder">
                  <div className="text-center">
                    <i className="fas fa-chart-line fa-3x mb-3"></i>
                    <br />
                    Chart Integration Placeholder
                    <br />
                    <small>(Chart.js, D3.js, or similar)</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-trophy me-2"></i>Top Technicians
                </h5>
              </div>
              <div className="card-body">
                {dashboardData.topTechnicians.map((tech, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-3">
                    <div>
                      <div className="text-white fw-bold">{tech.name}</div>
                      <small className="text-white opacity-75">{tech.orders} orders completed</small>
                    </div>
                    <div className="text-end">
                      <div className="text-cyan">
                        <i className="fas fa-star me-1"></i>{tech.rating}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders */}
        <div className="row g-3">
          <div className="col-lg-8">
            <div className="card card-kiva">
              <div className="card-header d-flex justify-content-between align-items-center">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-clipboard-list me-2"></i>Recent Orders
                </h5>
                <Link to="/orders" className="btn btn-kiva-outline btn-sm">View All</Link>
              </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="text-cyan fw-bold">{order.orderNumber}</td>
                          <td className="text-white">{order.client}</td>
                          <td className="text-cyan">{order.device}</td>
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
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-bolt me-2"></i>Quick Actions
                </h5>
              </div>
              <div className="card-body">
                <div className="d-grid gap-2">
                  <Link to="/orders" className="btn btn-kiva-primary">
                    <i className="fas fa-plus me-2"></i>Create New Order
                  </Link>
                  <Link to="/clients" className="btn btn-kiva-outline">
                    <i className="fas fa-user-plus me-2"></i>Add New Client
                  </Link>
                  <Link to="/devices" className="btn btn-kiva-outline">
                    <i className="fas fa-laptop me-2"></i>Register Device
                  </Link>
                  <button className="btn btn-kiva-outline">
                    <i className="fas fa-file-export me-2"></i>Generate Report
                  </button>
                  <button className="btn btn-kiva-outline">
                    <i className="fas fa-cog me-2"></i>Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>
    </>
  )
}

export default Dashboard