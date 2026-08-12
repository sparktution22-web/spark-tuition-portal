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
import SubmitAnswer from './pages/dashboard/SubmitAnswer.jsx'
import MonthlyReports from './pages/dashboard/MonthlyReports.jsx'
import Notifications from './pages/dashboard/Notifications.jsx'
import Settings from './pages/dashboard/Settings.jsx'
import AdminStudents from './pages/admin/AdminStudents.jsx'
import AdminAnalytics from './pages/admin/AdminAnalytics.jsx'
import AdminMarks from './pages/admin/AdminMarks.jsx'
import AdminTests from './pages/admin/AdminTests.jsx'
import AdminReviewSubmissions from './pages/admin/AdminReviewSubmissions.jsx'
import AdminAttendance from './pages/admin/AdminAttendance.jsx'
import AdminTimetable from './pages/admin/AdminTimetable.jsx'
import Timetable from './pages/dashboard/Timetable.jsx'
import TapCheckIn from './pages/TapCheckIn.jsx'
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/tap-checkin"
            element={
              <ProtectedRoute roles={['admin']}>
                <TapCheckIn />
              </ProtectedRoute>
            }
          />
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
            <Route path="submit-answer" element={<SubmitAnswer />} />
            <Route path="reports" element={<MonthlyReports />} />
            <Route path="timetable" element={<Timetable />} />
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
            <Route
              path="admin/tests"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminTests />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/review-submissions"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminReviewSubmissions />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/attendance"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminAttendance />
                </ProtectedRoute>
              }
            />
            <Route
              path="admin/timetable"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminTimetable />
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
