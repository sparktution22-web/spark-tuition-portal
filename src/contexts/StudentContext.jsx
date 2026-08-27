import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { getStudents, getLinkedStudents } from '../services/api/sheetsApi.js'
const StudentContext = createContext(null)

/**
 * Tracks which student's data is currently being viewed.
 * Admins get the full roster to switch between. Parents get their own
 * child by default — but a parent with more than one child linked to
 * their login (see AdminCreateAccount.jsx's "Link Another Child")
 * can now switch between their own kids too, not the whole roster.
 * Students are always locked to themselves.
 */
export function StudentProvider({ children }) {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(user?.studentId || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    setLoading(true)

    if (user.role === 'admin') {
      getStudents().then((list) => {
        setStudents(list)
        if (!selectedStudentId && list.length) setSelectedStudentId(list[0].id)
        setLoading(false)
      })
      return
    }

    if (user.role === 'parent') {
      // Returns just this parent's own child by default, or every
      // linked sibling if admin has linked more than one to this login.
      getLinkedStudents(user.email, user.studentId).then((list) => {
        setStudents(list)
        setSelectedStudentId(user.studentId || (list[0] && list[0].id) || null)
        setLoading(false)
      })
      return
    }

    // Student login — always locked to themselves, unchanged.
    setSelectedStudentId(user.studentId || null)
    setLoading(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const selectedStudent = students.find((s) => s.id === selectedStudentId) || null

  return (
    <StudentContext.Provider
      value={{
        students,
        loading,
        selectedStudentId,
        selectedStudent,
        setSelectedStudentId,
        // Admin always switches across the full roster. A parent only
        // gets a switcher once they actually have more than one linked
        // child — otherwise it'd show a dropdown with just one option,
        // which is more confusing than no dropdown at all.
        canSwitch: user?.role === 'admin' || (user?.role === 'parent' && students.length > 1)
      }}
    >
      {children}
    </StudentContext.Provider>
  )
}

export function useStudentContext() {
  const ctx = useContext(StudentContext)
  if (!ctx) throw new Error('useStudentContext must be used within StudentProvider')
  return ctx
}
