import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function QRRedirect() {
  const { orderId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!orderId) {
      // Dacă nu există ID-ul comenzii, redirecționează la home
      navigate('/')
      return
    }

    // Verifică dacă utilizatorul este autentificat
    if (currentUser) {
      // Utilizator autentificat (Admin/Technician) - redirecționează la Orders cu filtru
      console.log('🔐 Authenticated user detected, redirecting to Orders with filter')
      navigate(`/orders?orderId=${orderId}`)
    } else {
      // Utilizator neautentificat (Client) - redirecționează la pagina de vizualizare publică
      console.log('👤 Guest user detected, redirecting to public order view')
      navigate(`/order-status/${orderId}`)
    }
  }, [orderId, currentUser, navigate])

  // Loading screen în timp ce se face redirecționarea
  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100" 
         style={{background: 'linear-gradient(135deg, #000000 0%, #1a1a1a 50%, #000000 100%)'}}>
      <div className="text-center">
        <i className="fas fa-qrcode fa-3x text-cyan mb-3"></i>
        <h4 className="text-white mb-3">Processing QR Code...</h4>
        <div className="spinner-border text-cyan" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p className="text-muted mt-3">Redirecting you to the appropriate page</p>
      </div>
    </div>
  )
}

export default QRRedirect
