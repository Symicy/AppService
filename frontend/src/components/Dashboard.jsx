import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'
import { Line, Doughnut } from 'react-chartjs-2'
import KivaLogo from '../poze/3dlogo.png'
import { dashboardAPI } from '../services/api/dashboardAPI'
import '../styles/global.css'
import '../styles/components/navbar.css'
import '../styles/components/buttons.css'
import '../styles/components/cards.css'
import '../styles/components/tables.css'
import '../styles/components/badges.css'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function Dashboard() {
  const [dashboardData, setDashboardData] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    awaitingParts: 0,
    cancelled: 0,
    totalClients: 0,
    totalDevices: 0,
    recentOrders: [],
    monthlyOrdersData: {
      labels: [],
      datasets: []
    },
    statusDistribution: {
      labels: [],
      datasets: []
    }
  })

  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  // Fetch dashboard data from API
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError('')

        // Fetch all dashboard data in parallel
        const [stats, recentOrders, monthlyData, statusData] = await Promise.all([
          dashboardAPI.getDashboardStats(),
          dashboardAPI.getRecentOrders(5),
          dashboardAPI.getMonthlyOrdersData(),
          dashboardAPI.getStatusDistribution()
        ])

        // Transform the data for charts
        const transformedMonthlyData = {
          labels: monthlyData.labels || [],
          datasets: [
            {
              label: 'Completed Orders',
              data: monthlyData.completedData || [],
              borderColor: '#28a745',
              backgroundColor: 'rgba(40, 167, 69, 0.1)',
              tension: 0.4,
            },
            {
              label: 'New Orders',
              data: monthlyData.newOrdersData || [],
              borderColor: '#00ffff',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              tension: 0.4,
            }
          ]
        }

        const transformedStatusData = {
          labels: statusData.labels || [],
          datasets: [
            {
              data: statusData.data || [],
              backgroundColor: [
                '#17a2b8', // PRELUAT - Info Blue
                '#ffc107', // IN_LUCRU - Warning Yellow
                '#28a745', // FINALIZAT - Success Green
                '#6f42c1'  // PREDAT - Purple
              ],
              borderColor: [
                '#17a2b8',
                '#ffc107',
                '#28a745',
                '#6f42c1'
              ],
              borderWidth: 2,
            }
          ]
        }

        setDashboardData({
          totalOrders: stats.totalOrders || 0,
          inProgress: stats.inProgress || 0,
          completed: stats.completed || 0,
          awaitingParts: stats.awaitingParts || 0,
          cancelled: stats.cancelled || 0,
          totalClients: stats.totalClients || 0,
          totalDevices: stats.totalDevices || 0,
          recentOrders: recentOrders || [],
          monthlyOrdersData: transformedMonthlyData,
          statusDistribution: transformedStatusData
        })

      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Failed to load dashboard data. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const statusColors = {
    'PRELUAT': 'info',
    'IN_LUCRU': 'warning', 
    'FINALIZAT': 'success',
    'PREDAT': 'primary',
    'IN_ASTEPTARE': 'secondary',
    'cancelled': 'danger'
  }

  // Chart options
  const lineChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Oxanium'
          }
        }
      },
      title: {
        display: true,
        text: 'Monthly Orders Trend',
        color: '#00ffff',
        font: {
          family: 'Oxanium',
          size: 16
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#ffffff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  }

  const doughnutChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            family: 'Oxanium'
          }
        }
      },
      title: {
        display: true,
        text: 'Order Status Distribution',
        color: '#00ffff',
        font: {
          family: 'Oxanium',
          size: 16
        }
      },
    }
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

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-5">
            <i className="fas fa-spinner fa-spin fa-3x text-cyan"></i>
            <p className="mt-3 text-white">Loading dashboard...</p>
          </div>
        ) : (
          <>
        {/* Main Stats Cards */}
        <div className="row g-3 mb-4">
          <div className="col-lg-4 col-md-6">
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
          <div className="col-lg-4 col-md-6">
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
          <div className="col-lg-4 col-md-6">
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
        </div>

        {/* Secondary Stats */}
        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-users fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.totalClients}</h5>
                <small className="text-white">Total Clients</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-laptop fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.totalDevices}</h5>
                <small className="text-white">Devices Serviced</small>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card card-kiva text-center">
              <div className="card-body">
                <i className="fas fa-hourglass-half fa-2x text-cyan mb-2"></i>
                <h5 className="text-cyan">{dashboardData.awaitingParts}</h5>
                <small className="text-white">Awaiting Parts</small>
              </div>
            </div>
          </div>
        </div>

        {/* Charts and Recent Activity */}
        <div className="row g-3 mb-4">
          <div className="col-lg-6">
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-chart-line me-2"></i>Monthly Performance
                </h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  {dashboardData.monthlyOrdersData.labels.length > 0 && (
                    <Line data={dashboardData.monthlyOrdersData} options={lineChartOptions} />
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-6">
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="text-cyan mb-0">
                  <i className="fas fa-chart-pie me-2"></i>Order Status Distribution
                </h5>
              </div>
              <div className="card-body">
                <div style={{ height: '300px' }}>
                  {dashboardData.statusDistribution.labels.length > 0 && (
                    <Doughnut data={dashboardData.statusDistribution} options={doughnutChartOptions} />
                  )}
                </div>
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
                      </tr>
                    </thead>
                    <tbody>
                      {dashboardData.recentOrders.map(order => (
                        <tr key={order.id}>
                          <td className="text-cyan fw-bold">{order.orderNumber}</td>
                          <td className="text-white">{order.client}</td>
                          <td className="text-cyan">{order.device}</td>
                          <td>
                            <span className={`badge bg-${statusColors[order.originalStatus] || 'secondary'}`}>
                              {order.originalStatus || 'UNKNOWN'}
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
          </>
        )}
      </div>
    </>
  )
}

export default Dashboard