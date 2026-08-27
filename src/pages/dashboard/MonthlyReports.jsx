import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getDashboardData, getMonthlyPerformanceSummary } from '../../services/api/sheetsApi.js'
import { generateMonthlyReportPDF } from '../../utils/pdfGenerator.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonBlock } from '../../components/Skeleton.jsx'

// Months from April 2026 (earliest month with real data) through a
// few months past today, generated automatically — no manual updates
// needed here as new months arrive. Deliberately extends PAST today's
// real calendar date (not just up to it) — admin sometimes enters a
// month's attendance ahead of schedule (e.g. filling in September
// before September actually arrives), and this dropdown needs to offer
// that month as soon as it exists, not wait for the calendar to catch
// up. Selecting a month with no data yet just shows a friendly empty
// state below — no harm in listing a few months further than strictly
// necessary.
const EARLIEST_MONTH = { year: 2026, month: 4 } // April 2026
const MONTHS_AHEAD_BUFFER = 3
const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function generateMonthsList() {
  const now = new Date()
  let endYear = now.getFullYear()
  let endMonth = now.getMonth() + 1 + MONTHS_AHEAD_BUFFER
  while (endMonth > 12) { endMonth -= 12; endYear += 1 }

  const months = []
  let y = EARLIEST_MONTH.year
  let m = EARLIEST_MONTH.month
  while (y < endYear || (y === endYear && m <= endMonth)) {
    months.push({ label: `${MONTH_NAMES[m - 1]} ${y}`, key: `${y}-${String(m).padStart(2, '0')}` })
    m++
    if (m > 12) { m = 1; y++ }
  }
  return months
}

