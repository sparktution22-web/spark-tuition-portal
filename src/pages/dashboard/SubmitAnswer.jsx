import { useEffect, useState } from 'react'
import { FiUpload, FiFileText, FiSend, FiClock, FiCheckCircle, FiAlertCircle } from 'react-icons/fi'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getTests, submitAnswer, getMySubmissions, fileToBase64 } from '../../services/api/sheetsApi.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const STATUS_STYLE = {
  Approved: { icon: FiCheckCircle, color: 'text-emerald-600 bg-emerald-50' },
  'Pending Review': { icon: FiClock, color: 'text-amber-600 bg-amber-50' },
  'Grading...': { icon: FiClock, color: 'text-spark-ink/50 bg-spark-surface' }
}

export default function SubmitAnswer() {
  const { selectedStudentId, selectedStudent } = useStudentContext()
  const [tests, setTests] = useState([])
  const [submissions, setSubmissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedTestId, setSelectedTestId] = useState('')
  const [file, setFile] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    if (!selectedStudentId) return
    setLoading(true)
    // Only tests for this student's own class — a test with no class set
    // (older data) still shows to everyone, handled server-side.
    Promise.all([getTests(selectedStudent?.class), getMySubmissions(selectedStudentId)]).then(([t, s]) => {
      setTests(t)
      setSubmissions(s)
      setLoading(false)
    })
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudentId])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!selectedTestId || !file) {
      setError('Choose a test and select your answer script PDF.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Your answer script must be a PDF file.')
      return
    }
    setSubmitting(true)
    try {
      const base64 = await fileToBase64(file)
      const result = await submitAnswer({ testId: selectedTestId, studentId: selectedStudentId, answerBase64: base64 })
      if (result.status === 'Grading Failed') {
        setError('Uploaded, but grading failed: ' + (result.error || 'unknown error') + '. Your admin can grade it manually.')
      } else {
        setSuccess('Submitted! Your teacher will review the AI-suggested score before it\u2019s final.')
      }
      setSelectedTestId('')
      setFile(null)
      load()
    } catch (err) {
      setError(err.message || 'Could not submit. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTest = tests.find((t) => t.testId === selectedTestId)

  if (loading) return <SkeletonTable rows={4} />

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <StudentSwitcher />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
            <FiFileText className="text-spark-orange" /> Submit Answer Script
          </h3>
          {tests.length === 0 ? (
            <p className="text-sm text-spark-ink/50 dark:text-white/50">No tests are open for submission yet.</p>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Test</label>
                <select
                  value={selectedTestId}
                  onChange={(e) => setSelectedTestId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                >
                  <option value="">Choose a test...</option>
                  {tests.map((t) => (
                    <option key={t.testId} value={t.testId}>{t.subject} \u2014 {t.testName} (/{t.maxMarks})</option>
                  ))}
                </select>
              </div>
              {selectedTest && (
                <div className="bg-spark-surface dark:bg-white/5 rounded-xl p-4">
                  <p className="text-xs text-spark-ink/60 dark:text-white/60 mb-2">
                    This test is worth {selectedTest.maxMarks} marks. Make sure your answers are numbered
                    clearly to match the question paper.
                  </p>
                  {selectedTest.questionPaperFileId && (
                    <a
                      href={`https://drive.google.com/file/d/${selectedTest.questionPaperFileId}/view`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-spark-orange hover:underline"
                    >
                      <FiFileText size={13} /> View Question Paper
                    </a>
                  )}
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Your Answer Script (PDF)</label>
                <label className="flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed border-spark-ink/20 dark:border-white/20 text-sm text-spark-ink/60 dark:text-white/60 cursor-pointer hover:border-spark-orange transition-colors">
                  <FiUpload />
                  {file ? file.name : 'Choose a PDF file...'}
                  <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
              <button
                type="submit"
                disabled={submitting}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
              >
                <FiSend /> {submitting ? 'Submitting & grading...' : 'Submit'}
              </button>
            </form>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">My Submissions</h3>
          {submissions.length === 0 ? (
            <EmptyState icon={FiAlertCircle} title="No submissions yet" description="Submit an answer script to see its status here." />
          ) : (
            <div className="space-y-3">
              {submissions.map((s) => {
                const style = STATUS_STYLE[s.status] || { icon: FiClock, color: 'text-spark-ink/50 bg-spark-surface' }
                const StatusIcon = style.icon
                return (
                  <div key={s.submissionId} className="border-b border-spark-ink/5 dark:border-white/10 last:border-0 pb-3 last:pb-0">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-spark-ink dark:text-white">{s.testName}</p>
                        <p className="text-xs text-spark-ink/40 dark:text-white/40">{s.subject}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${style.color}`}>
                          <StatusIcon size={11} /> {s.status}
                        </span>
                        {s.status === 'Approved' && s.finalScore != null && (
                          <p className="text-xs font-mono text-spark-ink/60 dark:text-white/60 mt-1">{s.finalScore}/{s.maxMarks}</p>
                        )}
                      </div>
                    </div>
                    {s.feedback && s.status === 'Approved' && (
                      <p className="text-xs text-spark-ink/50 dark:text-white/50 mt-2 leading-relaxed bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2">
                        {s.feedback}
                      </p>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
