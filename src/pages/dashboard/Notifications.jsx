import { useEffect, useState } from 'react'
import { FiDollarSign, FiCalendar, FiAward, FiFileText, FiGift, FiBell } from 'react-icons/fi'
import { getNotifications } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const ICONS = {
  fee: FiDollarSign,
  absent: FiCalendar,
  test: FiAward,
  report: FiFileText,
  birthday: FiGift,
  announcement: FiBell
}

const TONE = {
  fee: 'bg-red-50 text-red-500 dark:bg-red-500/10',
  absent: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10',
  test: 'bg-blue-50 text-blue-600 dark:bg-blue-500/10',
  report: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  birthday: 'bg-pink-50 text-pink-500 dark:bg-pink-500/10',
  announcement: 'bg-spark-peach text-spark-orange dark:bg-white/10'
}

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    getNotifications().then((data) => {
      setNotifications(data)
      setLoading(false)
    })
  }, [])

  const markAllRead = () => setNotifications((list) => list.map((n) => ({ ...n, read: true })))

  const filtered = filter === 'unread' ? notifications.filter((n) => !n.read) : notifications

  if (loading) return <SkeletonTable rows={5} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {['all', 'unread'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${
                filter === f ? 'bg-spark-gradient text-white shadow-soft' : 'bg-white dark:bg-white/5 text-spark-ink/60 dark:text-white/60 border border-spark-ink/10 dark:border-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <button onClick={markAllRead} className="text-sm font-semibold text-spark-orange hover:underline">
          Mark all as read
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FiBell} title="You're all caught up" description="No notifications to show here." />
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => {
            const Icon = ICONS[n.type] || FiBell
            return (
              <div
                key={n.id}
                className={`flex items-start gap-4 p-5 rounded-xl2 border transition-colors ${
                  n.read ? 'bg-white dark:bg-white/5 border-spark-ink/5 dark:border-white/10' : 'bg-spark-peach/40 dark:bg-white/10 border-spark-orange/20'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${TONE[n.type] || TONE.announcement}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-spark-ink dark:text-white">{n.title}</p>
                    <span className="text-xs text-spark-ink/40 dark:text-white/40 shrink-0">
                      {new Date(n.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-sm text-spark-ink/60 dark:text-white/60 mt-0.5">{n.message}</p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-spark-orange mt-2 shrink-0" />}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
