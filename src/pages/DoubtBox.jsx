import { useEffect, useState } from 'react'
import { FiHelpCircle, FiSend, FiCheckCircle, FiClock } from 'react-icons/fi'
import { useAuth } from '../contexts/AuthContext.jsx'
import { useStudentContext } from '../contexts/StudentContext.jsx'
import { submitDoubt, getDoubtsForStudent } from '../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../utils/pageCache.js'
import StudentSwitcher from '../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../components/Skeleton.jsx'
import EmptyState from '../components/EmptyState.jsx'

export default function DoubtBox() {
  const { user } = useAuth()
  const { selectedStudentId } = useStudentContext()
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [question, setQuestion] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const isStudent = user?.role === 'student'

  const load = () => {
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_doubts_' + selectedStudentId
    const cached = loadCached(cacheKey)
    if (cached) {
      setDoubts(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getDoubtsForStudent(selectedStudentId).then((data) => {
      setDoubts(data)
      setLoading(false)
      saveCache(cacheKey, data)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!subject.trim() || !question.trim()) {
      setError('Please fill in both the subject and your question.')
      return
    }
    setSubmitting(true)
    try {
      await submitDoubt({ studentId: selectedStudentId, subject: subject.trim(), question: question.trim() })
      setSubject('')
      setQuestion('')
      load()
    } catch (err) {
      setError(err.message || 'Could not submit your question. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <SkeletonTable rows={3} />

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
          <FiHelpCircle className="text-spark-orange" /> Doubt Box
        </h2>
        <StudentSwitcher />
      </div>

      {isStudent && (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Ask a Question</h3>
          <form onSubmit={submit} className="space-y-4">
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Subject, e.g. Maths"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              rows={3}
              placeholder="Type your question here..."
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none"
            />
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
            >
              <FiSend /> {submitting ? 'Sending...' : 'Ask'}
            </button>
          </form>
        </div>
      )}

      {!isStudent && (
        <p className="text-xs text-spark-ink/40 dark:text-white/40 bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2 inline-block">
          You're viewing this read-only — your child asks questions from their own login.
        </p>
      )}

      {doubts.length === 0 ? (
        <EmptyState message="No questions asked yet." />
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {doubts.map((d) => (
              <div key={d.doubtId} className="px-6 py-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{d.subject}</p>
                  {d.status === 'Answered' ? (
                    <span className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full"><FiCheckCircle size={12} /> Answered</span>
                  ) : (
                    <span className="flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full"><FiClock size={12} /> Pending</span>
                  )}
                </div>
                <p className="text-sm text-spark-ink/70 dark:text-white/70 mb-2">{d.question}</p>
                {d.answer && (
                  <p className="text-sm text-spark-ink dark:text-white bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2">
                    <span className="font-semibold text-spark-orange">Answer: </span>{d.answer}
                  </p>
                )}
                <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-2">Asked {d.askedOn}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
