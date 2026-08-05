import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth'
import { auth, isFirebaseConfigured } from '../services/firebase/config.js'
import { STUDENTS } from '../services/api/mockData.js'

const AuthContext = createContext(null)

// Demo accounts used only in mock-auth mode (no Firebase configured).
// Role is resolved from the student roster: parentEmail -> parent,
// studentEmail -> student. Anything else logs in as admin.
const DEMO_PASSWORD = 'spark123'
export const DEMO_ACCOUNTS = [
  { email: 'admin@spark.com', role: 'admin', label: 'Admin' },
  { email: STUDENTS[0].parentEmail, role: 'parent', label: 'Parent', studentId: STUDENTS[0].id },
  { email: STUDENTS[0].studentEmail, role: 'student', label: 'Student', studentId: STUDENTS[0].id }
]

function resolveRole(email) {
  const parent = STUDENTS.find((s) => s.parentEmail === email)
  if (parent) return { role: 'parent', studentId: parent.id }
  const student = STUDENTS.find((s) => s.studentEmail === email)
  if (student) return { role: 'student', studentId: student.id }
  return { role: 'admin', studentId: null }
}

const MOCK_SESSION_KEY = 'spark_mock_session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null) // { email, role, studentId }
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isFirebaseConfigured) {
      const unsub = onAuthStateChanged(auth, (fbUser) => {
        if (fbUser) {
          const { role, studentId } = resolveRole(fbUser.email)
          setUser({ email: fbUser.email, role, studentId, uid: fbUser.uid })
        } else {
          setUser(null)
        }
        setLoading(false)
      })
      return unsub
    }

    // Mock mode: restore session from localStorage
    const saved = localStorage.getItem(MOCK_SESSION_KEY)
    if (saved) setUser(JSON.parse(saved))
    setLoading(false)
  }, [])

  const login = async (email, password) => {
    if (isFirebaseConfigured) {
      await signInWithEmailAndPassword(auth, email, password)
      return
    }
    // Mock auth: any of the demo accounts, password "spark123"
    const account = DEMO_ACCOUNTS.find((a) => a.email === email)
    if (!account || password !== DEMO_PASSWORD) {
      throw new Error('Invalid email or password. Use one of the demo accounts below.')
    }
    const session = { email: account.email, role: account.role, studentId: account.studentId }
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
    setUser(session)
  }

  const register = async (email, password) => {
    if (isFirebaseConfigured) {
      await createUserWithEmailAndPassword(auth, email, password)
      return
    }
    const { role, studentId } = resolveRole(email)
    const session = { email, role, studentId }
    localStorage.setItem(MOCK_SESSION_KEY, JSON.stringify(session))
    setUser(session)
  }

  const logout = async () => {
    if (isFirebaseConfigured) {
      await firebaseSignOut(auth)
      return
    }
    localStorage.removeItem(MOCK_SESSION_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, isMockAuth: !isFirebaseConfigured }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
