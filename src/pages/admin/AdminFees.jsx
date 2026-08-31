import { useEffect, useState } from 'react'
import { FiDollarSign, FiCheckCircle, FiClock, FiPlusCircle, FiCalendar } from 'react-icons/fi'
import { getStudents, getFeeRecord, updateFeeStatus, getFeeMonths, createFeeMonth } from '../../services/api/sheetsApi.js'
import { formatCurrency } from '../../utils/format.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import { loadCached, saveCache } from '../../utils/pageCache.js'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

function monthKeyToLabel(key) {
  const [y, m] = key.split('-')
  return `${MONTH_NAMES[Number(m) - 1]} ${y}`
}

// The month right after the most recent one that already has a Fees
// tab — this is what "Create Next Month" actually creates, so admin
// never has to type a month manually.
function nextMonthKey(months) {
  if (months.length === 0) return null
  const latest = months[months.length - 1] // already sorted ascending
  const [y, m] = latest.split('-').map(Number)
  const nextM = m === 12 ? 1 : m + 1
  const nextY = m === 12 ? y + 1 : y
  return `${nextY}-${String(nextM).padStart(2, '0')}`
}

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

  const [months, setMonths] = useState([])
  const [selectedMonth, setSelectedMonth] = useState('')
  const [loadingMonths, setLoadingMonths] = useState(true)
  const [creatingMonth, setCreatingMonth] = useState(false)
  const [createError, setCreateError] = useState('')
  const [createSuccess, setCreateSuccess] = useState('')

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

    loadMonths()
  }, [])

  const loadMonths = () => {
    setLoadingMonths(true)
    getFeeMonths().then((list) => {
      setMonths(list)
      setSelectedMonth((prev) => prev || list[list.length - 1] || '')
      setLoadingMonths(false)
    })
  }

  const loadRecord = (studentId, month) => {
    if (!studentId) return
    setLoadingRecord(true)
    setRecordError('')
    setError('')
    setSuccess('')
    getFeeRecord(studentId, month || undefined)
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
    loadRecord(id, selectedMonth)
  }

  const onSelectMonth = (e) => {
    const month = e.target.value
    setSelectedMonth(month)
    if (selectedId) loadRecord(selectedId, month)
  }

  const handleCreateNextMonth = async () => {
    const monthKey = nextMonthKey(months)
    if (!monthKey) return
    setCreateError('')
    setCreateSuccess('')
    setCreatingMonth(true)
    try {
      await createFeeMonth(monthKey)
      setCreateSuccess(`${monthKeyToLabel(monthKey)} is ready \u2014 everyone carried forward as Pending.`)
      loadMonths()
    } catch (err) {
      setCreateError(err.message || 'Could not create the new month. Please try again.')
    } finally {
      setCreatingMonth(false)
    }
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
      const result = await updateFeeStatus({ studentId: selectedId, collected: amount, month: selectedMonth || undefined })
      setSuccess(`Saved — ${selectedStudent?.name} is now marked ${result.status}.`)
      loadRecord(selectedId, selectedMonth)
    } catch (err) {
      setError(err.message || 'Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  if (loadingStudents) return <SkeletonTable rows={4} />

  const nextKey = nextMonthKey(months)

  return (
    <div className="space-y-5">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 border border-spark-ink/5 dark:border-white/10 flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1 flex items-center gap-2">
            <FiCalendar className="text-spark-orange" /> Fee Months
          </h3>
          <p className="text-xs text-spark-ink/50 dark:text-white/50">
            {nextKey ? `Next: ${monthKeyToLabel(nextKey)} hasn't been set up yet.` : 'No fee months found yet.'}
          </p>
        </div>
        {nextKey && (
          <button
            onClick={handleCreateNextMonth}
            disabled={creatingMonth}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-spark-gradient text-white text-sm font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60 shrink-0"
          >
            <FiPlusCircle /> {creatingMonth ? 'Creating...' : `Create ${monthKeyToLabel(nextKey)}`}
          </button>
        )}
      </div>
      {createError && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{createError}</p>}
      {createSuccess && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{createSuccess}</p>}

      <div className="flex flex-wrap gap-4">
        <div className="max-w-sm flex-1 min-w-[200px]">
          <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Month</label>
          {loadingMonths ? (
            <div className="h-11 rounded-xl bg-spark-surface dark:bg-white/5 animate-pulse" />
          ) : (
            <select
              value={selectedMonth}
              onChange={onSelectMonth}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            >
              {months.map((m) => (
                <option key={m} value={m}>{monthKeyToLabel(m)}</option>
              ))}
            </select>
          )}
        </div>
        <div className="max-w-sm flex-1 min-w-[200px]">
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
      </div>

      {!selectedId ? (
        <p className="text-sm text-spark-ink/50 dark:text-white/50">Choose a student above to view and update their fee status for the selected month.</p>
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
