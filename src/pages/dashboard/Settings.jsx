import { useState } from 'react'
import { FiUser, FiLock, FiMoon, FiSun, FiGlobe, FiBell } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useTheme } from '../../contexts/ThemeContext.jsx'

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`w-11 h-6 rounded-full relative transition-colors ${checked ? 'bg-spark-gradient' : 'bg-spark-ink/15 dark:bg-white/15'}`}
      aria-pressed={checked}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-[22px]' : 'translate-x-0.5'}`}
      />
    </button>
  )
}

export default function Settings() {
  const { user } = useAuth()
  const { dark, toggleDark } = useTheme()
  const [prefs, setPrefs] = useState({ feeReminders: true, absentAlerts: true, testReminders: true, announcements: true })
  const [language, setLanguage] = useState('English')

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-5 flex items-center gap-2">
          <FiUser className="text-spark-orange" /> Profile
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Email</label>
            <input readOnly value={user?.email || ''} className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 bg-spark-surface dark:bg-white/5 dark:text-white text-sm" />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Role</label>
            <input readOnly value={user?.role || ''} className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 bg-spark-surface dark:bg-white/5 dark:text-white text-sm capitalize" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-5 flex items-center gap-2">
          <FiLock className="text-spark-orange" /> Password
        </h3>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <input type="password" placeholder="New password" className="px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
          <input type="password" placeholder="Confirm password" className="px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
        </div>
        <button className="px-5 py-2.5 rounded-full bg-spark-gradient text-white text-sm font-bold shadow-soft hover:shadow-card-hover transition-all">
          Update Password
        </button>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-5 flex items-center gap-2">
          {dark ? <FiMoon className="text-spark-orange" /> : <FiSun className="text-spark-orange" />} Appearance
        </h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-semibold text-spark-ink dark:text-white">Dark mode</p>
            <p className="text-xs text-spark-ink/50 dark:text-white/50">Switch between light and dark themes</p>
          </div>
          <Toggle checked={dark} onChange={toggleDark} />
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-5 flex items-center gap-2">
          <FiGlobe className="text-spark-orange" /> Language
        </h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          {['English', 'Hindi', 'Malayalam'].map((l) => (
            <option key={l} value={l}>{l}</option>
          ))}
        </select>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-5 flex items-center gap-2">
          <FiBell className="text-spark-orange" /> Notification Preferences
        </h3>
        <div className="space-y-4">
          {[
            { key: 'feeReminders', label: 'Fee reminders' },
            { key: 'absentAlerts', label: 'Absence alerts' },
            { key: 'testReminders', label: 'Upcoming test reminders' },
            { key: 'announcements', label: 'Centre announcements' }
          ].map((p) => (
            <div key={p.key} className="flex items-center justify-between">
              <p className="text-sm font-medium text-spark-ink dark:text-white">{p.label}</p>
              <Toggle checked={prefs[p.key]} onChange={(v) => setPrefs((prev) => ({ ...prev, [p.key]: v }))} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
