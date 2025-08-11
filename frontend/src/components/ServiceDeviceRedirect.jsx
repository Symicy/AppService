import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

function ServiceDeviceRedirect() {
  const { deviceId } = useParams()
  const { currentUser } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    // Verifică dacă utilizatorul este autentificat
    if (!currentUser) {
      // Dacă nu este autentificat, redirecționează la login
      navigate('/login', { 
        state: { from: `/service-device/${deviceId}` }
      })
      return
    }

    // Dacă este autentificat, redirecționează la Devices cu filtrul aplicat
    navigate(`/devices?deviceId=${deviceId}`)
  }, [currentUser, deviceId, navigate])

  // Loading state în timpul redirecționării
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light">
      <div className="text-center">
        <div className="spinner-border text-primary mb-3" role="status">
          <span className="visually-hidden">Se redirecționează...</span>
        </div>
        <p className="text-muted">Se redirecționează către device...</p>
      </div>
    </div>
  )
}

export default ServiceDeviceRedirect
