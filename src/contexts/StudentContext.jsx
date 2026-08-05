import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext.jsx'
import { getStudents } from '../services/api/sheetsApi.js'

const StudentContext = createContext(null)

/**
 * Tracks which student's data is currently being viewed.
 * Parents/students are locked to their own record; admins get a
 * student switcher (used in Attendance, Fees, Marks, Reports, etc).
 */
export function StudentProvider({ children }) {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [selectedStudentId, setSelectedStudentId] = useState(user?.studentId || null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStudents().then((list) => {
      setStudents(list)
      if (user?.role === 'admin' && !selectedStudentId && list.length) {
        setSelectedStudentId(list[0].id)
      } else if (user?.role !== 'admin') {
        setSelectedStudentId(user?.studentId || null)
      }
      setLoading(false)
    })
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
        canSwitch: user?.role === 'admin'
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
