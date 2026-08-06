import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext.jsx'
import { getStudentById } from '../services/api/sheetsApi.js'
import sparkLogo from '../assets/spark-logo.png'
export default function Register() {
  const { register, isMockAuth } = useAuth()
  const navigate = useNavigate()
  const [rollNo, setRollNo] = useState('')
  const [role, setRole] = useState('parent')
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
    const cleanRollNo = rollNo.trim().toUpperCase()
    if (!cleanRollNo) {
      setError('Please enter a roll number.')
      return
    }
    setLoading(true)
    try {
      // Confirm the roll number actually exists before creating an account
      // for it. In mock mode there's no real roster to check against, so
      // this step is skipped and any roll number is accepted.
      if (!isMockAuth) {
        const student = await getStudentById(cleanRollNo)
        if (!student) {
          setError(`Roll number "${cleanRollNo}" was not found. Please check and try again.`)
          setLoading(false)
          return
        }
      }
      const email = `${cleanRollNo}-${role}@spark.local`
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
          <img src={sparkLogo} alt="SPARK" className="h-16 sm:h-20 w-auto" />
        </Link>
        <h1 className="font-display font-bold text-2xl text-center text-spark-ink mb-1">Create your account</h1>
        <p className="text-center text-sm text-spark-ink/50 mb-7">
          Enter your child's roll number to set up parent or student access.
        </p>
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
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
