import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

// Sits inside ProtectedRoute (so "not logged in" is already handled) —
// this only adds the "logged in, but still has a temporary password"
// check. Self-registered accounts never have mustChangePassword set, so
// this is a no-op for them.
export default function RequirePasswordChange({ children }) {
  const { user } = useAuth()
  if (user?.mustChangePassword) {
    return <Navigate to="/change-password" replace />
  }
  return children
}
