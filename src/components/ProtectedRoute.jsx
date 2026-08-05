import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext.jsx'

/**
 * Gates a route behind login, and optionally behind a set of allowed roles.
 * Usage: <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
 */
export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-spark-surface dark:bg-spark-ink">
        <div className="w-10 h-10 border-4 border-spark-peach border-t-spark-orange rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />
  if (roles && !roles.includes(user.role)) return <Navigate to="/app" replace />

  return children
}
