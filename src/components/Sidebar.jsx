import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid, FiCalendar, FiFileText, FiDollarSign, FiAward, FiDownload,
  FiBell, FiSettings, FiLogOut, FiUsers, FiBarChart2, FiX, FiClock,
  FiCheckSquare, FiUpload, FiCpu, FiCamera, FiUserPlus, FiMessageCircle, FiBookOpen, FiActivity, FiBook, FiHelpCircle, FiVideo,
  FiChevronDown
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

const BASE_LINKS = [
  { to: '/app', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/app/attendance', label: 'Attendance', icon: FiCalendar },
  { to: '/app/student-report', label: 'Student Report', icon: FiFileText },
  { to: '/app/fees', label: 'Fees', icon: FiDollarSign },
  { to: '/app/marks', label: 'Test Marks', icon: FiAward },
  { to: '/app/submit-answer', label: 'Submit Answer Script', icon: FiUpload },
  { to: '/app/timetable', label: 'Timetable', icon: FiClock },
  { to: '/app/homework', label: 'Homework', icon: FiBookOpen },
  { to: '/app/study-materials', label: 'Study Materials', icon: FiBook },
  { to: '/app/doubt-box', label: 'Doubt Box', icon: FiHelpCircle },
  { to: '/app/reports', label: 'Monthly Reports', icon: FiDownload },
  { to: '/app/notifications', label: 'Notifications', icon: FiBell },
  { to: '/app/contact-us', label: 'Contact Us', icon: FiMessageCircle }
]

const ADMIN_CATEGORIES = [
  {
    label: 'Students & Accounts',
    icon: FiUsers,
    links: [
      { to: '/app/admin/students', label: 'Manage Students', icon: FiUsers },
      { to: '/app/admin/create-account', label: 'Create Login', icon: FiUserPlus },
      { to: '/app/admin/login-activity', label: 'Login Activity', icon: FiActivity },
    ]
  },
  {
    label: 'Attendance & Schedule',
    icon: FiCalendar,
    links: [
      { to: '/app/admin/attendance', label: 'Manage Attendance', icon: FiCalendar },
      { to: '/app/admin/scan-attendance', label: 'Scan Attendance', icon: FiCamera },
      { to: '/app/admin/timetable', label: 'Manage Timetable', icon: FiClock },
      { to: '/app/admin/online-classes', label: 'Online Classes', icon: FiVideo },
      { to: '/tap-checkin', label: 'Tap Check-In', icon: FiCheckSquare },
    ]
  },
  {
    label: 'Academics',
    icon: FiAward,
    links: [
      { to: '/app/admin/marks', label: 'Manage Marks', icon: FiAward },
      { to: '/app/admin/tests', label: 'Manage Tests', icon: FiFileText },
      { to: '/app/admin/review-submissions', label: 'Review Submissions', icon: FiCpu },
      { to: '/app/admin/homework', label: 'Manage Homework', icon: FiBookOpen },
      { to: '/app/admin/study-materials', label: 'Study Materials', icon: FiBook },
      { to: '/app/admin/doubt-box', label: 'Doubt Box', icon: FiHelpCircle },
    ]
  },
  {
    label: 'Fees & Reports',
    icon: FiDollarSign,
    links: [
      { to: '/app/admin/fees', label: 'Manage Fees', icon: FiDollarSign },
      { to: '/app/admin/analytics', label: 'Analytics', icon: FiBarChart2 },
    ]
  },
]

// Links hidden entirely for a given role, keyed by role.
const HIDDEN_FOR_ROLE = {
  student: ['/app/fees', '/app/contact-us'],
  parent: ['/app/submit-answer'],
  admin: ['/app/contact-us']
}

export default function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const location = useLocation()
  const isAdmin = user?.role === 'admin'

  const hidden = HIDDEN_FOR_ROLE[user?.role] || []
  const baseLinks = BASE_LINKS.filter((link) => !hidden.includes(link.to))

  // Whichever category contains the current route starts expanded, so
  // navigating straight to a link (e.g. a bookmark, or a page refresh)
  // never leaves you looking at a collapsed section with no visible
  // indication of where you are.
  const [openCategory, setOpenCategory] = useState(() => {
    if (!isAdmin) return null
    const match = ADMIN_CATEGORIES.find((cat) => cat.links.some((l) => location.pathname.startsWith(l.to)))
    return match ? match.label : ADMIN_CATEGORIES[0].label
  })

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
      isActive
        ? 'bg-spark-gradient text-white shadow-soft'
        : 'text-spark-ink/60 dark:text-white/60 hover:bg-spark-peach dark:hover:bg-white/5 hover:text-spark-orange'
    }`

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
          <img src={sparkLogo} alt="SPARK" className="h-10 w-auto" />
          <button className="lg:hidden p-1.5 rounded-full hover:bg-spark-peach dark:hover:bg-white/10" onClick={onClose} aria-label="Close menu">
            <FiX />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 space-y-1" aria-label="Dashboard">
          {baseLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={onClose} className={linkClass}>
              <link.icon className="w-[18px] h-[18px] shrink-0" />
              {link.label}
            </NavLink>
          ))}

          {isAdmin && (
            <div className="pt-3 mt-2 border-t border-spark-ink/5 dark:border-white/10 space-y-1">
              {ADMIN_CATEGORIES.map((cat) => {
                const isOpen = openCategory === cat.label
                return (
                  <div key={cat.label}>
                    <button
                      onClick={() => setOpenCategory(isOpen ? null : cat.label)}
                      className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wide text-spark-ink/40 dark:text-white/40 hover:text-spark-orange transition-colors"
                    >
                      <span className="flex items-center gap-2"><cat.icon className="w-[15px] h-[15px]" /> {cat.label}</span>
                      <FiChevronDown className={`w-[14px] h-[14px] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="space-y-1 pl-1">
                        {cat.links.map((link) => (
                          <NavLink key={link.to} to={link.to} onClick={onClose} className={linkClass}>
                            <link.icon className="w-[18px] h-[18px] shrink-0" />
                            {link.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          <NavLink
            to="/app/settings"
            onClick={onClose}
            className={linkClass}
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
