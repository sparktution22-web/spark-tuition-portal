import { createContext, useContext, useEffect, useState } from 'react'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence
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
// Real accounts use a synthetic email built from the student's roll number
// and chosen role — e.g. SPK002-parent@spark.local or SPK002-student@spark.local
// (built in Login.jsx / Register.jsx, never typed by the user). There are
// no real email addresses on file for students/parents, so this pattern
// is checked first; the old roster-matching (parentEmail/studentEmail)
// stays as a fallback purely so the existing DEMO_ACCOUNTS still work in
// mock mode. Anything matching neither is treated as admin.
const SYNTHETIC_EMAIL_PATTERN = /^([A-Za-z0-9]+)-(parent|student)@spark\.local$/i
function resolveRole(email) {
  const match = SYNTHETIC_EMAIL_PATTERN.exec(email || '')
  if (match) {
    return { role: match[2].toLowerCase(), studentId: match[1].toUpperCase() }
  }
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
      // Explicitly LOCAL persistence — stays logged in across browser
      // restarts/tab closes until an explicit logout(), not just for
      // the current session. This is Firebase's default anyway, but
      // set explicitly so it never silently depends on that default.
      setPersistence(auth, browserLocalPersistence).catch(() => {
        // Persistence setting can fail in some private-browsing modes —
        // login still works, it just won't survive a browser restart
        // in that case. Not worth blocking the app over.
      })
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
