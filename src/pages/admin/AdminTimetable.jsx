import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiTrash2, FiClock } from 'react-icons/fi'
import { getStudents, getTimetable, addTimetableEntry, deleteTimetableEntry } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function AdminTimetable() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [entries, setEntries] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const { register, handleSubmit, reset, formState: { errors } } = useForm({ defaultValues: { day: 'Monday' } })

  useEffect(() => {
    getStudents().then((list) => {
      setStudents(list)
      setLoadingStudents(false)
    })
  }, [])

  const loadEntries = () => {
    if (!selectedId) {
      setEntries([])
      return
    }
    setLoadingEntries(true)
    getTimetable(selectedId).then((data) => {
      setEntries(data)
      setLoadingEntries(false)
    })
  }

  useEffect(() => {
    loadEntries()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId])

  const selectedStudent = students.find((s) => s.id === selectedId)

  const submit = async (data) => {
    setError('')
    setSaving(true)
    try {
      await addTimetableEntry({ studentId: selectedId, day: data.day, time: data.time, subject: data.subject })
      reset({ day: data.day, time: '', subject: '' })
      loadEntries()
    } catch (err) {
      setError(err.message || 'Could not add this slot. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    await deleteTimetableEntry(id)
    loadEntries()
  }

  // Group entries by day for a cleaner display
  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter((e) => e.day.toLowerCase() === day.toLowerCase())
    return acc
  }, {})

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
        <EmptyState icon={FiClock} title="No student selected" description="Choose a student above to build their timetable." />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">
              Add Slot — {selectedStudent?.name}
            </h3>
            <form onSubmit={handleSubmit(submit)} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Day</label>
                <select
                  {...register('day', { required: true })}
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                >
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Time</label>
                <input
                  {...register('time', { required: true })}
                  placeholder="e.g. 5:00 PM - 6:00 PM"
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                />
                {errors.time && <p className="text-xs text-red-500 mt-1">Time is required</p>}
              </div>
              <div>
                <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Subject / Activity</label>
                <input
                  {...register('subject', { required: true })}
                  placeholder="e.g. Hindi"
                  className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
                />
                {errors.subject && <p className="text-xs text-red-500 mt-1">Subject is required</p>}
              </div>
              {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
              <button
                type="submit"
                disabled={saving}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
              >
                <FiPlus /> {saving ? 'Adding...' : 'Add Slot'}
              </button>
            </form>
          </div>

          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
            <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Current Timetable</h3>
            {loadingEntries ? (
              <SkeletonTable rows={3} />
            ) : entries.length === 0 ? (
              <p className="text-sm text-spark-ink/50 dark:text-white/50">No timetable slots added yet for this student.</p>
            ) : (
              <div className="space-y-4 max-h-[420px] overflow-y-auto pr-1">
                {DAYS.filter((d) => byDay[d].length > 0).map((day) => (
                  <div key={day}>
                    <p className="text-xs font-bold text-spark-orange uppercase tracking-wide mb-2">{day}</p>
                    <div className="space-y-2">
                      {byDay[day].map((e) => (
                        <div key={e.id} className="flex items-center justify-between bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2">
                          <div>
                            <p className="text-sm font-semibold text-spark-ink dark:text-white">{e.subject}</p>
                            <p className="text-xs text-spark-ink/50 dark:text-white/50">{e.time}</p>
                          </div>
                          <button onClick={() => handleDelete(e.id)} className="text-spark-ink/30 hover:text-red-500 transition-colors p-1">
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      ))}
                    </div>
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
