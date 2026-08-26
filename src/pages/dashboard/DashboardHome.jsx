import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import {
  FiUsers, FiCalendar, FiDollarSign, FiAward, FiClock, FiBell,
  FiCheckCircle, FiXCircle, FiUser, FiPhone, FiPlus, FiX, FiChevronLeft, FiChevronRight
} from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getDashboardData, getAdminDashboard, getCalendarEvents, addEvent, getAnnouncements, addAnnouncement } from '../../services/api/sheetsApi.js'
import { summarizeAttendance } from '../../utils/format.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart.jsx'
import Calendar from '../../components/Calendar.jsx'
import { SkeletonCards, SkeletonBlock } from '../../components/Skeleton.jsx'

const TODAY = new Date()
const pad = (n) => String(n).padStart(2, '0')

function AddEventForm({ students, onAdded, onClose }) {
  const [type, setType] = useState('Test')
  const [date, setDate] = useState('')
  const [title, setTitle] = useState('')
  const [studentId, setStudentId] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!date) {
      setError('Date is required.')
      return
    }
    if (type === 'Birthday' && !studentId) {
      setError('Please choose a student.')
      return
    }
    if (type !== 'Birthday' && !title.trim()) {
      setError('Title is required.')
      return
    }
    setSaving(true)
    try {
      const [y, m, d] = date.split('-')
      const formattedDate = `${d}.${m}.${y}`
      if (type === 'Birthday') {
        await addEvent({ type: 'Birthday', studentId, date: formattedDate })
      } else {
        await addEvent({ type, date: formattedDate, title: title.trim() })
      }
      setDate('')
      setTitle('')
      setStudentId('')
      onAdded()
    } catch (err) {
      setError(err.message || 'Could not add event.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-4 pt-4 border-t border-spark-ink/10 dark:border-white/10">
      <div className="grid grid-cols-2 gap-3">
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          <option value="Test">Test</option>
          <option value="Important">Important Day</option>
          <option value="Birthday">Student Birthday</option>
        </select>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        />
      </div>
      {type === 'Birthday' ? (
        <select
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.rollNo}</option>
          ))}
        </select>
      ) : (
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={type === 'Test' ? 'e.g. Hindi Unit Test' : 'e.g. Annual Day'}
          className="w-full px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-spark-gradient text-white text-sm font-bold shadow-soft disabled:opacity-60"
        >
          <FiPlus size={14} /> {saving ? 'Adding...' : 'Add Event'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-spark-ink/50 dark:text-white/50 hover:text-spark-ink dark:hover:text-white">
          Cancel
        </button>
      </div>
    </form>
  )
}

function AddAnnouncementForm({ onAdded, onClose }) {
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!title.trim() || !body.trim()) {
      setError('Title and message are both required.')
      return
    }
    setSaving(true)
    try {
      await addAnnouncement({ title: title.trim(), body: body.trim() })
      setTitle('')
      setBody('')
      onAdded()
    } catch (err) {
      setError(err.message || 'Could not add announcement.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 mt-4 pt-4 border-t border-spark-ink/10 dark:border-white/10">
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title, e.g. Annual Day"
        className="w-full px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Message..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none"
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-full bg-spark-gradient text-white text-sm font-bold shadow-soft disabled:opacity-60"
        >
          <FiPlus size={14} /> {saving ? 'Posting...' : 'Post Announcement'}
        </button>
        <button type="button" onClick={onClose} className="px-4 py-2 rounded-full text-sm font-semibold text-spark-ink/50 dark:text-white/50 hover:text-spark-ink dark:hover:text-white">
          Cancel
        </button>
      </div>
    </form>
  )
}

