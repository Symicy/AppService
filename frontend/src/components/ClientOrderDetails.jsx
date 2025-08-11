import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getClientOrderDetails } from '../services/api/ordersAPI'
import KivaLogo from '../poze/3dlogo.png'
import '../styles/global.css'
import '../styles/components/cards.css'
import '../styles/components/badges.css'

// Stiluri pentru tematica Kiva
const kivaStyles = `
  .text-cyan {
    color: #00ffff !important;
  }
`

function ClientOrderDetails() {
  const { orderId } = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        setLoading(true)
        const orderData = await getClientOrderDetails(orderId)
        setOrder(orderData)
      } catch (err) {
        console.error('Error fetching order details:', err)
        setError('Nu s-au putut încărca detaliile comenzii.')
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      fetchOrderDetails()
    }
  }, [orderId])

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'warning'
      case 'in_progress': return 'info'
      case 'completed': return 'success'
      case 'cancelled': return 'danger'
      default: return 'secondary'
    }
  }

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'În așteptare'
      case 'in_progress': return 'În lucru'
      case 'completed': return 'Finalizat'
      case 'cancelled': return 'Anulat'
      default: return status || 'Necunoscut'
    }
  }

  const getDeviceStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case 'received': return 'Primit'
      case 'diagnosing': return 'În diagnosticare'
      case 'repairing': return 'În reparație'
      case 'testing': return 'În testare'
      case 'ready': return 'Gata'
      case 'delivered': return 'Livrat'
      default: return status || 'Necunoscut'
    }
  }

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="text-center">
          <div className="spinner-border text-cyan mb-3" role="status" style={{color: '#00ffff'}}>
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-white">Se încarcă detaliile comenzii...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="card shadow-sm border-0" style={{maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
          <div className="card-body text-center">
            <img src={KivaLogo} alt="Kiva Service" style={{height: '60px'}} className="mb-3" />
            <h5 className="card-title text-danger">Eroare</h5>
            <p className="card-text text-white">{error}</p>
            <Link to="/" className="btn" style={{background: '#00ffff', color: '#000', border: 'none'}}>
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="card shadow-sm border-0" style={{maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
          <div className="card-body text-center">
            <img src={KivaLogo} alt="Kiva Service" style={{height: '60px'}} className="mb-3" />
            <h5 className="card-title text-white">Comanda nu a fost găsită</h5>
            <p className="card-text text-white">Nu am putut găsi o comandă cu ID-ul specificat.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{kivaStyles}</style>
      <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        {/* Header */}
        <div className="shadow-sm" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 100%)'}}>
          <div className="container py-3">
            <div className="row align-items-center">
              <div className="col-auto">
                <img src={KivaLogo} alt="Kiva Service" style={{height: '50px'}} />
              </div>
              <div className="col">
                <h4 className="mb-0 fw-bold text-white">Detalii Comandă #{order.id}</h4>
                <p className="text-cyan mb-0 small">Informații complete despre comanda dumneavoastră</p>
              </div>
            </div>
          </div>
        </div>

        <div className="container py-4">
        <div className="row">
          {/* Order Info */}
          <div className="col-lg-4 mb-4">
            <div className="card h-100 shadow-sm border-0" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)', color: '#000'}}>
                <h5 className="mb-0" style={{color: '#000'}}>
                  <i className="fas fa-info-circle me-2"></i>
                  Informații Comandă
                </h5>
              </div>
              <div className="card-body">
                <div className="mb-3">
                  <label className="form-label fw-bold text-cyan">Status:</label>
                  <div>
                    <span className={`badge bg-${getStatusColor(order.status)} fs-6`}>
                      {getStatusText(order.status)}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <label className="form-label fw-bold text-cyan">Data creării:</label>
                  <p className="mb-0 text-white">{new Date(order.createdAt).toLocaleDateString('ro-RO')}</p>
                </div>

                <div className="mb-3">
                  <label className="form-label fw-bold text-cyan">Client:</label>
                  <p className="mb-0 text-white">{order.clientName}</p>
                </div>

                {order.clientPhone && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-cyan">Telefon:</label>
                    <p className="mb-0 text-white">{order.clientPhone}</p>
                  </div>
                )}

                {order.clientEmail && (
                  <div className="mb-3">
                    <label className="form-label fw-bold text-cyan">Email:</label>
                    <p className="mb-0 text-white">{order.clientEmail}</p>
                  </div>
                )}

                <div className="mb-0">
                  <label className="form-label fw-bold text-cyan">Număr device-uri:</label>
                  <p className="mb-0">
                    <span className="badge" style={{background: '#00ffff', color: '#000'}}>{order.devices?.length || 0}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Devices */}
          <div className="col-lg-8">
            <div className="card shadow-sm border-0" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
              <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: '#000'}}>
                <h5 className="mb-0" style={{color: '#000'}}>
                  <i className="fas fa-laptop me-2"></i>
                  Device-uri în comandă
                </h5>
              </div>
              <div className="card-body">
                {order.devices && order.devices.length > 0 ? (
                  <div className="row">
                    {order.devices.map((device, index) => (
                      <div key={device.id} className="col-12 mb-3">
                        <div className="card border-start border-5 border-info" style={{background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(5px)', borderColor: '#00ffff !important'}}>
                          <div className="card-body">
                            <div className="row">
                              <div className="col-md-8">
                                <h6 className="card-title mb-2 text-white">
                                  <i className="fas fa-desktop me-2 text-cyan"></i>
                                  Device #{device.id}
                                </h6>
                                
                                <div className="row mb-2">
                                  <div className="col-sm-6">
                                    <small className="text-cyan">Brand:</small>
                                    <p className="mb-1 fw-semibold text-white">{device.brand || 'N/A'}</p>
                                  </div>
                                  <div className="col-sm-6">
                                    <small className="text-cyan">Model:</small>
                                    <p className="mb-1 fw-semibold text-white">{device.model || 'N/A'}</p>
                                  </div>
                                </div>

                                {device.serialNumber && (
                                  <div className="mb-2">
                                    <small className="text-cyan">Serie:</small>
                                    <p className="mb-1 fw-semibold text-white">{device.serialNumber}</p>
                                  </div>
                                )}

                                {device.issueDescription && (
                                  <div className="mb-2">
                                    <small className="text-cyan">Problemă:</small>
                                    <p className="mb-1 text-white">{device.issueDescription}</p>
                                  </div>
                                )}

                                {device.technicianNotes && (
                                  <div className="mb-0">
                                    <small className="text-cyan">Note tehnic:</small>
                                    <p className="mb-0 text-cyan">{device.technicianNotes}</p>
                                  </div>
                                )}
                              </div>
                              
                              <div className="col-md-4 text-md-end">
                                <span className={`badge bg-${getStatusColor(device.status)} fs-6`}>
                                  {getDeviceStatusText(device.status)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <i className="fas fa-inbox fa-3x text-cyan mb-3"></i>
                    <p className="text-white">Nu sunt device-uri în această comandă.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="row mt-4">
          <div className="col-12">
            <div className="card border-0" style={{background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid #00ffff !important'}}>
              <div className="card-body text-center">
                <h6 className="card-title text-cyan">
                  <i className="fas fa-phone me-2"></i>
                  Aveți întrebări?
                </h6>
                <p className="card-text mb-0 text-white">
                  Contactați-ne pentru mai multe informații despre comanda dumneavoastră.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default ClientOrderDetails
