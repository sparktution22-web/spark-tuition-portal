import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'
import TapCheckInCore from '../components/TapCheckInCore.jsx'

export default function TapCheckIn() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const exit = () => {
    logout()
    navigate('/login')
  }

  return <TapCheckInCore exitLabel="Log Out" onExit={exit} showDashboardLink />
}
