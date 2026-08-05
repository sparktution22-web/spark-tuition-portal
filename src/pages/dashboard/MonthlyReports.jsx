import { useEffect, useState } from 'react'
import { FiDownload, FiFileText, FiCalendar } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getAttendance, getMarks } from '../../services/api/sheetsApi.js'
import { summarizeAttendance } from '../../utils/format.js'
import { generateMonthlyReportPDF } from '../../utils/pdfGenerator.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonBlock } from '../../components/Skeleton.jsx'

const AVAILABLE_MONTHS = ['May 2026', 'June 2026', 'July 2026', 'August 2026']

export default function MonthlyReports() {
  const { selectedStudentId, selectedStudent } = useStudentContext()
  const [attendance, setAttendance] = useState([])
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    if (!selectedStudentId) return
    setLoading(true)
    Promise.all([getAttendance(selectedStudentId), getMarks(selectedStudentId)]).then(([att, mk]) => {
      setAttendance(att)
      setMarks(mk)
      setLoading(false)
    })
  }, [selectedStudentId])

  const handleDownload = async (monthLabel) => {
    if (!selectedStudent) return
    setGenerating(true)
    try {
      generateMonthlyReportPDF({ student: selectedStudent, attendance, marks, monthLabel })
    } finally {
      setGenerating(false)
    }
  }

  const summary = summarizeAttendance(attendance)

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
            <p className="text-xs text-spark-ink/40 dark:text-white/40">Academic Year 2026-2027</p>
          </div>
        </div>

        <div className="border-t border-b border-spark-ink/10 dark:border-white/10 py-4 mb-4 flex items-center justify-between">
          <div>
            <p className="font-display font-bold text-spark-ink dark:text-white">{selectedStudent?.name}</p>
            <p className="text-xs text-spark-ink/50 dark:text-white/50">
              Class {selectedStudent?.class} · Roll No. {selectedStudent?.rollNo} · Mon-Sat, 5-7 PM
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-spark-ink/40 dark:text-white/40">Total Classes</p>
            <p className="font-mono font-bold text-spark-ink dark:text-white">{summary.total}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Present', value: summary.present },
            { label: 'Absent', value: summary.absent },
            { label: 'Holiday', value: summary.holiday },
            { label: 'Attendance %', value: `${summary.pct}%` }
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
      </motion.div>

      {/* Month picker */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 p-6">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiCalendar className="text-spark-orange" /> Download by month
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {AVAILABLE_MONTHS.map((m) => (
            <button
              key={m}
              onClick={() => handleDownload(m)}
              disabled={generating}
              className={`flex items-center justify-between gap-2 px-4 py-3.5 rounded-xl border transition-all text-sm font-semibold ${
                m === 'August 2026'
                  ? 'bg-spark-gradient text-white border-transparent shadow-soft hover:shadow-card-hover'
                  : 'border-spark-ink/10 dark:border-white/10 text-spark-ink dark:text-white hover:border-spark-orange hover:text-spark-orange'
              } disabled:opacity-60`}
            >
              <span className="flex items-center gap-2"><FiFileText className={m === 'August 2026' ? 'text-white' : 'text-spark-orange'} /> {m}</span>
              <FiDownload />
            </button>
          ))}
        </div>
        <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-4">
          Note: only August 2026 has live mock data in this demo — other months will generate using the same dataset for preview purposes.
        </p>
      </div>
    </div>
  )
}
