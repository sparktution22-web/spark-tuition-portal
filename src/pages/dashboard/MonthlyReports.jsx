import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiCalendar, FiSend, FiExternalLink } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getDashboardData, getMonthlyPerformanceSummary, getAvailableReportMonths, shareMonthlyReport } from '../../services/api/sheetsApi.js'
import { generateMonthlyReportPDF } from '../../utils/pdfGenerator.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonBlock } from '../../components/Skeleton.jsx'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Direct links to the original spreadsheet files for months that predate
// the app's own record-keeping — before August 2026, attendance lived
// in separate per-month Google Sheets rather than anything the app
// itself generates a PDF from. Listed newest-first.
const HISTORICAL_SHEETS = [
  { label: 'July 2026', url: 'https://docs.google.com/spreadsheets/d/1roKZArFxGnJH7kXUW4-QFGZP2foyLJ81/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'June 2026', url: 'https://docs.google.com/spreadsheets/d/1CUnuMg2e00PUozuxyuGFacLG1MXcVIaW/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'May 2026', url: 'https://docs.google.com/spreadsheets/d/1o69O2UH34v19fJWxUQzK4_fjLVFCEeeH/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'April 2026', url: 'https://docs.google.com/spreadsheets/d/1ssJqqjD0Lh4Vk9qqfju85liGS6B6WHR0/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'March 2026', url: 'https://docs.google.com/spreadsheets/d/1uBoC89QDIX1kBEwVQV1ItfESueGQToy8/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'February 2026', url: 'https://docs.google.com/spreadsheets/d/1NsQC8_b4wH9Youhqx-oaf3aCmunq0cx0/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
  { label: 'January 2026', url: 'https://docs.google.com/spreadsheets/d/1yZcL0tGz10BYKYokQlCFSsOPxAt-3jR9/edit?usp=sharing&ouid=110475522126419078967&rtpof=true&sd=true' },
]

// Same phone-number formatting already used for fee reminders — turns
// a stored parent number into the digits-only, country-code-prefixed
// format wa.me needs. Assumes India (+91).
function toWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return '91' + digits
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1)
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

// Builds display labels from real 'YYYY-MM' keys returned by the
// backend (getAvailableReportMonths) — this list reflects exactly which
// months genuinely have data for this student, never a future month
// that's still empty, and never missing a month the admin has gotten
// ahead on (e.g. entering September before September actually starts).
function keysToMonthOptions(keys) {
  return keys
    .slice()
    .sort()
    .map((key) => {
      const [y, m] = key.split('-')
      return { label: `${MONTH_NAMES[Number(m) - 1]} ${y}`, key }
    })
}

const _now = new Date()
const CURRENT_MONTH_KEY = `${_now.getFullYear()}-${String(_now.getMonth() + 1).padStart(2, '0')}`

