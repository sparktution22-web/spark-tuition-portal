import { useEffect, useMemo, useState } from 'react'
import { FiDownload, FiSearch } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getAttendance, getAdminDashboard } from '../../services/api/sheetsApi.js'
import { summarizeAttendance } from '../../utils/format.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonCards, SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { FiCalendar, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'

const STATUS_STYLES = {
  Present: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10',
  Absent: 'bg-red-50 text-red-500 dark:bg-red-500/10',
  Late: 'bg-amber-50 text-amber-600 dark:bg-amber-500/10'
}

const HEAT_COLOR = {
  Present: 'bg-spark-orange',
  Late: 'bg-spark-accent',
  Absent: 'bg-red-300'
}

// Admin-only — consolidated centre-wide Today / This Week / This Month
// attendance, shown above the per-student view below. Uses the same
// getAdminDashboard() call as the main Dashboard (cached server-side),
// so this doesn't add an extra slow round-trip.
function CentreWideStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <SkeletonCards count={3} />

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
      <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Centre-wide Attendance</h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-2">Today</p>
          <p className="text-sm text-spark-ink dark:text-white">
            <span className="font-bold text-emerald-600">{data?.presentToday ?? 0}</span> present ·{' '}
            <span className="font-bold text-red-500">{data?.absentToday ?? 0}</span> absent ·{' '}
            <span className="font-bold text-spark-orange">{data?.todayAttendancePct ?? 0}%</span>
          </p>
        </div>
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-2">This Week</p>
          <p className="text-sm text-spark-ink dark:text-white">
            <span className="font-bold text-emerald-600">{data?.weekPresent ?? 0}</span> present ·{' '}
            <span className="font-bold text-red-500">{data?.weekAbsent ?? 0}</span> absent ·{' '}
            <span className="font-bold text-spark-orange">{data?.weekAttendancePct ?? 0}%</span>
          </p>
        </div>
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-2">This Month</p>
          <p className="text-sm text-spark-ink dark:text-white">
            <span className="font-bold text-emerald-600">{data?.monthPresent ?? 0}</span> present ·{' '}
            <span className="font-bold text-red-500">{data?.monthAbsent ?? 0}</span> absent ·{' '}
            <span className="font-bold text-spark-orange">{data?.monthAttendancePct ?? 0}%</span>
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Attendance() {
  const { user } = useAuth()
  const { selectedStudentId } = useStudentContext()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  useEffect(() => {
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_attendance_' + selectedStudentId
    const cached = loadCached(cacheKey)
    if (cached) {
      setRecords(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getAttendance(selectedStudentId).then((data) => {
      setRecords(data)
      setLoading(false)
      saveCache(cacheKey, data)
    })
  }, [selectedStudentId])

  const filtered = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = search
        ? r.topic.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase())
        : true
      const matchesStatus = statusFilter === 'All' ? true : r.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [records, search, statusFilter])

  const summary = summarizeAttendance(records)

  const exportCSV = () => {
    const header = ['S.No', 'Date', 'Day', 'Subject', 'Topic', 'Time In', 'Time Out', 'Duration', 'Status', 'Remarks']
    const rows = filtered.map((r) => [r.sNo, r.date, r.day, r.subject, r.topic, r.timeIn, r.timeOut, r.duration, r.status, r.remarks])
    const csv = [header, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'attendance.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {user?.role === 'admin' && <CentreWideStats />}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <StudentSwitcher />
        <button
          onClick={exportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 shadow-card text-sm font-semibold text-spark-ink dark:text-white hover:text-spark-orange transition-colors border border-spark-ink/5 dark:border-white/10"
        >
          <FiDownload /> Export CSV
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiCheckCircle} label="Present" value={summary.present} tone="green" />
        <StatCard icon={FiXCircle} label="Absent" value={summary.absent} tone="red" />
        <StatCard icon={FiClock} label="Late" value={summary.late} tone="orange" />
        <StatCard icon={FiCheckCircle} label="Attendance %" value={summary.pct} suffix="%" tone="orange" />
      </div>

      {/* Heatmap */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Monthly Heatmap</h3>
        <div className="grid grid-cols-7 sm:grid-cols-[repeat(13,minmax(0,1fr))] gap-1.5">
          {records.map((r) => (
            <div
              key={r.sNo}
              title={`${r.date} \u2014 ${r.status}`}
              className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md ${HEAT_COLOR[r.status]} transition-transform hover:scale-110`}
            />
          ))}
        </div>
        <div className="flex items-center gap-4 mt-4 text-xs text-spark-ink/50 dark:text-white/50">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-spark-orange inline-block" /> Present</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-spark-accent inline-block" /> Late</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-300 inline-block" /> Absent</span>
        </div>
      </div>

      {/* Filters + table */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="flex flex-wrap items-center gap-3 p-5 border-b border-spark-ink/5 dark:border-white/10">
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spark-ink/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search topic or subject..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white focus:border-spark-orange outline-none transition-colors text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm font-semibold focus:border-spark-orange outline-none"
          >
            {['All', 'Present', 'Absent', 'Late'].map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FiCalendar} title="No records found" description="Try adjusting your search or filter." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-spark-ink/40 dark:text-white/40 uppercase tracking-wide">
                  <th className="px-5 py-3 font-semibold">Date</th>
                  <th className="px-5 py-3 font-semibold">Subject</th>
                  <th className="px-5 py-3 font-semibold hidden md:table-cell">Topic</th>
                  <th className="px-5 py-3 font-semibold hidden sm:table-cell">Time</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.sNo} className="border-t border-spark-ink/5 dark:border-white/5 hover:bg-spark-peach/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3 font-mono font-mono-nums text-spark-ink dark:text-white">{r.date}</td>
                    <td className="px-5 py-3 text-spark-ink dark:text-white font-medium">{r.subject}</td>
                    <td className="px-5 py-3 text-spark-ink/60 dark:text-white/60 hidden md:table-cell">{r.topic}</td>
                    <td className="px-5 py-3 text-spark-ink/60 dark:text-white/60 hidden sm:table-cell font-mono text-xs">
                      {r.timeIn} &ndash; {r.timeOut}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLES[r.status]}`}>{r.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
