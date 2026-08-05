import { useEffect, useMemo, useState } from 'react'
import { FiPrinter, FiDownload, FiSearch } from 'react-icons/fi'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getAttendance } from '../../services/api/sheetsApi.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { FiFileText } from 'react-icons/fi'

export default function StudentReport() {
  const { selectedStudentId, selectedStudent } = useStudentContext()
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sortAsc, setSortAsc] = useState(true)

  useEffect(() => {
    if (!selectedStudentId) return
    setLoading(true)
    getAttendance(selectedStudentId).then((data) => {
      setRecords(data)
      setLoading(false)
    })
  }, [selectedStudentId])

  const filtered = useMemo(() => {
    let list = records.filter((r) =>
      search ? r.topic.toLowerCase().includes(search.toLowerCase()) || r.subject.toLowerCase().includes(search.toLowerCase()) : true
    )
    list = [...list].sort((a, b) => (sortAsc ? a.sNo - b.sNo : b.sNo - a.sNo))
    return list
  }, [records, search, sortAsc])

  const exportCSV = () => {
    const header = ['S.No', 'Date', 'Day', 'Topic', 'Subject', 'Time In', 'Time Out', 'Duration', 'Status', 'Remarks']
    const rows = filtered.map((r) => [r.sNo, r.date, r.day, r.topic, r.subject, r.timeIn, r.timeOut, r.duration, r.status, r.remarks])
    const csv = [header, ...rows].map((row) => row.map((c) => `"${c}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `student-report-${selectedStudent?.name || 'student'}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <SkeletonTable rows={10} />

  return (
    <div className="space-y-5 print:space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <StudentSwitcher />
        <div className="flex gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 shadow-card text-sm font-semibold text-spark-ink dark:text-white hover:text-spark-orange transition-colors border border-spark-ink/5 dark:border-white/10"
          >
            <FiPrinter /> Print
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-spark-gradient text-white shadow-soft text-sm font-semibold hover:shadow-card-hover transition-all"
          >
            <FiDownload /> Download
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-spark-ink/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display font-bold text-lg text-spark-ink dark:text-white">{selectedStudent?.name}</h2>
            <p className="text-xs text-spark-ink/50 dark:text-white/50">
              Class {selectedStudent?.class} · Roll No. {selectedStudent?.rollNo}
            </p>
          </div>
          <div className="flex items-center gap-3 print:hidden">
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spark-ink/30" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="pl-9 pr-4 py-2 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              />
            </div>
            <button
              onClick={() => setSortAsc((s) => !s)}
              className="text-xs font-semibold px-3 py-2 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:text-white hover:border-spark-orange hover:text-spark-orange transition-colors"
            >
              Sort: {sortAsc ? 'Oldest first' : 'Newest first'}
            </button>
          </div>
        </div>

        {filtered.length === 0 ? (
          <EmptyState icon={FiFileText} title="No records found" description="Try a different search term." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-spark-ink/40 dark:text-white/40 uppercase tracking-wide bg-spark-surface dark:bg-white/5">
                  <th className="px-4 py-3 font-semibold">S.No</th>
                  <th className="px-4 py-3 font-semibold">Date</th>
                  <th className="px-4 py-3 font-semibold">Day</th>
                  <th className="px-4 py-3 font-semibold">Topic</th>
                  <th className="px-4 py-3 font-semibold">Subject</th>
                  <th className="px-4 py-3 font-semibold">Time In</th>
                  <th className="px-4 py-3 font-semibold">Time Out</th>
                  <th className="px-4 py-3 font-semibold">Duration</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Remarks</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.sNo} className="border-t border-spark-ink/5 dark:border-white/5">
                    <td className="px-4 py-2.5 font-mono text-spark-ink/60 dark:text-white/60">{r.sNo}</td>
                    <td className="px-4 py-2.5 font-mono text-spark-ink dark:text-white">{r.date}</td>
                    <td className="px-4 py-2.5 text-spark-ink/70 dark:text-white/70">{r.day}</td>
                    <td className="px-4 py-2.5 text-spark-ink dark:text-white">{r.topic}</td>
                    <td className="px-4 py-2.5 text-spark-ink/70 dark:text-white/70">{r.subject}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-spark-ink/60 dark:text-white/60">{r.timeIn}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-spark-ink/60 dark:text-white/60">{r.timeOut}</td>
                    <td className="px-4 py-2.5 font-mono text-xs text-spark-ink/60 dark:text-white/60">{r.duration}</td>
                    <td className="px-4 py-2.5 font-semibold text-spark-orange">{r.status}</td>
                    <td className="px-4 py-2.5 text-spark-ink/50 dark:text-white/50">{r.remarks || '-'}</td>
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
