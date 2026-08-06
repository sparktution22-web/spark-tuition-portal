import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiSave, FiCalendar } from 'react-icons/fi'
import { getStudents, getAttendance, addAttendanceEntry } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'

function AttendanceForm({ register, handleSubmit, submit, errors, saving }) {
  const [status, setStatus] = useState('present')

  return (
    <form onSubmit={handleSubmit((data) => submit({ ...data, status }))} className="space-y-4">
      <div>
        <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Date</label>
        <input
          type="date"
          {...register('date', { required: true })}
          className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        />
        {errors.date && <p className="text-xs text-red-500 mt-1">Date is required</p>}
      </div>

      <div>
        <span className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Status</span>
        <div className="grid grid-cols-3 gap-2">
          {[
            { key: 'present', label: 'Present' },
            { key: 'absent', label: 'Absent' },
            { key: 'noclass', label: 'No Class' }
          ].map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setStatus(opt.key)}
              className={`py-2.5 rounded-xl border font-semibold text-xs transition-colors ${
                status === opt.key
                  ? 'border-spark-orange bg-spark-orange/10 text-spark-orange'
                  : 'border-spark-ink/10 dark:border-white/10 text-spark-ink/60 dark:text-white/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {status === 'present' && (
        <>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Topic / What was studied</label>
            <input
              {...register('topic', { required: status === 'present' })}
              placeholder="e.g. Letters, Two letter blend"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
            {errors.topic && <p className="text-xs text-red-500 mt-1">Topic is required for a Present day</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Time In</label>
              <input
                type="time"
                {...register('timeIn', { required: status === 'present' })}
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Time Out</label>
              <input
                type="time"
                {...register('timeOut', { required: status === 'present' })}
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              />
            </div>
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
      >
        <FiSave /> {saving ? 'Saving...' : 'Save to Sheet'}
      </button>
    </form>
  )
}

export default function AdminAttendance() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [recent, setRecent] = useState([])
  const [loadingRecent, setLoadingRecent] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  useEffect(() => {
    getStudents().then((list) => {
      setStudents(list)
      setLoadingStudents(false)
    })
  }, [])

  const loadRecent = (studentId) => {
    if (!studentId) return
    setLoadingRecent(true)
    getAttendance(studentId).then((data) => {
      // Most recently recorded (has a topic filled in) days, newest first
      setRecent(data.filter((r) => r.topic).slice(-8).reverse())
      setLoadingRecent(false)
    })
  }

  useEffect(() => {
    loadRecent(selectedId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const selectedStudent = students.find((s) => s.id === selectedId)

  const submit = async (data) => {
    setError('')
    setSuccess('')
    setSaving(true)
    try {
      const [y, m, d] = data.date.split('-')
      const formattedDate = `${d}.${m}.${y}`
      const isAbsent = data.status === 'absent'
      const isNoClass = data.status === 'noclass'

      await addAttendanceEntry({
        studentId: selectedId,
        date: formattedDate,
        topic: isAbsent ? 'ABSENT' : isNoClass ? 'NO CLASS' : data.topic,
        timeIn: isAbsent || isNoClass ? '-' : data.timeIn,
        timeOut: isAbsent || isNoClass ? '-' : data.timeOut
      })
      setSuccess(`Saved for ${selectedStudent?.name} — ${data.date.split('-').reverse().join('.')}`)
      reset({ date: data.date, status: 'present', topic: '', timeIn: '', timeOut: '' })
      loadRecent(selectedId)
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
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
          onChange={(e) => { setSelectedId(e.target.value); setError(''); setSuccess('') }}
          className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.rollNo} (Class {s.class})</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <p className="text-sm text-spark-ink/50 dark:text-white/50">Choose a student above to record their attendance for a day.</p>
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
              <FiCalendar className="text-spark-orange" /> Record Attendance — {selectedStudent?.name}
            </h3>
            <AttendanceForm register={register} handleSubmit={handleSubmit} submit={submit} errors={errors} saving={saving} />
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mt-3">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 mt-3">{success}</p>}
            <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-4">
              This writes directly into the same Google Sheet you already use — editing the
              sheet by hand still works too, and both stay in sync automatically.
            </p>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Recently Recorded</h3>
            {loadingRecent ? (
              <SkeletonTable rows={3} />
            ) : recent.length === 0 ? (
              <p className="text-sm text-spark-ink/50 dark:text-white/50">No attendance recorded for this student yet.</p>
            ) : (
              <div className="space-y-3">
                {recent.map((r, i) => (
                  <div key={i} className="flex items-center justify-between border-b border-spark-ink/5 dark:border-white/10 last:border-0 pb-3 last:pb-0">
                    <div>
                      <p className="text-sm font-semibold text-spark-ink dark:text-white">{r.date} — {r.day}</p>
                      <p className="text-xs text-spark-ink/40 dark:text-white/40">{r.topic}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                      r.status === 'Present' ? 'bg-emerald-50 text-emerald-600' :
                      r.status === 'Absent' ? 'bg-red-50 text-red-500' :
                      'bg-blue-50 text-blue-500'
                    }`}>{r.status}</span>
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
