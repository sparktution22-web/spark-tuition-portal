import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { FiPlus, FiTrash2, FiClock, FiEdit2, FiCheck, FiX } from 'react-icons/fi'
import { getStudents, getTimetable, addTimetableEntry, updateTimetableEntry, deleteTimetableEntry } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function EditSlotRow({ entry, onSaved, onCancel }) {
  const [day, setDay] = useState(entry.day)
  const [time, setTime] = useState(entry.time)
  const [subject, setSubject] = useState(entry.subject)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!time.trim() || !subject.trim()) return
    setSaving(true)
    try {
      await updateTimetableEntry({ id: entry.id, day, time: time.trim(), subject: subject.trim() })
      onSaved()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-spark-peach/40 dark:bg-white/10 rounded-lg px-3 py-2.5 space-y-2">
      <div className="grid grid-cols-2 gap-2">
        <select
          value={day}
          onChange={(e) => setDay(e.target.value)}
          className="px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-xs focus:border-spark-orange outline-none"
        >
          {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>
        <input
          value={time}
          onChange={(e) => setTime(e.target.value)}
          placeholder="Time"
          className="px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-xs focus:border-spark-orange outline-none"
        />
      </div>
      <input
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="w-full px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-xs focus:border-spark-orange outline-none"
      />
      <div className="flex gap-2">
        <button
          onClick={save}
          disabled={saving}
          className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-spark-gradient text-white text-xs font-bold disabled:opacity-60"
        >
          <FiCheck size={13} /> {saving ? 'Saving...' : 'Save'}
        </button>
        <button onClick={onCancel} className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold text-spark-ink/50 dark:text-white/50 hover:text-spark-ink dark:hover:text-white">
          <FiX size={13} /> Cancel
        </button>
      </div>
    </div>
  )
}

export default function AdminTimetable() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [entries, setEntries] = useState([])
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [loadingEntries, setLoadingEntries] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [editingId, setEditingId] = useState(null)

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
    setEditingId(null)
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
                      {byDay[day].map((e) =>
                        editingId === e.id ? (
                          <EditSlotRow
                            key={e.id}
                            entry={e}
                            onCancel={() => setEditingId(null)}
                            onSaved={() => { setEditingId(null); loadEntries() }}
                          />
                        ) : (
                          <div key={e.id} className="flex items-center justify-between bg-spark-surface dark:bg-white/5 rounded-lg px-3 py-2">
                            <div>
                              <p className="text-sm font-semibold text-spark-ink dark:text-white">{e.subject}</p>
                              <p className="text-xs text-spark-ink/50 dark:text-white/50">{e.time}</p>
                            </div>
                            <div className="flex items-center gap-1">
                              <button onClick={() => setEditingId(e.id)} className="text-spark-ink/30 hover:text-spark-orange transition-colors p-1">
                                <FiEdit2 size={14} />
                              </button>
                              <button onClick={() => handleDelete(e.id)} className="text-spark-ink/30 hover:text-red-500 transition-colors p-1">
                                <FiTrash2 size={15} />
                              </button>
                            </div>
                          </div>
                        )
                      )}
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
