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
  
  .kiva-bg-pattern {
    position: relative;
    overflow: hidden;
  }
  
  .kiva-bg-pattern::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: 
      radial-gradient(circle at 20% 20%, rgba(0, 255, 255, 0.1) 0%, transparent 50%),
      radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
      radial-gradient(circle at 40% 60%, rgba(0, 136, 204, 0.05) 0%, transparent 50%);
    pointer-events: none;
    z-index: 0;
  }
  
  .kiva-bg-pattern > * {
    position: relative;
    z-index: 1;
  }
  
  .cyan-accent-line {
    height: 3px;
    background: linear-gradient(90deg, transparent 0%, #00ffff 50%, transparent 100%);
    margin: 1rem 0;
  }
  
  .device-glow-card {
    box-shadow: 0 0 20px rgba(0, 255, 255, 0.1);
    transition: all 0.3s ease;
  }
  
  .device-glow-card:hover {
    box-shadow: 0 0 30px rgba(0, 255, 255, 0.2);
    transform: translateY(-2px);
  }
  
  .tech-grid-bg {
    background-image: 
      linear-gradient(rgba(0, 255, 255, 0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(0, 255, 255, 0.03) 1px, transparent 1px);
    background-size: 20px 20px;
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
      <div className="min-vh-100 d-flex align-items-center justify-content-center kiva-bg-pattern tech-grid-bg" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="text-center">
          <div className="cyan-accent-line" style={{width: '200px', margin: '0 auto 2rem auto'}}></div>
          <div className="spinner-border text-cyan mb-3" role="status" style={{color: '#00ffff', width: '4rem', height: '4rem'}}>
            <span className="visually-hidden">Se încarcă...</span>
          </div>
          <p className="text-white mb-0">Se încarcă detaliile comenzii...</p>
          <div className="cyan-accent-line" style={{width: '200px', margin: '2rem auto 0 auto'}}></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center kiva-bg-pattern tech-grid-bg" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="card shadow-sm border-0 device-glow-card" style={{maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
          <div className="card-body text-center">
            <div className="cyan-accent-line" style={{margin: '0 auto 1rem auto'}}></div>
            <img src={KivaLogo} alt="Kiva Service" style={{height: '60px'}} className="mb-3" />
            <h5 className="card-title text-danger">Eroare</h5>
            <p className="card-text text-white">{error}</p>
            <div className="cyan-accent-line" style={{margin: '1rem auto', width: '150px'}}></div>
            <Link to="/" className="btn" style={{background: '#00ffff', color: '#000', border: 'none', boxShadow: '0 0 15px rgba(0, 255, 255, 0.3)'}}>
              Înapoi la pagina principală
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center kiva-bg-pattern tech-grid-bg" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
        <div className="card shadow-sm border-0 device-glow-card" style={{maxWidth: '500px', background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
          <div className="card-body text-center">
            <div className="cyan-accent-line" style={{margin: '0 auto 1rem auto'}}></div>
            <img src={KivaLogo} alt="Kiva Service" style={{height: '60px'}} className="mb-3" />
            <h5 className="card-title text-white">Comanda nu a fost găsită</h5>
            <p className="card-text text-white">Nu am putut găsi o comandă cu ID-ul specificat.</p>
            <div className="cyan-accent-line" style={{margin: '1rem auto 0 auto'}}></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{kivaStyles}</style>
      {/* Screen Version */}
      <div className="screen-only">
          <div className="min-vh-100 kiva-bg-pattern tech-grid-bg" style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
            <div className="cyan-accent-line"></div>
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
                <div className="card h-100 shadow-sm border-0 device-glow-card" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                  <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #00ffff 0%, #0088cc 100%)', color: '#000', position: 'relative'}}>
                    <div style={{position: 'absolute', top: '0', left: '0', right: '0', height: '3px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'}}></div>
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
                <div className="card shadow-sm border-0 device-glow-card" style={{background: 'rgba(255, 255, 255, 0.1)', backdropFilter: 'blur(10px)'}}>
                  <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', color: '#000', position: 'relative'}}>
                    <div style={{position: 'absolute', top: '0', left: '0', right: '0', height: '3px', background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.5) 50%, transparent 100%)'}}></div>
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
                            <div className="card border-start border-5 border-info device-glow-card" style={{background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(5px)', borderColor: '#00ffff !important'}}>
                              <div className="card-body">
                                <div className="cyan-accent-line" style={{margin: '0 0 1rem 0', height: '2px'}}></div>
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
                <div className="cyan-accent-line"></div>
                <div className="card border-0 device-glow-card" style={{background: 'rgba(0, 255, 255, 0.1)', backdropFilter: 'blur(10px)', border: '1px solid #00ffff !important'}}>
                  <div className="card-body text-center">
                    <div className="cyan-accent-line" style={{margin: '0 auto 1rem auto', width: '100px'}}></div>
                    <h6 className="card-title text-cyan">
                      <i className="fas fa-phone me-2"></i>
                      Aveți întrebări?
                    </h6>
                    <p className="card-text mb-0 text-white">
                      Contactați-ne pentru mai multe informații despre comanda dumneavoastră.
                    </p>
                    <div className="cyan-accent-line" style={{margin: '1rem auto 0 auto', width: '100px'}}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Print Document Version */}
        <div className="print-order-document">
          {/* Print Header */}
          <div className="print-header">
            <div>
              <img src={KivaLogo} alt="Kiva Service" className="print-logo" />
            </div>
            <div className="print-company-info">
              <div className="print-bold">KIVA SERVICE</div>
              <div>Service și Reparații IT</div>
              <div>Tel: +40 XXX XXX XXX</div>
              <div>Email: contact@kivaservice.ro</div>
            </div>
          </div>

          {/* Document Title */}
          <div className="print-title">
            Fișă de Recepție - Comandă #{order.id}
          </div>

          {/* Order Information */}
          <div className="print-order-info">
            <div className="print-info-section">
              <div className="print-info-title">Informații Comandă</div>
              <div className="print-info-item">
                <span className="print-info-label">Număr comandă:</span>
                <span className="print-info-value">#{order.id}</span>
              </div>
              <div className="print-info-item">
                <span className="print-info-label">Data recepție:</span>
                {/* <span className="print-info-value">{formatPrintDate(order.createdAt)}</span> */}
              </div>
              <div className="print-info-item">
                <span className="print-info-label">Status:</span>
                {/* <span className="print-info-value print-status-badge">{formatPrintStatus(order.status)}</span> */}
              </div>
              <div className="print-info-item">
                <span className="print-info-label">Device-uri:</span>
                <span className="print-info-value">{order.devices?.length || 0} buc.</span>
              </div>
            </div>

            <div className="print-info-section">
              <div className="print-info-title">Informații Client</div>
              <div className="print-info-item">
                <span className="print-info-label">Nume:</span>
                <span className="print-info-value">{order.clientName}</span>
              </div>
              {order.clientPhone && (
                <div className="print-info-item">
                  <span className="print-info-label">Telefon:</span>
                  <span className="print-info-value">{order.clientPhone}</span>
                </div>
              )}
              {order.clientEmail && (
                <div className="print-info-item">
                  <span className="print-info-label">Email:</span>
                  <span className="print-info-value">{order.clientEmail}</span>
                </div>
              )}
            </div>
          </div>

          {/* Devices Table */}
          <div className="print-devices-section">
            <div className="print-section-title">Device-uri Recepționate</div>
            {order.devices && order.devices.length > 0 ? (
              <table className="print-devices-table">
                <thead>
                  <tr>
                    <th style={{width: '8%'}}>Nr.</th>
                    <th style={{width: '15%'}}>Brand</th>
                    <th style={{width: '15%'}}>Model</th>
                    <th style={{width: '20%'}}>Serie</th>
                    <th style={{width: '30%'}}>Problemă raportată</th>
                    <th style={{width: '12%'}}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {order.devices.map((device, index) => (
                    <tr key={device.id}>
                      <td className="print-text-center print-bold">{index + 1}</td>
                      <td>{device.brand || 'N/A'}</td>
                      <td>{device.model || 'N/A'}</td>
                      <td>{device.serialNumber || 'N/A'}</td>
                      <td>
                        <div>{device.issueDescription || 'Nu a fost specificată'}</div>
                        {device.technicianNotes && (
                          <div className="device-issue">Note: {device.technicianNotes}</div>
                        )}
                      </td>
                      <td>
                        <span className="print-status-badge">
                          {/* {formatPrintStatus(device.status)} */}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="print-text-center print-italic" style={{padding: '20px'}}>
                Nu sunt device-uri în această comandă.
              </div>
            )}
          </div>

          {/* Terms and Conditions */}
          <div className="print-terms">
            <div className="print-terms-title">Termeni și Condiții</div>
            <ol className="print-terms-list">
              <li>Clientul confirmă că device-urile predate corespund descrierii de mai sus.</li>
              <li>KIVA Service nu este responsabil pentru pierderea datelor. Recomandăm realizarea unui backup înainte de predare.</li>
              <li>Durata estimată de reparație este de 3-7 zile lucrătoare, în funcție de complexitatea problemei.</li>
              <li>Clientul va fi contactat telefonic la finalizarea reparației.</li>
              <li>Device-urile nereclmate în termen de 30 de zile vor fi considerate abandonate.</li>
              <li>Garantia pentru reparația efectuată este de 30 de zile pentru defectul remediat.</li>
              <li>Plata se efectuează la ridicarea device-ului reparat.</li>
              <li>În cazul în care reparația nu poate fi efectuată, se percepe o taxă de diagnosticare de 50 RON.</li>
            </ol>
          </div>

          {/* Signatures */}
          <div className="print-signatures">
            <div className="print-signature-box">
              <div className="print-signature-title">Semnătura Clientului</div>
              <div className="print-signature-line"></div>
              <div className="print-signature-label">Semnătura și numele clientului</div>
            </div>

            <div className="print-signature-box">
              <div className="print-signature-title">Semnătura Reprezentant KIVA</div>
              <div className="print-signature-line"></div>
              <div className="print-signature-label">Semnătura și numele tehnicianului</div>
            </div>
          </div>

          {/* Footer */}
          <div className="print-footer">
            <div>
              Acest document constituie dovada recepției device-urilor și acordul pentru serviciile KIVA Service.
            </div>
            <div style={{marginTop: '10px'}}>
              KIVA SERVICE - Str. Exemplu nr. 123, București | CUI: XXXXXXXXX | Tel: +40 XXX XXX XXX
            </div>
          </div>
        </div>
    </>
  )
}

export default ClientOrderDetails
