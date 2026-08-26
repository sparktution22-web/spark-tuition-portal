import { useEffect, useState } from 'react'
import { FiCheckCircle, FiExternalLink, FiCpu } from 'react-icons/fi'
import { getSubmissionsForReview, approveSubmission } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { loadCached, saveCache } from '../../utils/pageCache.js'

function ReviewCard({ submission, onApproved }) {
  const [finalScore, setFinalScore] = useState(submission.aiScore)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const approve = async () => {
    setError('')
    setSaving(true)
    try {
      await approveSubmission({ submissionId: submission.submissionId, finalScore: Number(finalScore) })
      onApproved()
    } catch (err) {
      setError(err.message || 'Could not approve. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="font-display font-bold text-spark-ink dark:text-white">{submission.studentName}</p>
          <p className="text-xs text-spark-ink/40 dark:text-white/40">{submission.rollNo} &middot; {submission.subject} &middot; {submission.testName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <a
            href={`https://drive.google.com/file/d/${submission.answerFileId}/view`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 text-xs font-bold text-spark-orange hover:underline"
          >
            View Original Answer PDF <FiExternalLink size={12} />
          </a>
          {submission.correctedFileId && (
            <a
              href={`https://drive.google.com/file/d/${submission.correctedFileId}/view`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-spark-ink/50 dark:text-white/50 hover:underline"
            >
              View Corrected PDF (what student will see) <FiExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      <div className="bg-spark-surface dark:bg-white/5 rounded-xl p-4 mb-4">
        <p className="text-xs font-bold text-spark-ink/50 dark:text-white/50 mb-1.5 flex items-center gap-1.5">
          <FiCpu size={13} /> AI-Suggested Score: {submission.aiScore}/{submission.maxMarks}
        </p>
        <p className="text-sm text-spark-ink/70 dark:text-white/70 leading-relaxed">{submission.aiFeedback}</p>
      </div>

      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Final Score (out of {submission.maxMarks})</label>
          <input
            type="number"
            value={finalScore}
            onChange={(e) => setFinalScore(e.target.value)}
            max={submission.maxMarks}
            min={0}
            className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
          />
        </div>
        <button
          onClick={approve}
          disabled={saving}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-spark-gradient text-white font-bold text-sm shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
        >
          <FiCheckCircle /> {saving ? 'Approving...' : 'Approve'}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 mt-2">{error}</p>}
    </div>
  )
}

export default function AdminReviewSubmissions() {
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)

  const load = () => {
    const cached = loadCached('spark_cache_admin_review')
    if (cached) {
      setSubmissions(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getSubmissionsForReview().then((list) => {
      setSubmissions(list)
      setLoading(false)
      saveCache('spark_cache_admin_review', list)
    })
  }

  useEffect(() => { load() }, [])

  if (loading) return <SkeletonTable rows={4} />

  return (
    <div className="space-y-5">
      {submissions.length === 0 ? (
        <EmptyState icon={FiCheckCircle} title="Nothing to review" description="AI-graded submissions waiting for your approval will show up here." />
      ) : (
        submissions.map((s) => (
          <ReviewCard key={s.submissionId} submission={s} onApproved={load} />
        ))
      )}
    </div>
  )
}
