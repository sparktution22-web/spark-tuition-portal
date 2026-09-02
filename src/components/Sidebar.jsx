import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  FiGrid, FiCalendar, FiFileText, FiDollarSign, FiAward, FiDownload,
  FiBell, FiSettings, FiLogOut, FiUsers, FiX, FiClock,
  FiCheckSquare, FiUpload, FiCpu, FiCamera, FiUserPlus, FiMessageCircle, FiBookOpen, FiActivity, FiBook, FiHelpCircle, FiVideo,
  FiChevronDown
} from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import sparkLogo from '../assets/spark-logo.png'

// Student/parent sidebar — unchanged, simple flat list.
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

// Admin sidebar — a mix of standalone top-level items and collapsible
// categories, laid out exactly as requested. Each category carries an
// `accent` color used for its left-border/icon treatment, so categories
// are visually distinct from each other at a glance rather than one
// long uniform list.
const ADMIN_NAV = [
  { type: 'link', to: '/app', label: 'Dashboard', icon: FiGrid, end: true },
  {
    type: 'category', label: 'Student Report', icon: FiFileText, accent: '#FF6B00',
    links: [
      { to: '/app/student-report', label: 'Student Report', icon: FiFileText },
      { to: '/app/reports', label: 'Monthly Report', icon: FiDownload },
      { to: '/app/attendance', label: 'Attendance Report', icon: FiCalendar },
    ]
  },
  {
    type: 'category', label: 'Test', icon: FiAward, accent: '#8B5CF6',
    links: [
      { to: '/app/submit-answer', label: 'Submit Answer Script', icon: FiUpload },
      { to: '/app/marks', label: 'Test Marks', icon: FiAward },
      { to: '/app/admin/tests', label: 'Manage Test', icon: FiFileText },
      { to: '/app/admin/review-submissions', label: 'Review Submission', icon: FiCpu },
      { to: '/app/admin/marks', label: 'Manage Marks', icon: FiAward },
    ]
  },
  {
    type: 'category', label: 'Attendance', icon: FiCalendar, accent: '#2ECC71',
    links: [
      { to: '/app/admin/attendance', label: 'Manage Attendance', icon: FiCalendar },
      { to: '/app/admin/scan-attendance', label: 'Scan Attendance', icon: FiCamera },
      { to: '/tap-checkin', label: 'Tap Check-In', icon: FiCheckSquare },
    ]
  },
  {
    type: 'category', label: 'Classes and Time Table', icon: FiClock, accent: '#3B82F6',
    links: [
      { to: '/app/timetable', label: 'Time Table', icon: FiClock },
      { to: '/app/admin/timetable', label: 'Manage Time Table', icon: FiClock },
      { to: '/app/admin/online-classes', label: 'Online Classes', icon: FiVideo },
    ]
  },
  {
    type: 'category', label: 'Login', icon: FiUserPlus, accent: '#F59E0B',
    links: [
      { to: '/app/admin/login-activity', label: 'Login Activity', icon: FiActivity },
      { to: '/app/admin/create-account', label: 'Create Login', icon: FiUserPlus },
      { to: '/app/admin/students', label: 'Manage Students', icon: FiUsers },
    ]
  },
  { type: 'link', to: '/app/admin/doubt-box', label: 'Doubt Box', icon: FiHelpCircle },
  {
    type: 'category', label: 'Material', icon: FiBook, accent: '#EC4899',
    links: [
      { to: '/app/study-materials', label: 'Study Material', icon: FiBook },
      { to: '/app/admin/study-materials', label: 'Manage Study Material', icon: FiBook },
    ]
  },
  {
    type: 'category', label: 'Student Home Work', icon: FiBookOpen, accent: '#14B8A6',
    links: [
      { to: '/app/admin/homework', label: 'Manage Homework', icon: FiBookOpen },
      { to: '/app/homework', label: 'Homework', icon: FiBookOpen },
    ]
  },
  {
    type: 'category', label: 'Fees', icon: FiDollarSign, accent: '#FF6B00',
    links: [
      { to: '/app/fees', label: 'Fees', icon: FiDollarSign },
      { to: '/app/admin/fees', label: 'Manage Fees', icon: FiDollarSign },
    ]
  },
  { type: 'link', to: '/app/notifications', label: 'Notification', icon: FiBell },
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
  // navigating straight to a link never leaves you looking at a
  // collapsed section with no indication of where you are.
  const [openCategory, setOpenCategory] = useState(() => {
    if (!isAdmin) return null
    const match = ADMIN_NAV.find((item) => item.type === 'category' && item.links.some((l) => location.pathname.startsWith(l.to)))
    return match ? match.label : null
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
          {!isAdmin && baseLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.end} onClick={onClose} className={linkClass}>
              <link.icon className="w-[18px] h-[18px] shrink-0" />
              {link.label}
            </NavLink>
          ))}

          {isAdmin && ADMIN_NAV.map((item) => {
            if (item.type === 'link') {
              return (
                <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose} className={linkClass}>
                  <item.icon className="w-[18px] h-[18px] shrink-0" />
                  {item.label}
                </NavLink>
              )
            }
            const isOpen = openCategory === item.label
            return (
              <div key={item.label}>
                <button
                  onClick={() => setOpenCategory(isOpen ? null : item.label)}
                  className={`w-full flex items-center justify-between gap-2 pl-3 pr-3.5 py-2.5 rounded-xl text-sm font-bold transition-colors border-l-[3px] ${
                    isOpen
                      ? 'bg-spark-surface dark:bg-white/5 text-spark-ink dark:text-white'
                      : 'text-spark-ink/70 dark:text-white/70 hover:bg-spark-peach/60 dark:hover:bg-white/5'
                  }`}
                  style={{ borderLeftColor: isOpen ? item.accent : 'transparent' }}
                >
                  <span className="flex items-center gap-2.5">
                    <item.icon className="w-[17px] h-[17px] shrink-0" style={{ color: item.accent }} />
                    {item.label}
                  </span>
                  <FiChevronDown className={`w-[14px] h-[14px] shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${isOpen ? 'max-h-96 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                  <div className="space-y-1 pl-3 border-l-2 ml-4 mb-1" style={{ borderColor: item.accent + '30' }}>
                    {item.links.map((link) => (
                      <NavLink key={link.to} to={link.to} onClick={onClose} className={linkClass}>
                        <link.icon className="w-[16px] h-[16px] shrink-0" />
                        {link.label}
                      </NavLink>
                    ))}
                  </div>
                </div>
              </div>
            )
          })}

          <NavLink to="/app/settings" onClick={onClose} className={linkClass}>
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
