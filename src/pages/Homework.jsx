import { useEffect, useState } from 'react'
import { FiCheckSquare, FiSquare, FiClock, FiBookOpen } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudentContext } from '../contexts/StudentContext.jsx'
import { getHomeworkForStudent, markHomeworkDone } from '../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../utils/pageCache.js'
import StudentSwitcher from '../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function Homework() {
  const { user } = useAuth()
  const { selectedStudentId } = useStudentContext()
  const [homework, setHomework] = useState([])
  const [loading, setLoading] = useState(true)
  const isStudent = user?.role === 'student'

  const load = () => {
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_homework_' + selectedStudentId
    const cached = loadCached(cacheKey)
    if (cached) {
      setHomework(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getHomeworkForStudent(selectedStudentId).then((data) => {
      setHomework(data)
      setLoading(false)
      saveCache(cacheKey, data)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId])

  const toggle = (hw) => {
    if (!isStudent) return // parents are read-only
    const newDone = !hw.completed
    setHomework((prev) => prev.map((h) => (h.homeworkId === hw.homeworkId ? { ...h, completed: newDone } : h)))
    markHomeworkDone(hw.homeworkId, selectedStudentId, newDone).catch(() => {
      // revert on failure
      setHomework((prev) => prev.map((h) => (h.homeworkId === hw.homeworkId ? { ...h, completed: !newDone } : h)))
    })
  }

  if (loading) return <SkeletonTable rows={4} />

  const pending = homework.filter((h) => !h.completed)
  const done = homework.filter((h) => h.completed)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
          <FiBookOpen className="text-spark-orange" /> Homework
        </h2>
        <StudentSwitcher />
      </div>

      {!isStudent && (
        <p className="text-xs text-spark-ink/40 dark:text-white/40 bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2 inline-block">
          You're viewing this read-only — your child marks items done from their own login.
        </p>
      )}

      {homework.length === 0 ? (
        <EmptyState message="No homework posted yet." />
      ) : (
        <div className="space-y-6">
          {pending.length > 0 && (
            <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
              <h3 className="font-display font-bold text-spark-ink dark:text-white p-6 pb-3">Pending ({pending.length})</h3>
              <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
                {pending.map((hw) => (
                  <div key={hw.homeworkId} className="flex items-start gap-3 px-6 py-4">
                    <button onClick={() => toggle(hw)} disabled={!isStudent} className="mt-0.5 shrink-0 disabled:cursor-default">
                      <FiSquare className="text-spark-ink/30 dark:text-white/30" size={20} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-spark-ink dark:text-white">{hw.subject}</p>
                      <p className="text-sm text-spark-ink/70 dark:text-white/70 mt-0.5">{hw.description}</p>
                      <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1.5 flex items-center gap-1">
                        <FiClock size={11} /> Due {hw.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {done.length > 0 && (
            <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden opacity-70">
              <h3 className="font-display font-bold text-spark-ink dark:text-white p-6 pb-3">Completed ({done.length})</h3>
              <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
                {done.map((hw) => (
                  <div key={hw.homeworkId} className="flex items-start gap-3 px-6 py-4">
                    <button onClick={() => toggle(hw)} disabled={!isStudent} className="mt-0.5 shrink-0 disabled:cursor-default">
                      <FiCheckSquare className="text-emerald-500" size={20} />
                    </button>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-spark-ink dark:text-white line-through">{hw.subject}</p>
                      <p className="text-sm text-spark-ink/50 dark:text-white/50 mt-0.5 line-through">{hw.description}</p>
                      <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1.5 flex items-center gap-1">
                        <FiClock size={11} /> Was due {hw.dueDate}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
