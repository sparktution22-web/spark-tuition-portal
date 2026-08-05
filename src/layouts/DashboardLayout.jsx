import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from '../components/Sidebar.jsx'
import Topbar from '../components/Topbar.jsx'

const TITLES = {
  '/app': 'Dashboard',
  '/app/attendance': 'Attendance',
  '/app/student-report': 'Student Report',
  '/app/fees': 'Fees',
  '/app/marks': 'Test Marks',
  '/app/reports': 'Monthly Reports',
  '/app/notifications': 'Notifications',
  '/app/settings': 'Settings',
  '/app/admin/students': 'Manage Students',
  '/app/admin/analytics': 'Analytics'
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()
  const title = TITLES[location.pathname] || 'SPARK'

  return (
    <div className="min-h-screen bg-spark-surface dark:bg-spark-ink flex">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 min-w-0">
        <Topbar onMenuClick={() => setSidebarOpen(true)} title={title} />
        <main className="p-5 sm:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