export default function DashboardHome() {
  const { user } = useAuth()
  const { selectedStudentId, selectedStudent, students } = useStudentContext()
  const isStudent = user?.role === 'student'
  const isAdmin = user?.role === 'admin'

  const [info, setInfo] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [fees, setFees] = useState([])
  const [marks, setMarks] = useState([])
  const [notifications, setNotifications] = useState([])
  const [announcements, setAnnouncements] = useState([])

  const [adminData, setAdminData] = useState(null)
  const [calendarEvents, setCalendarEvents] = useState([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarYear, setCalendarYear] = useState(TODAY.getFullYear())
  const [calendarMonth, setCalendarMonth] = useState(TODAY.getMonth() + 1) // 1-12
  const [showAddEvent, setShowAddEvent] = useState(false)
  const [showAddAnnouncement, setShowAddAnnouncement] = useState(false)

  const [loading, setLoading] = useState(true)

  // Announcements are visible to every role, so — like the calendar —
  // they load independently of the admin-vs-parent/student data effect.
  const loadAnnouncements = () => {
    const cached = loadCached('spark_cache_announcements')
    if (cached) setAnnouncements(cached)
    getAnnouncements().then((data) => {
      setAnnouncements(data)
      saveCache('spark_cache_announcements', data)
    })
  }

  useEffect(() => {
    loadAnnouncements()
  }, [])

  // Calendar is visible to every role, so it loads independently of the
  // admin-vs-parent/student data effect below — and refetches whenever
  // the admin navigates to a different month.
  const loadCalendar = () => {
    const cacheKey = `spark_cache_calendar_${calendarYear}-${pad(calendarMonth)}`
    const cached = loadCached(cacheKey)
    if (cached) {
      setCalendarEvents(cached)
      setCalendarLoading(false)
    } else {
      setCalendarLoading(true)
    }
    getCalendarEvents(`${calendarYear}-${pad(calendarMonth)}`).then((events) => {
      setCalendarEvents(events)
      setCalendarLoading(false)
      saveCache(cacheKey, events)
    })
  }

  useEffect(() => {
    loadCalendar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [calendarYear, calendarMonth])

  const changeCalendarMonth = (delta) => {
    let newMonth = calendarMonth + delta
    let newYear = calendarYear
    if (newMonth > 12) { newMonth = 1; newYear += 1 }
    if (newMonth < 1) { newMonth = 12; newYear -= 1 }
    setCalendarMonth(newMonth)
    setCalendarYear(newYear)
  }

  useEffect(() => {
    if (isAdmin) {
      const cacheKey = 'spark_cache_admin_dashboard'
      const cached = loadCached(cacheKey)
      if (cached) {
        setAdminData(cached)
        setLoading(false)
      } else {
        setLoading(true)
      }
      getAdminDashboard().then((dash) => {
        setAdminData(dash)
        setLoading(false)
        saveCache(cacheKey, dash)
      })
      return
    }
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_dashboard_' + selectedStudentId
    const cached = loadCached(cacheKey)
    if (cached) {
      setInfo(cached.info)
      setAttendance(cached.attendance)
      setFees(cached.fees)
      setMarks(cached.marks)
      setNotifications(cached.notifications)
      setAnnouncements(cached.announcements)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getDashboardData(selectedStudentId).then((result) => {
      setInfo(result.info)
      setAttendance(result.attendance)
      setFees(result.fees)
      setMarks(result.marks)
      setNotifications(result.notifications)
      setAnnouncements(result.announcements)
      setLoading(false)
      saveCache(cacheKey, result)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin, selectedStudentId])

  const summary = summarizeAttendance(attendance)
  const pendingFees = fees.reduce((s, f) => s + f.pending, 0)
  const avgMarks = marks.length ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length) : 0
  const presentCount = attendance.filter((r) => r.status === 'Present').length
  const absentCount = attendance.filter((r) => r.status === 'Absent').length
  const consideredCount = presentCount + absentCount
  const attendancePct = consideredCount ? Math.round((presentCount / consideredCount) * 100) : 0
  const trendData = attendance.reduce((acc, r) => {
    const weekLabel = `Wk ${Math.ceil(new Date(r.date).getDate() / 7)}`
    let bucket = acc.find((b) => b.label === weekLabel)
    if (!bucket) {
      bucket = { label: weekLabel, present: 0, total: 0 }
      acc.push(bucket)
    }
    if (r.status === 'Present' || r.status === 'Absent') bucket.total += 1
    if (r.status === 'Present') bucket.present += 1
    return acc
  }, [])
  const trendPct = trendData.map((b) => ({ label: b.label, present: b.total ? Math.round((b.present / b.total) * 100) : 0 }))

  const adminDailyTrend = (adminData?.dailyTrend || []).map((d) => {
    const total = d.present + d.absent
    return {
      label: d.date.split('.')[0],
      present: total ? Math.round((d.present / total) * 100) : 0
    }
  })

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={isAdmin ? 5 : 4} />
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
            {isAdmin ? 'Centre Overview' : 'Your Overview'}
          </p>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-1">
            {isAdmin
              ? `${adminData?.totalStudents ?? 0} students, one live view`
              : `${selectedStudent?.name || '\u2014'} \u00b7 Roll No. ${selectedStudent?.rollNo || '\u2014'}`}
          </h2>
          <p className="text-white/80 text-sm">
            {isAdmin
              ? adminData?.today || ''
              : `Class ${selectedStudent?.class} \u00b7 August 2026`}
          </p>
        </div>
      </motion.div>

      {isStudent && info && (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Profile</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1">Name</p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white">{info.studentName || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1">Roll No.</p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white font-mono">{info.rollNo || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1">Class</p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white">{info.class || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1">Days &amp; Time Slot</p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white">
                {info.days || '\u2014'}{info.slot ? ` \u00b7 ${info.slot}` : ''}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1 flex items-center gap-1">
                <FiUser size={11} /> Parent Name
              </p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white">{info.parentName || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-1 flex items-center gap-1">
                <FiPhone size={11} /> Parent Mobile
              </p>
              <p className="text-sm font-semibold text-spark-ink dark:text-white">{info.parentMobile || '\u2014'}</p>
            </div>
          </div>
        </div>
      )}

      {isAdmin ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiUsers} label="Total Students" value={adminData?.totalStudents ?? 0} tone="orange" />
          <StatCard icon={FiCheckCircle} label="Present Today" value={adminData?.presentToday ?? 0} tone="green" />
          <StatCard icon={FiXCircle} label="Absent Today" value={adminData?.absentToday ?? 0} tone="red" />
          <StatCard icon={FiCalendar} label="Attendance % Today" value={adminData?.todayAttendancePct ?? 0} suffix="%" tone="orange" />
          <StatCard icon={FiDollarSign} label="Fees to be Collected (Month)" value={adminData?.feesPayable ?? 0} tone="blue" />
          <StatCard icon={FiDollarSign} label="Fees Collected (Month)" value={adminData?.feesCollected ?? 0} tone="green" />
          <StatCard icon={FiClock} label="Fees Pending (Month)" value={adminData?.feesPending ?? 0} tone="red" />
        </div>
      ) : isStudent ? (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={FiCheckCircle} label="Present" value={presentCount} tone="green" />
          <StatCard icon={FiXCircle} label="Absent" value={absentCount} tone="red" />
          <StatCard icon={FiCalendar} label="Attendance %" value={attendancePct} suffix="%" tone="orange" />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FiCalendar} label="Attendance %" value={summary.pct} suffix="%" tone="green" />
          <StatCard icon={FiDollarSign} label="Fee Status" value={pendingFees > 0 ? pendingFees : 0} tone={pendingFees > 0 ? 'red' : 'green'} />
          <StatCard icon={FiAward} label="Average Marks" value={avgMarks} suffix="%" tone="orange" />
          <StatCard icon={FiClock} label="Upcoming Tests" value={2} tone="blue" />
        </div>
      )}

      {!isAdmin && students.length > 1 && (
        <div className="flex justify-end">
          <StudentSwitcher />
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">
            {isAdmin ? 'Daily Attendance Trend (this month)' : 'Monthly Attendance Trend'}
          </h3>
          <AttendanceTrendChart data={isAdmin ? adminDailyTrend : trendPct} />
          {isAdmin && (
            <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-3">
              Shows each day's centre-wide attendance % so far this month. A month-over-month
              trend will appear here automatically once more months are added to the system.
            </p>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-bold text-spark-ink dark:text-white">Announcements</h3>
            {isAdmin && !showAddAnnouncement && (
              <button
                onClick={() => setShowAddAnnouncement(true)}
                className="flex items-center gap-1 text-xs font-bold text-spark-orange hover:underline"
              >
                <FiPlus size={13} /> Add
              </button>
            )}
            {isAdmin && showAddAnnouncement && (
              <button onClick={() => setShowAddAnnouncement(false)} className="text-spark-ink/40 dark:text-white/40">
                <FiX size={16} />
              </button>
            )}
          </div>
          <div className="space-y-4">
            {announcements.length === 0 ? (
              <p className="text-sm text-spark-ink/40 dark:text-white/40">No announcements yet.</p>
            ) : (
              announcements.map((a) => (
                <div key={a.id} className="pb-4 border-b border-spark-ink/5 dark:border-white/10 last:border-0 last:pb-0">
                  <p className="text-xs text-spark-orange font-bold mb-1">{a.date}</p>
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{a.title}</p>
                  <p className="text-xs text-spark-ink/50 dark:text-white/50 mt-0.5">{a.body}</p>
                </div>
              ))
            )}
          </div>
          {isAdmin && showAddAnnouncement && (
            <AddAnnouncementForm
              onClose={() => setShowAddAnnouncement(false)}
              onAdded={() => {
                setShowAddAnnouncement(false)
                loadAnnouncements()
              }}
            />
          )}
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10 max-w-md">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <button onClick={() => changeCalendarMonth(-1)} className="p-1 rounded-full hover:bg-spark-peach dark:hover:bg-white/10">
              <FiChevronLeft size={16} className="text-spark-ink dark:text-white" />
            </button>
            <h3 className="font-display font-bold text-spark-ink dark:text-white">Calendar</h3>
            <button onClick={() => changeCalendarMonth(1)} className="p-1 rounded-full hover:bg-spark-peach dark:hover:bg-white/10">
              <FiChevronRight size={16} className="text-spark-ink dark:text-white" />
            </button>
          </div>
          {isAdmin && !showAddEvent && (
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-1 text-xs font-bold text-spark-orange hover:underline"
            >
              <FiPlus size={13} /> Add Event
            </button>
          )}
          {isAdmin && showAddEvent && (
            <button onClick={() => setShowAddEvent(false)} className="text-spark-ink/40 dark:text-white/40">
              <FiX size={16} />
            </button>
          )}
        </div>
        {calendarLoading ? (
          <div className="h-64 rounded-xl bg-spark-peach/30 dark:bg-white/5 animate-pulse mt-3" />
        ) : (
          <Calendar year={calendarYear} month={calendarMonth} events={calendarEvents} />
        )}
        {isAdmin && showAddEvent && (
          <AddEventForm
            students={students}
            onClose={() => setShowAddEvent(false)}
            onAdded={() => {
              setShowAddEvent(false)
              loadCalendar()
            }}
          />
        )}
      </div>

      {!isAdmin && (
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
      )}
    </div>
  )
}