const MONTHS = generateMonthsList()
const _now = new Date()
const CURRENT_MONTH_KEY = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}`

export default function MonthlyReports() {
  const { selectedStudentId, selectedStudent } = useStudentContext()
  const [selectedMonthKey, setSelectedMonthKey] = useState(CURRENT_MONTH_KEY)
  const [info, setInfo] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [monthError, setMonthError] = useState('')

  const loadMonth = (monthKey) => {
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_report_' + selectedStudentId + '_' + monthKey
    const cached = loadCached(cacheKey)
    if (cached) {
      setInfo(cached.info)
      setAttendance(cached.attendance)
      setMarks(cached.marks)
      setMonthError('')
      setLoading(false)
    } else {
      setLoading(true)
    }
    setMonthError('')
    return getDashboardData(selectedStudentId, monthKey)
      .then(({ info, attendance, marks }) => {
        setInfo(info)
        setAttendance(attendance)
        setMarks(marks)
        saveCache(cacheKey, { info, attendance, marks })
      })
      .catch((err) => {
        setInfo(null)
        setAttendance([])
        setMarks([])
        setMonthError(err.message || 'No data available for this month yet.')
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadMonth(selectedMonthKey)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId])

  const handleSelectMonth = async (monthKey) => {
    setSelectedMonthKey(monthKey)
    await loadMonth(monthKey)
  }

  const handleDownload = async (monthLabel, monthKey) => {
    if (!selectedStudent) return
    setGenerating(true)
    try {
      // make sure we have THIS month's data before generating — in case
      // the download button is clicked without first selecting the month
      let reportInfo = info
      let reportAttendance = attendance
      let reportMarks = marks
      if (monthKey !== selectedMonthKey || monthError) {
        const fresh = await getDashboardData(selectedStudentId, monthKey)
        reportInfo = fresh.info
        reportAttendance = fresh.attendance
        reportMarks = fresh.marks
        setSelectedMonthKey(monthKey)
        setInfo(fresh.info)
        setAttendance(fresh.attendance)
        setMarks(fresh.marks)
        setMonthError('')
      }
      // Overall monthly summary + improvement points — generated fresh
      // (or from a short-lived cache) each time, based on whatever this
      // month's actual tests were.
      let performanceSummary = { summary: '', improvementPoints: [] }
      try {
        performanceSummary = await getMonthlyPerformanceSummary(selectedStudentId, monthKey)
      } catch {
        // If this fails for any reason, the report still generates —
        // just without the summary section, rather than blocking the
        // whole download over it.
      }
      generateMonthlyReportPDF({
        student: { ...selectedStudent, ...reportInfo },
        attendance: reportAttendance,
        marks: reportMarks,
        monthLabel,
        performanceSummary
      })
    } catch (err) {
      setMonthError(err.message || 'No data available for this month yet.')
    } finally {
      setGenerating(false)
    }
  }

  // Present/Absent counts + a real percentage, same logic as the
  // Dashboard — Holiday days and not-yet-happened days are excluded.
  const presentCount = attendance.filter((r) => r.status === 'Present').length
  const absentCount = attendance.filter((r) => r.status === 'Absent').length
  const holidayCount = attendance.filter((r) => r.status === 'Holiday').length
  const consideredCount = presentCount + absentCount
  const attendancePct = consideredCount ? Math.round((presentCount / consideredCount) * 100) : 0
  const totalClasses = info?.totalClasses || (presentCount + absentCount + holidayCount)

  if (loading) return <SkeletonBlock className="h-80" />

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <StudentSwitcher />
      </div>

      {/* Live preview card, matches PDF layout */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-white/5 rounded-xl3 shadow-card border border-spark-ink/5 dark:border-white/10 p-8 max-w-2xl mx-auto"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="font-display font-extrabold text-spark-orange text-xl">SPARK</p>
            <p className="text-xs text-spark-ink/40 dark:text-white/40">Educate • Empower • Enrich</p>
          </div>
          <div className="text-right">
            <p className="font-semibold text-sm text-spark-ink dark:text-white">Monthly Student Report</p>
            <p className="text-xs text-spark-ink/40 dark:text-white/40">
              Academic Year {info?.academicYear || '\u2014'}
            </p>
          </div>
        </div>

        {monthError ? (
          <div className="py-10 text-center">
            <p className="text-sm font-semibold text-spark-ink dark:text-white mb-1">No data for this month yet</p>
            <p className="text-xs text-spark-ink/40 dark:text-white/40">{monthError}</p>
          </div>
        ) : (
          <>
            <div className="border-t border-b border-spark-ink/10 dark:border-white/10 py-4 mb-4 flex items-center justify-between">
              <div>
                <p className="font-display font-bold text-spark-ink dark:text-white">{info?.studentName || selectedStudent?.name}</p>
                <p className="text-xs text-spark-ink/50 dark:text-white/50">
                  Class {info?.class || selectedStudent?.class} · Roll No. {info?.rollNo || selectedStudent?.rollNo}
                  {info?.days || info?.slot ? ` · ${info?.days || ''} ${info?.slot ? `\u00b7 ${info.slot}` : ''}` : ''}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-spark-ink/40 dark:text-white/40">Total Classes</p>
                <p className="font-mono font-bold text-spark-ink dark:text-white">{totalClasses}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                { label: 'Present', value: presentCount },
                { label: 'Absent', value: absentCount },
                { label: 'Holiday', value: holidayCount },
                { label: 'Attendance %', value: `${attendancePct}%` }
              ].map((s) => (
                <div key={s.label} className="bg-spark-peach/50 dark:bg-white/5 rounded-xl p-3 text-center">
                  <p className="font-mono font-bold text-spark-orange">{s.value}</p>
                  <p className="text-[10px] text-spark-ink/50 dark:text-white/50 font-semibold mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            <p className="text-xs text-spark-ink/40 dark:text-white/40 text-center">
              Full attendance table, subject marks, teacher remarks, QR code and signature lines are included in the downloaded PDF.
            </p>
          </>
        )}
      </motion.div>

      {/* Month picker */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-spark-orange" /> Download by month
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {MONTHS.map((m) => (
            <button
              key={m.key}
              onClick={() => handleDownload(m.label, m.key)}
              disabled={generating}
              className={`flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border transition-all text-sm font-semibold ${
                m.key === selectedMonthKey
                  ? 'bg-spark-gradient text-white border-transparent shadow-soft hover:shadow-card-hover'
                  : 'border-spark-ink/10 dark:border-white/10 text-spark-ink dark:text-white hover:border-spark-orange hover:text-spark-orange'
              } disabled:opacity-60`}
            >
              <span className="flex items-center gap-2">
                <FiFileText className={m.key === selectedMonthKey ? 'text-white' : 'text-spark-orange'} /> {m.label}
              </span>
              <FiDownload />
            </button>
          ))}
        </div>
        <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-4">
          Each month uses its own real attendance data — a month shows "No data available" until its sheet has been added.
        </p>
      </div>
    </div>
  )
}
