import { NavLink } from 'react-router-dom'
import {
  FiGrid, FiCalendar, FiFileText, FiDollarSign, FiAward, FiDownload,
  FiBell, FiSettings, FiLogOut, FiUsers, FiBarChart2, FiX
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

const BASE_LINKS = [
  { to: '/app', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/app/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/app/student-report', label: 'Student Report', icon: FiFileText },
  { to: '/app/fees', label: 'Fees', icon: FiDollarSign },
  { to: '/app/marks', label: 'Test Marks', icon: FiAward },
  { to: '/app/reports', label: 'Monthly Reports', icon: FiDownload },
  { to: '/app/notifications', label: 'Notifications', icon: FiBell }
]

const ADMIN_LINKS = [
  { to: '/app/admin/students', label: 'Manage Students', icon: FiUsers },
  { to: '/app/admin/marks', label: 'Manage Marks', icon: FiAward },
  { to: '/app/admin/analytics', label: 'Analytics', icon: FiBarChart2 }
]

// Links hidden entirely for a given role, keyed by role. Currently just
// Fees hidden from students — add more entries here the same way if other
// tabs should be role-restricted later.
const HIDDEN_FOR_ROLE = {
  student: ['/app/fees']
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()

  const allLinks = user?.role === 'admin' ? [...BASE_LINKS, ...ADMIN_LINKS] : BASE_LINKS
  const hidden = HIDDEN_FOR_ROLE[user?.role] || []
  const links = allLinks.filter((link) => !hidden.includes(link.to))

  return (
    <>
      {open && (
        <div className="fixed inset-0 bg-black/30 z-40 lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-white dark:bg-spark-dark border-r border-spark-ink/5 dark:border-white/10 flex flex-col z-50 transition-transform duration-300 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5">
          <img src={sparkLogo} alt="SPARK" className="h-7 w-auto" />
          <button className="lg:hidden p-1.5 rounded-full hover:bg-spark-peach dark:hover:bg-white/10" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1" aria-label="Dashboard">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-spark-gradient text-white shadow-soft'
                    : 'text-spark-ink/60 dark:text-white/60 hover:bg-spark-peach dark:hover:bg-white/5 hover:text-spark-orange'
                }`
              }
            >
              <link.icon className="w-[18px] h-[18px] shrink-0" />
              {link.label}
            </NavLink>
          ))}

          <NavLink
            to="/app/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-spark-gradient text-white shadow-soft'
                  : 'text-spark-ink/60 dark:text-white/60 hover:bg-spark-peach dark:hover:bg-white/5 hover:text-spark-orange'
              }`
            }
          >
            <FiSettings className="w-[18px] h-[18px] shrink-0" />
            Settings
          </NavLink>
        </nav>

        <div className="p-3 border-t border-spark-ink/5 dark:border-white/10">
          <div className="px-3.5 py-2 mb-1">
            <p className="text-xs font-semibold text-spark-ink dark:text-white truncate">{user?.email}</p>
            <p className="text-[10px] uppercase tracking-wide text-spark-orange font-bold">{user?.role}</p>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-spark-ink/60 dark:text-white/60 hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors"
          >
            <FiLogOut className="w-[18px] h-[18px]" />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}
