import { useEffect, useState } from 'react'
import { FiUserX, FiUserCheck, FiUsers, FiSearch, FiAlertTriangle } from 'react-icons/fi'
import { getStudents, getInactiveStudents, markStudentInactive, markStudentActive } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function AdminLeftStudents() {
  const [activeStudents, setActiveStudents] = useState([])
  const [inactiveStudents, setInactiveStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirming, setConfirming] = useState(null) // student being marked as left
  const [reason, setReason] = useState('')
  const [busyRoll, setBusyRoll] = useState(null)

  const load = () => {
    Promise.all([getStudents(), getInactiveStudents()]).then(([students, inactive]) => {
      setActiveStudents(students)
      setInactiveStudents(inactive)
      setLoading(false)
    })
  }

  useEffect(() => { load() }, [])

  const confirmMarkLeft = async () => {
    if (!confirming) return
    setBusyRoll(confirming.rollNo)
    await markStudentInactive(confirming.rollNo, reason)
    setConfirming(null)
    setReason('')
    setBusyRoll(null)
    load()
  }

  const restore = async (rollNo) => {
    setBusyRoll(rollNo)
    await markStudentActive(rollNo)
    setBusyRoll(null)
    load()
  }

  const filteredActive = activeStudents.filter((s) =>
    search ? (s.name || '').toLowerCase().includes(search.toLowerCase()) || (s.rollNo || '').toLowerCase().includes(search.toLowerCase()) : true
  )

  if (loading) return <SkeletonTable rows={6} />

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
        <FiUsers className="text-spark-orange" /> Manage Students Who've Left
      </h2>
      <p className="text-sm text-spark-ink/50 dark:text-white/50">
        Marking a student as left removes them from dropdowns, new fee months, and forward-looking activity going forward — their attendance, marks, and fee history stay exactly as they are, and this can always be undone.
      </p>

      {/* Active students — mark as left */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-spark-ink/5 dark:border-white/10 flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-display font-bold text-spark-ink dark:text-white">Current Students</h3>
          <div className="relative">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spark-ink/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
        </div>
        {filteredActive.length === 0 ? (
          <EmptyState message="No students found." />
        ) : (
          <div className="max-h-96 overflow-y-auto divide-y divide-spark-ink/5 dark:divide-white/5">
            {filteredActive.map((s) => (
              <div key={s.rollNo} className="flex items-center justify-between gap-3 px-6 py-3">
                <div>
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{s.name}</p>
                  <p className="text-xs text-spark-ink/40 dark:text-white/40">Class {s.class} · {s.rollNo}</p>
                </div>
                <button
                  onClick={() => setConfirming(s)}
                  disabled={busyRoll === s.rollNo}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-red-600 border border-red-200 hover:bg-red-50 dark:border-red-500/30 dark:hover:bg-red-500/10 transition-colors disabled:opacity-50"
                >
                  <FiUserX size={13} /> Mark as Left
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Left students — restore */}
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 border-b border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white">Left Students ({inactiveStudents.length})</h3>
        </div>
        {inactiveStudents.length === 0 ? (
          <EmptyState message="No students are currently marked as left." />
        ) : (
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {inactiveStudents.map((s) => (
              <div key={s.rollNo} className="flex items-center justify-between gap-3 px-6 py-3">
                <div>
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{s.studentName}</p>
                  <p className="text-xs text-spark-ink/40 dark:text-white/40">
                    Class {s.class} · {s.rollNo} · Left {s.markedInactiveOn}{s.reason ? ' \u2014 ' + s.reason : ''}
                  </p>
                </div>
                <button
                  onClick={() => restore(s.rollNo)}
                  disabled={busyRoll === s.rollNo}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold text-emerald-600 border border-emerald-200 hover:bg-emerald-50 dark:border-emerald-500/30 dark:hover:bg-emerald-500/10 transition-colors disabled:opacity-50"
                >
                  <FiUserCheck size={13} /> {busyRoll === s.rollNo ? 'Restoring...' : 'Restore'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Confirmation modal */}
      {confirming && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-spark-dark rounded-xl2 shadow-card-hover max-w-md w-full p-6">
            <div className="flex items-center gap-2 text-amber-600 mb-3">
              <FiAlertTriangle /> <h3 className="font-display font-bold">Mark {confirming.name} as left?</h3>
            </div>
            <p className="text-sm text-spark-ink/60 dark:text-white/60 mb-4">
              They'll stop appearing in dropdowns and new fee months. Their attendance, marks, and fee history stay untouched, and you can restore them anytime from the list below.
            </p>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Reason (optional)</label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Moved to a different city"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none mb-5"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setConfirming(null); setReason('') }}
                className="flex-1 py-2.5 rounded-full border border-spark-ink/10 dark:border-white/10 dark:text-white text-sm font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={confirmMarkLeft}
                disabled={busyRoll === confirming.rollNo}
                className="flex-1 py-2.5 rounded-full bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {busyRoll === confirming.rollNo ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
