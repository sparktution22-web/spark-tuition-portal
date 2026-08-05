import { FiMenu, FiSun, FiMoon, FiBell } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext.jsx'
import { useAuth } from '../contexts/AuthContext.jsx'

export default function Topbar({ onMenuClick, title }) {
  const { dark, toggleDark } = useTheme()
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 bg-spark-surface/80 dark:bg-spark-ink/80 backdrop-blur-md border-b border-spark-ink/5 dark:border-white/10">
      <div className="flex items-center justify-between px-5 sm:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-spark-peach dark:hover:bg-white/10 transition-colors"
            onClick={onMenuClick}
            aria-label="Open menu"
          >
            <FiMenu className="text-spark-ink dark:text-white" />
          </button>
          <div>
            <h1 className="font-display font-bold text-lg sm:text-xl text-spark-ink dark:text-white">{title}</h1>
            <p className="text-xs text-spark-ink/40 dark:text-white/40 hidden sm:block">
              Welcome back{user?.role === 'admin' ? '' : ','} {user?.role !== 'admin' ? user?.email?.split('@')[0] : ''}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={toggleDark}
            className="p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-card text-spark-ink dark:text-white hover:text-spark-orange transition-colors"
            aria-label="Toggle dark mode"
          >
            {dark ? <FiSun /> : <FiMoon />}
          </button>
          <Link
            to="/app/notifications"
            className="p-2.5 rounded-xl bg-white dark:bg-white/10 shadow-card text-spark-ink dark:text-white hover:text-spark-orange transition-colors relative"
            aria-label="Notifications"
          >
            <FiBell />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-spark-orange border-2 border-spark-surface dark:border-spark-ink" />
          </Link>
          <div className="w-9 h-9 rounded-full bg-spark-gradient text-white flex items-center justify-center font-bold text-sm shrink-0">
            {user?.email?.[0]?.toUpperCase() || '?'}
          </div>
        </div>
      </div>
    </header>
  )
}
