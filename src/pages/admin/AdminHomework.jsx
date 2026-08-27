import { useEffect, useState } from 'react'
import { FiBookOpen, FiCheckSquare, FiUsers, FiEye } from 'react-icons/fi'
import { getStudents, createHomework, getHomeworkForClass, getHomeworkCompletion } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function AdminHomework() {
  const [classOptions, setClassOptions] = useState([])
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [viewClass, setViewClass] = useState('')
  const [homework, setHomework] = useState([])
  const [loadingList, setLoadingList] = useState(false)
  const [expandedId, setExpandedId] = useState(null)
  const [completion, setCompletion] = useState(null)
  const [loadingCompletion, setLoadingCompletion] = useState(false)

  useEffect(() => {
    const cached = loadCached('spark_cache_admin_students')
    if (cached) {
      const distinct = [...new Set(cached.map((s) => s.class).filter(Boolean))]
      setClassOptions(distinct)
    }
    getStudents().then((list) => {
      const distinct = [...new Set(list.map((s) => s.class).filter(Boolean))]
      setClassOptions(distinct)
      saveCache('spark_cache_admin_students', list)
    })
  }, [])

  const loadList = (cls) => {
    if (!cls) {
      setHomework([])
      return
    }
    setLoadingList(true)
    getHomeworkForClass(cls).then((data) => {
      setHomework(data)
      setLoadingList(false)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!className || !subject.trim() || !description.trim() || !dueDate) {
      setError('All fields are required.')
      return
    }
    setSaving(true)
    try {
      const [y, m, d] = dueDate.split('-')
      await createHomework({ className, subject: subject.trim(), description: description.trim(), dueDate: `${d}.${m}.${y}` })
      setSuccess(`Homework posted for Class ${className}.`)
      setSubject('')
      setDescription('')
      if (viewClass === className) loadList(className)
    } catch (err) {
      setError(err.message || 'Could not post homework. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const viewCompletion = (homeworkId) => {
    if (expandedId === homeworkId) {
      setExpandedId(null)
      setCompletion(null)
      return
    }
    setExpandedId(homeworkId)
    setLoadingCompletion(true)
    getHomeworkCompletion(homeworkId).then((data) => {
      setCompletion(data)
      setLoadingCompletion(false)
    })
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiBookOpen className="text-spark-orange" /> Post Homework
        </h3>
        <form onSubmit={submit} className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Class</label>
            <select
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            >
              <option value="">Choose a class...</option>
              {classOptions.map((c) => (
                <option key={c} value={c}>Class {c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Maths"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="e.g. Complete exercise 7.2, questions 1-10"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div className="sm:col-span-2 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
            >
              <FiBookOpen /> {saving ? 'Posting...' : 'Post Homework'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-3">View Homework by Class</h3>
          <select
            value={viewClass}
            onChange={(e) => { setViewClass(e.target.value); loadList(e.target.value) }}
            className="w-full sm:w-64 px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
          >
            <option value="">Choose a class...</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>Class {c}</option>
            ))}
          </select>
        </div>

        {viewClass && (loadingList ? (
          <div className="px-6 pb-6"><SkeletonTable rows={3} /></div>
        ) : homework.length === 0 ? (
          <div className="px-6 pb-6"><EmptyState message="No homework posted for this class yet." /></div>
        ) : (
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {homework.map((hw) => (
              <div key={hw.homeworkId} className="px-6 py-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-spark-ink dark:text-white">{hw.subject}</p>
                    <p className="text-sm text-spark-ink/70 dark:text-white/70 mt-0.5">{hw.description}</p>
                    <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1">Due {hw.dueDate}</p>
                  </div>
                  <button
                    onClick={() => viewCompletion(hw.homeworkId)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-spark-ink/10 dark:border-white/10 text-xs font-semibold text-spark-ink/70 dark:text-white/70 hover:border-spark-orange hover:text-spark-orange transition-colors shrink-0"
                  >
                    <FiEye size={13} /> {expandedId === hw.homeworkId ? 'Hide' : 'Completion'}
                  </button>
                </div>
                {expandedId === hw.homeworkId && (
                  <div className="mt-4 bg-spark-surface dark:bg-white/5 rounded-xl p-4">
                    {loadingCompletion ? (
                      <SkeletonTable rows={2} />
                    ) : (
                      <>
                        <p className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-3 flex items-center gap-1.5">
                          <FiUsers size={12} /> {completion.filter((c) => c.completed).length} of {completion.length} completed
                        </p>
                        <div className="grid sm:grid-cols-2 gap-1.5">
                          {completion.map((c) => (
                            <div key={c.rollNo} className="flex items-center gap-2 text-xs">
                              {c.completed ? <FiCheckSquare className="text-emerald-500 shrink-0" size={14} /> : <span className="w-3.5 h-3.5 rounded border border-spark-ink/20 dark:border-white/20 shrink-0" />}
                              <span className={c.completed ? 'text-spark-ink dark:text-white' : 'text-spark-ink/50 dark:text-white/50'}>{c.studentName}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
