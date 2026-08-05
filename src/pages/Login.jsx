import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth, DEMO_ACCOUNTS } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

export default function Login() {
  const { login, isMockAuth } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [email, setEmail] = useState('')
  const [rollNo, setRollNo] = useState('')
  const [role, setRole] = useState('parent')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/app'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      if (isMockAuth) {
        await login(email, password)
      } else {
        const cleanRollNo = rollNo.trim().toUpperCase()
        if (!cleanRollNo) {
          setError('Please enter a roll number.')
          setLoading(false)
          return
        }
        await login(`${cleanRollNo}-${role}@spark.local`, password)
      }
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.message || 'Could not log in. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const fillDemo = (account) => {
    setEmail(account.email)
    setPassword('spark123')
  }

  return (
    <div className="min-h-screen bg-spark-surface flex items-center justify-center px-5 py-12 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[30rem] h-[30rem] rounded-full bg-spark-orange/10 blur-3xl" aria-hidden="true" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[30rem] h-[30rem] rounded-full bg-spark-accent/10 blur-3xl" aria-hidden="true" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white rounded-xl3 shadow-card p-8 sm:p-10 relative"
      >
        <Link to="/" className="flex justify-center mb-6">
          <img src={sparkLogo} alt="SPARK" className="h-9 w-auto" />
        </Link>

        <h1 className="font-display font-bold text-2xl text-center text-spark-ink mb-1">Welcome back</h1>
        <p className="text-center text-sm text-spark-ink/50 mb-7">Log in to your SPARK account</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {isMockAuth ? (
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
          ) : (
            <>
              <div>
                <label htmlFor="rollNo" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">Roll Number</label>
                <input
                  id="rollNo"
                  type="text"
                  required
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors uppercase"
                  placeholder="e.g. SPK002"
                  autoCapitalize="characters"
                />
              </div>
              <div>
                <span className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">I am the</span>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('parent')}
                    className={`py-3 rounded-xl border font-semibold text-sm transition-colors ${
                      role === 'parent'
                        ? 'border-spark-orange bg-spark-orange/10 text-spark-orange'
                        : 'border-spark-ink/10 text-spark-ink/60'
                    }`}
                  >
                    Parent
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('student')}
                    className={`py-3 rounded-xl border font-semibold text-sm transition-colors ${
                      role === 'student'
                        ? 'border-spark-orange bg-spark-orange/10 text-spark-orange'
                        : 'border-spark-ink/10 text-spark-ink/60'
                    }`}
                  >
                    Student
                  </button>
                </div>
              </div>
            </>
          )}
          <div>
            <label htmlFor="password" className="text-xs font-semibold text-spark-ink/50 mb-1.5 block">Password</label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 focus:border-spark-orange outline-none transition-colors"
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-spark-ink/50 mt-6">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-spark-orange hover:underline">Register</Link>
        </p>

        {isMockAuth && (
          <div className="mt-7 pt-6 border-t border-spark-ink/10">
            <p className="text-xs font-semibold text-spark-ink/40 mb-3">
              No Firebase project connected yet — try a demo account (password: spark123)
            </p>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_ACCOUNTS.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => fillDemo(acc)}
                  className="text-xs font-semibold py-2 rounded-lg border border-spark-ink/10 hover:border-spark-orange hover:text-spark-orange transition-colors"
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
