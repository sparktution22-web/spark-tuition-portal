import { useEffect, useState } from 'react'
import { FiHelpCircle, FiSend } from 'react-icons/fi'
import { getPendingDoubts, answerDoubt } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function AdminDoubtBox() {
  const [doubts, setDoubts] = useState([])
  const [loading, setLoading] = useState(true)
  const [answers, setAnswers] = useState({}) // doubtId -> draft answer text
  const [submittingId, setSubmittingId] = useState(null)
  const [error, setError] = useState('')

  const load = () => {
    setLoading(true)
    getPendingDoubts().then((data) => {
      setDoubts(data)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
  }, [])

  const submit = async (doubtId) => {
    const answer = (answers[doubtId] || '').trim()
    if (!answer) {
      setError('Please write an answer before submitting.')
      return
    }
    setError('')
    setSubmittingId(doubtId)
    try {
      await answerDoubt(doubtId, answer)
      setDoubts((prev) => prev.filter((d) => d.doubtId !== doubtId))
    } catch (err) {
      setError(err.message || 'Could not submit the answer. Please try again.')
    } finally {
      setSubmittingId(null)
    }
  }

  if (loading) return <SkeletonTable rows={4} />

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
        <FiHelpCircle className="text-spark-orange" /> Doubt Box — {doubts.length} Pending
      </h2>

      {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}

      {doubts.length === 0 ? (
        <EmptyState message="No pending questions right now — all caught up!" />
      ) : (
        <div className="space-y-4">
          {doubts.map((d) => (
            <div key={d.doubtId} className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
              <div className="flex items-center justify-between gap-3 mb-2">
                <p className="text-sm font-bold text-spark-ink dark:text-white">{d.studentName} <span className="font-normal text-spark-ink/40 dark:text-white/40">· {d.rollNo} · {d.subject}</span></p>
                <span className="text-xs text-spark-ink/40 dark:text-white/40">{d.askedOn}</span>
              </div>
              <p className="text-sm text-spark-ink/70 dark:text-white/70 mb-4">{d.question}</p>
              <textarea
                value={answers[d.doubtId] || ''}
                onChange={(e) => setAnswers((prev) => ({ ...prev, [d.doubtId]: e.target.value }))}
                rows={3}
                placeholder="Type your answer..."
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none mb-3"
              />
              <button
                onClick={() => submit(d.doubtId)}
                disabled={submittingId === d.doubtId}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-spark-gradient text-white text-sm font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
              >
                <FiSend size={14} /> {submittingId === d.doubtId ? 'Sending...' : 'Send Answer'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