export default function MonthlyReports() {
  const { user } = useAuth()
  const { selectedStudentId, selectedStudent } = useStudentContext()
  const [availableMonths, setAvailableMonths] = useState([])
  const [selectedMonthKey, setSelectedMonthKey] = useState(CURRENT_MONTH_KEY)
  const [info, setInfo] = useState(null)
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [monthError, setMonthError] = useState('')

  useEffect(() => {
    if (!selectedStudentId) return
    getAvailableReportMonths(selectedStudentId).then((keys) => {
      const options = keysToMonthOptions(keys)
      setAvailableMonths(options)
      // If the currently-selected month isn't actually available for
      // this student (e.g. switched to a student with less history),
      // fall back to the most recent one that is.
      if (options.length && !options.some((o) => o.key === selectedMonthKey)) {
        const fallback = options[options.length - 1].key
        setSelectedMonthKey(fallback)
        loadMonth(fallback)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId])

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

  const [sendingMonth, setSendingMonth] = useState('')

  const handleSendToParent = async (monthLabel, monthKey) => {
    if (!selectedStudent) return
    setSendingMonth(monthKey)
    setMonthError('')
    try {
      // Same "make sure data is fresh" logic as handleDownload.
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
      }
      let performanceSummary = { summary: '', improvementPoints: [] }
      try {
        performanceSummary = await getMonthlyPerformanceSummary(selectedStudentId, monthKey)
      } catch {
        // fine without it, same as handleDownload
      }

      // skipSave: true — this is for sending, not for a local download.
      const doc = generateMonthlyReportPDF({
        student: { ...selectedStudent, ...reportInfo },
        attendance: reportAttendance,
        marks: reportMarks,
        monthLabel,
        performanceSummary,
        skipSave: true
      })
      const pdfBase64 = doc.output('datauristring').split(',')[1]

      const result = await shareMonthlyReport(selectedStudentId, monthLabel, pdfBase64)
      const number = toWhatsAppNumber(result.parentMobile)
      if (!number) {
        setMonthError('Report was saved and the family was notified in-app, but no parent phone number is on file to send a WhatsApp message.')
        return
      }
      const greeting = result.parentName ? `Dear ${result.parentName} (Parent of ${result.studentName})` : `Dear Parent of ${result.studentName}`
      const message = `${greeting}, here is ${result.studentName}'s Monthly Report for ${monthLabel} from SPARK Tuition Centre: ${result.viewUrl}`
      window.open(`https://wa.me/${number}?text=${encodeURIComponent(message)}`, '_blank')
    } catch (err) {
      setMonthError(err.message || 'Could not send the report. Please try again.')
    } finally {
      setSendingMonth('')
    }
  }

  // Present/Absent counts + a real percentage. "No Class" days are
  // excluded entirely, same as an unrecorded future day — never shown
  // as a separate "Holiday" category (see Attendance.jsx/pdfGenerator.js
  // for the same fix). totalClasses always uses the real computed total
  // rather than a separately-entered planned figure, which could easily
  // disagree with it and cause exactly the kind of "numbers don't
  // reconcile" confusion this page should never produce.
  const presentCount = attendance.filter((r) => r.status === 'Present').length
  const absentCount = attendance.filter((r) => r.status === 'Absent').length
  const consideredCount = presentCount + absentCount
  const attendancePct = consideredCount ? Math.round((presentCount / consideredCount) * 100) : 0
  const totalClasses = consideredCount

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

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { label: 'Present', value: presentCount },
                { label: 'Absent', value: absentCount },
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {availableMonths.map((m) => (
            <div
              key={m.key}
              className={`rounded-xl border p-3.5 ${
                m.key === selectedMonthKey
                  ? 'border-spark-orange bg-spark-surface dark:bg-white/5'
                  : 'border-spark-ink/10 dark:border-white/10'
              }`}
            >
              <p className="flex items-center gap-2 text-sm font-semibold text-spark-ink dark:text-white mb-2.5">
                <FiFileText className="text-spark-orange shrink-0" /> {m.label}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handleDownload(m.label, m.key)}
                  disabled={generating || sendingMonth === m.key}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-spark-gradient text-white text-xs font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
                >
                  <FiDownload size={13} /> Download
                </button>
                <button
                  onClick={() => handleSendToParent(m.label, m.key)}
                  disabled={generating || sendingMonth === m.key}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-emerald-500 text-white text-xs font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
                >
                  <FiSend size={13} /> {sendingMonth === m.key ? 'Sending...' : 'Send to Parent'}
                </button>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-4">
          "Send to Parent" saves the report, notifies the family in-app, and opens WhatsApp with a link to it \u2014 only sends after you tap Send in WhatsApp yourself.
        </p>
        <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1">
          Only months with real recorded data are shown here.
        </p>
      </div>

      {user?.role === 'admin' && (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1">Older Records</h3>
          <p className="text-xs text-spark-ink/50 dark:text-white/50 mb-4">
            January&ndash;July 2026 lived in separate spreadsheets before the app's continuous attendance sheet started \u2014 open any month's original file directly.
          </p>
          <div className="grid sm:grid-cols-2 gap-2.5">
            {HISTORICAL_SHEETS.map((sheet) => (
              <a
                key={sheet.label}
                href={sheet.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-2 px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 text-sm font-semibold text-spark-ink dark:text-white hover:border-spark-orange hover:text-spark-orange transition-colors"
              >
                {sheet.label}
                <FiExternalLink size={14} className="shrink-0" />
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
