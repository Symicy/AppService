import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getPublicOrderDetails } from '../services/api/ordersAPI'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/cards.css'
import '../styles/components/badges.css'

// Simple order detail skeleton
const OrderDetailSkeleton = () => (
  <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
    <div className="container py-5">
      <div className="text-center mb-4">
        <div className="skeleton skeleton-title mx-auto mb-3" style={{width: '200px', height: '40px'}}></div>
        <div className="skeleton skeleton-text mx-auto" style={{width: '300px'}}></div>
      </div>
      <div className="card" style={{ background: 'rgba(30, 30, 30, 0.9)', border: '1px solid rgba(0, 255, 255, 0.3)', maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body p-4">
          <div className="skeleton skeleton-header mb-4" style={{width: '60%'}}></div>
          <div className="skeleton skeleton-text mb-3"></div>
          <div className="skeleton skeleton-text mb-3"></div>
          <div className="skeleton skeleton-text mb-3" style={{width: '70%'}}></div>
          <div className="skeleton skeleton-title mt-4" style={{width: '40%', height: '35px'}}></div>
        </div>
      </div>
    </div>
  </div>
);

function PublicOrderStatus() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setIsLoading(true)
        console.log('📋 Fetching public order details for ID:', orderId)
        
        // Apelează un endpoint public pentru detaliile comenzii
        const orderData = await ordersAPI.getPublicOrderDetails(orderId)
        setOrder(orderData)
        
      } catch (error) {
        console.error('❌ Error fetching public order details:', error)
        setError('Order not found or you don\'t have permission to view it')
      } finally {
        setIsLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const getStatusBadge = (status) => {
    const statusConfig = {
      'PRELUAT': { class: 'bg-info', text: 'Received', icon: 'fas fa-inbox' },
      'IN_LUCRU': { class: 'bg-warning', text: 'In Progress', icon: 'fas fa-cogs' },
      'FINALIZAT': { class: 'bg-success', text: 'Completed', icon: 'fas fa-check-circle' },
      'PREDAT': { class: 'bg-primary', text: 'Delivered', icon: 'fas fa-handshake' }
    }
    
    const config = statusConfig[status] || { class: 'bg-secondary', text: status, icon: 'fas fa-question' }
    
    return (
      <span className={`badge ${config.class} px-3 py-2`}>
        <i className={`${config.icon} me-2`}></i>
        {config.text}
      </span>
    )
  }

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (error || !order) {
    return (
      <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="d-flex align-items-center justify-content-center min-vh-100">
          <div className="text-center">
            <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
            <h2 className="text-danger">Order Not Found</h2>
            <p className="text-white mb-4">{error}</p>
            <Link to="/" className="btn btn-outline-light">
              <i className="fas fa-home me-2"></i>Go to Homepage
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
      {/* Header */}
      <nav className="navbar navbar-dark" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
        <div className="container">
          <Link className="navbar-brand fw-bold d-flex align-items-center" to="/">
            <img src={KivaLogo} alt="KIVA Logo" className="kiva-logo" />
            <span className="text-cyan">KIVA</span> 
            <span className="text-white ms-2">Service Manager</span>
          </Link>
          <span className="navbar-text text-white">
            Order Status Tracker
          </span>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            {/* Order Header */}
            <div className="card card-kiva mb-4">
              <div className="card-body text-center">
                <i className="fas fa-clipboard-list fa-3x text-cyan mb-3"></i>
                <h2 className="text-cyan mb-2">Order #{order.id}</h2>
                <p className="text-white mb-3">Track your service request status</p>
                {getStatusBadge(order.status)}
              </div>
            </div>

            {/* Order Details */}
            <div className="card card-kiva mb-4">
              <div className="card-header">
                <h5 className="mb-0 text-cyan">
                  <i className="fas fa-info-circle me-2"></i>Order Information
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="text-cyan fw-bold">Order Date:</label>
                    <p className="text-white mb-0">{order.createdAt}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-cyan fw-bold">Customer:</label>
                    <p className="text-white mb-0">{order.clientName}</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-cyan fw-bold">Number of Devices:</label>
                    <p className="text-white mb-0">{order.deviceCount} device(s)</p>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="text-cyan fw-bold">Current Status:</label>
                    <p className="text-white mb-0">{getStatusBadge(order.status)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status Progress */}
            <div className="card card-kiva mb-4">
              <div className="card-header">
                <h5 className="mb-0 text-cyan">
                  <i className="fas fa-tasks me-2"></i>Progress Tracker
                </h5>
              </div>
              <div className="card-body">
                <div className="row text-center">
                  <div className="col-3">
                    <div className={`p-3 rounded ${order.status === 'PRELUAT' || order.status === 'IN_LUCRU' || order.status === 'FINALIZAT' || order.status === 'PREDAT' ? 'bg-success' : 'bg-secondary'}`}>
                      <i className="fas fa-inbox fa-2x text-white"></i>
                      <p className="text-white mt-2 mb-0 small">Received</p>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className={`p-3 rounded ${order.status === 'IN_LUCRU' || order.status === 'FINALIZAT' || order.status === 'PREDAT' ? 'bg-warning' : 'bg-secondary'}`}>
                      <i className="fas fa-cogs fa-2x text-white"></i>
                      <p className="text-white mt-2 mb-0 small">In Progress</p>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className={`p-3 rounded ${order.status === 'FINALIZAT' || order.status === 'PREDAT' ? 'bg-success' : 'bg-secondary'}`}>
                      <i className="fas fa-check-circle fa-2x text-white"></i>
                      <p className="text-white mt-2 mb-0 small">Completed</p>
                    </div>
                  </div>
                  <div className="col-3">
                    <div className={`p-3 rounded ${order.status === 'PREDAT' ? 'bg-primary' : 'bg-secondary'}`}>
                      <i className="fas fa-handshake fa-2x text-white"></i>
                      <p className="text-white mt-2 mb-0 small">Delivered</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="card card-kiva">
              <div className="card-header">
                <h5 className="mb-0 text-cyan">
                  <i className="fas fa-phone me-2"></i>Need Help?
                </h5>
              </div>
              <div className="card-body text-center">
                <p className="text-white mb-3">
                  If you have any questions about your order, please contact us:
                </p>
                <div className="row">
                  <div className="col-md-6 mb-2">
                    <i className="fas fa-phone text-cyan me-2"></i>
                    <span className="text-white">+40 123 456 789</span>
                  </div>
                  <div className="col-md-6 mb-2">
                    <i className="fas fa-envelope text-cyan me-2"></i>
                    <span className="text-white">support@kiva.com</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PublicOrderStatus
