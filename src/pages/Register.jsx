import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

export default function Register() {
  const { register, isMockAuth } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setLoading(true)
    try {
      await register(email, password)
      navigate('/app', { replace: true })
    } catch (err) {
      setError(err.message || 'Could not create account. Please try again.')
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
        <Link to="/" className="flex justify-center mb-6">
          <img src={sparkLogo} alt="SPARK" className="h-9 w-auto" />
        </Link>

        <h1 className="font-display font-bold text-2xl text-center text-spark-ink mb-1">Create your account</h1>
        <p className="text-center text-sm text-spark-ink/50 mb-7">
          {isMockAuth
            ? 'Use the same email your admin registered you with, so your role is recognized.'
            : 'Register to access your SPARK dashboard.'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="email" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">Email</label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
              placeholder="At least 6 characters"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-spark-ink/50 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-spark-orange hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  )
}
