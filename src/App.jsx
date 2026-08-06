import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext.jsx'
import { ThemeProvider } from './contexts/ThemeContext.jsx'
import { StudentProvider } from './contexts/StudentContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Landing from './pages/Landing.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import DashboardHome from './pages/dashboard/DashboardHome.jsx'
import Attendance from './pages/dashboard/Attendance.jsx'
import StudentReport from './pages/dashboard/StudentReport.jsx'
import Fees from './pages/dashboard/Fees.jsx'
import TestMarks from './pages/dashboard/TestMarks.jsx'
import MonthlyReports from './pages/dashboard/MonthlyReports.jsx'
import Notifications from './pages/dashboard/Notifications.jsx'
import Settings from './pages/dashboard/Settings.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminMarks from './pages/admin/AdminMarks.jsx'
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/app"
            element={
              <ProtectedRoute>
                <StudentProvider>
                  <DashboardLayout />
                </StudentProvider>
              </ProtectedRoute>
            }
          >
            <Route index element={<DashboardHome />} />
            <Route path="attendance" element={<Attendance />} />
            <Route path="student-report" element={<StudentReport />} />
            <Route path="fees" element={<Fees />} />
            <Route path="marks" element={<TestMarks />} />
            <Route path="reports" element={<MonthlyReports />} />
            <Route path="notifications" element={<Notifications />} />
            <Route path="settings" element={<Settings />} />
            <Route
              path="admin/students"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminStudents />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/analytics"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminAnalytics />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/marks"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminMarks />
                </ProtectedRoute>
              }
            />
          </Route>
        </Routes>
      </AuthProvider>
    </ThemeProvider>
  )
}
export default App
