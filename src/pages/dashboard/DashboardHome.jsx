import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiUsers, FiCalendar, FiDollarSign, FiAward, FiClock, FiBell } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getAttendance, getFees, getMarks, getNotifications, getAnnouncements } from '../../services/api/sheetsApi.js'
import { summarizeAttendance } from '../../utils/format.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart.jsx'
import { SkeletonCards, SkeletonBlock } from '../../components/Skeleton.jsx'

export default function DashboardHome() {
  const { user } = useAuth()
  const { selectedStudentId, selectedStudent, students } = useStudentContext()
  const [attendance, setAttendance] = useState([])
  const [fees, setFees] = useState([])
  const [marks, setMarks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStudentId) return
    setLoading(true)
    Promise.all([
      getAttendance(selectedStudentId),
      getFees(selectedStudentId),
      getMarks(selectedStudentId),
      getNotifications(),
      getAnnouncements()
    ]).then(([att, fee, mk, notif, ann]) => {
      setAttendance(att)
      setFees(fee)
      setMarks(mk)
      setNotifications(notif)
      setAnnouncements(ann)
      setLoading(false)
    })
  }, [selectedStudentId])

  const summary = summarizeAttendance(attendance)
  const collectedFees = fees.reduce((s, f) => s + f.paid, 0)
  const pendingFees = fees.reduce((s, f) => s + f.pending, 0)
  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length) : 0

  const trendData = attendance.reduce((acc, r) => {
    const weekLabel = `Wk ${Math.ceil(new Date(r.date).getDate() / 7)}`
    let bucket = acc.find((b) => b.label === weekLabel)
    if (!bucket) {
      bucket = { label: weekLabel, present: 0, total: 0 }
      acc.push(bucket)
    }
    if (r.status !== 'Holiday') bucket.total += 1
    if (r.status === 'Present' || r.status === 'Late') bucket.present += 1
    return acc
  }, [])
  const trendPct = trendData.map((b) => ({ label: b.label, present: b.total ? Math.round((b.present / b.total) * 100) : 0 }))

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={user?.role === 'admin' ? 6 : 4} />
        <SkeletonBlock className="h-72" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-spark-gradient rounded-xl3 shadow-soft p-6 sm:p-8 text-white relative overflow-hidden"
      >
        <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute -right-4 bottom-[-3rem] w-32 h-32 rounded-full bg-white/10" />
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-wide text-white/70 mb-1">
            {user?.role === 'admin' ? 'Centre Overview' : 'Your Overview'}
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1">
            {user?.role === 'admin' ? `${students.length} students, one live view` : selectedStudent?.name || '\u2014'}
          </h2>
          <p className="text-white/80 text-sm">
            {user?.role === 'admin'
              ? "Here's how the centre is tracking this month."
              : `Class ${selectedStudent?.class} \u00b7 Roll No. ${selectedStudent?.rollNo} \u00b7 August 2026`}
          </p>
        </div>
      </motion.div>

      {user?.role === 'admin' ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FiUsers} label="Total Students" value={students.length} tone="orange" />
          <StatCard icon={FiCalendar} label="Attendance %" value={summary.pct} suffix="%" tone="green" />
          <StatCard icon={FiDollarSign} label="Fees Collected" value={collectedFees} tone="blue" />
          <StatCard icon={FiClock} label="Pending Fees" value={pendingFees} tone="red" />
          <StatCard icon={FiAward} label="Average Marks" value={avgMarks} suffix="%" tone="orange" />
          <StatCard icon={FiBell} label="Today's Attendance" value={summary.pct} suffix="%" tone="green" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiCalendar} label="Attendance %" value={summary.pct} suffix="%" tone="green" />
          <StatCard icon={FiDollarSign} label="Fee Status" value={pendingFees > 0 ? pendingFees : 0} tone={pendingFees > 0 ? 'red' : 'green'} />
          <StatCard icon={FiAward} label="Average Marks" value={avgMarks} suffix="%" tone="orange" />
          <StatCard icon={FiClock} label="Upcoming Tests" value={2} tone="blue" />
        </div>
      )}

      {students.length > 1 && (
        <div className="flex justify-end">
          <StudentSwitcher />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Monthly Attendance Trend</h3>
          <AttendanceTrendChart data={trendPct} />
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Announcements</h3>
          <div className="space-y-4">
            {announcements.map((a) => (
              <div key={a.id} className="pb-4 border-b border-spark-ink/5 dark:border-white/10 last:border-0 last:pb-0">
                <p className="text-xs text-spark-orange font-bold mb-1">
                  {new Date(a.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                </p>
                <p className="text-sm font-semibold text-spark-ink dark:text-white">{a.title}</p>
                <p className="text-xs text-spark-ink/50 dark:text-white/50 mt-0.5">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {notifications.slice(0, 4).map((n) => (
            <div key={n.id} className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.read ? 'bg-spark-ink/20 dark:bg-white/20' : 'bg-spark-orange'}`} />
              <div>
                <p className="text-sm font-semibold text-spark-ink dark:text-white">{n.title}</p>
                <p className="text-xs text-spark-ink/50 dark:text-white/50">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
