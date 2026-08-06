import { useEffect, useState } from 'react'
import { FiPlus, FiAward } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { getStudents, getMarks, addMarks } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function AdminMarks() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [marks, setMarks] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingMarks, setLoadingMarks] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getStudents().then((list) => {
      setStudents(list)
      setLoadingStudents(false)
    })
  }, [])

  useEffect(() => {
    if (!selectedId) {
      setMarks([])
      return
    }
    setLoadingMarks(true)
    getMarks(selectedId).then((data) => {
      setMarks(data)
      setLoadingMarks(false)
    })
  }, [selectedId])

  const selectedStudent = students.find((s) => s.id === selectedId)

  const submit = async (data) => {
    setError('')
    setSaving(true)
    try {
      await addMarks({
        studentId: selectedId,
        subject: data.subject,
        testName: data.testName,
        score: Number(data.score),
        maxScore: Number(data.maxScore) || 100
      })
      const updated = await getMarks(selectedId)
      setMarks(updated)
      reset({ subject: '', testName: '', score: '', maxScore: '' })
    } catch (err) {
      setError(err.message || 'Could not add marks. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingStudents) return <SkeletonTable rows={4} />

  return (
    <div className="space-y-5">
      <div className="max-w-sm">
        <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Select Student</label>
        <select
          value={selectedId}
          onChange={(e) => setSelectedId(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.rollNo} (Class {s.class})</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <EmptyState icon={FiAward} title="No student selected" description="Choose a student above to view and add their test marks." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">
              Add Result — {selectedStudent?.name}
            </h3>
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Subject</label>
                <input
                  {...register('subject', { required: true })}
                  placeholder="e.g. Hindi"
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">Subject is required</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Test Name (optional)</label>
                <input
                  {...register('testName')}
                  placeholder="e.g. Unit Test 1"
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Score</label>
                  <input
                    type="number"
                    step="any"
                    {...register('score', { required: true })}
                    className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                  />
                  {errors.score && <p className="text-xs text-red-500 mt-1">Score is required</p>}
                </div>
                <div>
                  <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Max Score</label>
                  <input
                    type="number"
                    step="any"
                    defaultValue={100}
                    {...register('maxScore')}
                    className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                  />
                </div>
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
              >
                <FiPlus /> {saving ? 'Adding...' : 'Add Result'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Existing Results</h3>
            {loadingMarks ? (
              <SkeletonTable rows={3} />
            ) : marks.length === 0 ? (
              <p className="text-sm text-spark-ink/50 dark:text-white/50">No test results recorded yet for this student.</p>
            ) : (
              <div className="space-y-3">
                {marks.map((m, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-spark-ink/5 dark:border-white/10 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-spark-ink dark:text-white">{m.subject}{m.testName ? ` — ${m.testName}` : ''}</p>
                      {m.date && <p className="text-xs text-spark-ink/40 dark:text-white/40">{m.date}</p>}
                    </div>
                    <p className="text-sm font-bold text-spark-orange">{m.score}/{m.max}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
