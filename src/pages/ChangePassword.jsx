import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { FiLock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

export default function ChangePassword() {
  const { changePassword } = useAuth()
  const navigate = useNavigate()
  const [newPassword, setNewPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (newPassword !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setLoading(true)
    try {
      await changePassword(newPassword)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not change password. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-spark-surface flex items-center justify-center px-5 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-spark-orange/10 blur-3xl" aria-hidden="true" />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl3 shadow-card p-8 sm:p-10"
      >
        <div className="flex justify-center mb-6">
          <img src={sparkLogo} alt="SPARK" className="h-16 sm:h-20 w-auto" />
        </div>
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-spark-orange/10 flex items-center justify-center">
            <FiLock className="text-spark-orange" size={22} />
          </div>
        </div>
        <h1 className="font-display font-bold text-2xl text-center text-spark-ink mb-1">Set a new password</h1>
        <p className="text-center text-sm text-spark-ink/50 mb-7">
          Your account was set up with a temporary password. Please choose a new one before continuing.
        </p>
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="newPassword" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">New Password</label>
            <input
              id="newPassword"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>
          <div>
            <label htmlFor="confirm" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">Confirm New Password</label>
            <input
              id="confirm"
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
              placeholder="Type it again"
            />
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            {loading ? 'Saving...' : 'Set Password & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
