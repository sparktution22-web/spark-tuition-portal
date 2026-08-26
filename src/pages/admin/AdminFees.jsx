import { useEffect, useState } from 'react'
import { FiDollarSign, FiCheckCircle, FiClock } from 'react-icons/fi'
import { getStudents, getFeeRecord, updateFeeStatus } from '../../services/api/sheetsApi.js'
import { formatCurrency } from '../../utils/format.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import { loadCached, saveCache } from '../../utils/pageCache.js'

export default function AdminFees() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [loadingStudents, setLoadingStudents] = useState(true)
  const [record, setRecord] = useState(null)
  const [loadingRecord, setLoadingRecord] = useState(false)
  const [collected, setCollected] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [recordError, setRecordError] = useState('')

  useEffect(() => {
    const cached = loadCached('spark_cache_admin_students')
    if (cached) {
      setStudents(cached)
      setLoadingStudents(false)
    }
    getStudents().then((list) => {
      setStudents(list)
      setLoadingStudents(false)
      saveCache('spark_cache_admin_students', list)
    })
  }, [])

  const loadRecord = (studentId) => {
    if (!studentId) return
    setLoadingRecord(true)
    setRecordError('')
    setError('')
    setSuccess('')
    getFeeRecord(studentId)
      .then((data) => {
        setRecord(data)
        setCollected(String(data.collected))
      })
      .catch((err) => {
        setRecord(null)
        setRecordError(err.message || 'No fee record found for this student this month.')
      })
      .finally(() => setLoadingRecord(false))
  }

  const onSelectStudent = (e) => {
    const id = e.target.value
    setSelectedId(id)
    loadRecord(id)
  }

  const selectedStudent = students.find((s) => s.id === selectedId)

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    const amount = Number(collected)
    if (isNaN(amount) || amount < 0) {
      setError('Enter a valid collected amount.')
      return
    }
    setSaving(true)
    try {
      const result = await updateFeeStatus({ studentId: selectedId, collected: amount })
      setSuccess(`Saved — ${selectedStudent?.name} is now marked ${result.status}.`)
      loadRecord(selectedId)
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
          onChange={onSelectStudent}
          className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
        >
          <option value="">Choose a student...</option>
          {students.map((s) => (
            <option key={s.id} value={s.id}>{s.name} — {s.rollNo} (Class {s.class})</option>
          ))}
        </select>
      </div>

      {!selectedId ? (
        <p className="text-sm text-spark-ink/50 dark:text-white/50">Choose a student above to view and update their fee status for this month.</p>
      ) : loadingRecord ? (
        <SkeletonTable rows={3} />
      ) : recordError ? (
        <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 max-w-md">{recordError}</p>
      ) : record ? (
        <div className="max-w-md bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1 flex items-center gap-2">
            <FiDollarSign className="text-spark-orange" /> {selectedStudent?.name}
          </h3>
          <p className="text-xs text-spark-ink/40 dark:text-white/40 mb-5">{record.month}</p>

          <div className="grid grid-cols-3 gap-3 mb-5">
            <div className="bg-spark-surface dark:bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-spark-ink/40 dark:text-white/40 uppercase mb-1">Total</p>
              <p className="font-bold text-spark-ink dark:text-white">{formatCurrency(record.total)}</p>
            </div>
            <div className="bg-spark-surface dark:bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-spark-ink/40 dark:text-white/40 uppercase mb-1">Collected</p>
              <p className="font-bold text-emerald-600">{formatCurrency(record.collected)}</p>
            </div>
            <div className="bg-spark-surface dark:bg-white/5 rounded-xl p-3 text-center">
              <p className="text-[10px] font-semibold text-spark-ink/40 dark:text-white/40 uppercase mb-1">Pending</p>
              <p className={`font-bold ${record.pending > 0 ? 'text-red-500' : 'text-emerald-600'}`}>{formatCurrency(record.pending)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 mb-5">
            <span className={`text-xs font-bold px-2.5 py-1 rounded-full inline-flex items-center gap-1 ${
              record.status === 'Paid' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
            }`}>
              {record.status === 'Paid' ? <FiCheckCircle size={12} /> : <FiClock size={12} />} {record.status}
            </span>
            {record.paidOn && <span className="text-xs text-spark-ink/40 dark:text-white/40">Paid on {record.paidOn}</span>}
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Update Collected Amount</label>
              <input
                type="number"
                min="0"
                value={collected}
                onChange={(e) => setCollected(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              />
              <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1.5">
                Status updates automatically — Paid once the collected amount reaches the total.
              </p>
            </div>
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
