import { useState, useEffect } from 'react'
import { FiUpload, FiCamera, FiCheck, FiX, FiSave, FiAlertTriangle } from 'react-icons/fi'
import { getStudents, extractAttendanceFromImage, addAttendanceEntry, fileToBase64 } from '../../services/api/sheetsApi.js'

const MAX_SIZE_MB = 4

export default function AdminScanAttendance() {
  const [students, setStudents] = useState([])
  const [file, setFile] = useState(null)
  const [scanning, setScanning] = useState(false)
  const [rows, setRows] = useState([]) // extracted, editable rows
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveResults, setSaveResults] = useState(null) // { savedCount, failed: [] }

  useEffect(() => {
    getStudents().then(setStudents)
  }, [])

  const scan = async () => {
    setError('')
    setSaveResults(null)
    if (!file) {
      setError('Choose a photo of the attendance page first.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`This photo is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please keep it under ${MAX_SIZE_MB}MB.`)
      return
    }
    setScanning(true)
    try {
      const base64 = await fileToBase64(file)
      const extracted = await extractAttendanceFromImage(base64, file.type)
      setRows(extracted.map((r, i) => ({
        ...r,
        _key: i,
        _include: true,
        _matched: !!r.rollNo
      })))
    } catch (err) {
      setError(err.message || 'Could not read this image. Please try again.')
    } finally {
      setScanning(false)
    }
  }

  const updateRow = (key, field, value) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, [field]: value, _matched: field === 'rollNo' ? !!value : r._matched } : r)))
  }

  const toggleInclude = (key) => {
    setRows((prev) => prev.map((r) => (r._key === key ? { ...r, _include: !r._include } : r)))
  }

  const saveAll = async () => {
    setError('')
    const toSave = rows.filter((r) => r._include)
    if (toSave.length === 0) {
      setError('No rows selected to save.')
      return
    }
    const missingMatch = toSave.find((r) => !r.rollNo)
    if (missingMatch) {
      setError(`"${missingMatch.handwrittenName}" still needs a student selected before saving — fix it or uncheck that row.`)
      return
    }

    setSaving(true)
    const [y, m, d] = date.split('-')
    const formattedDate = `${d}.${m}.${y}`
    const failed = []
    let savedCount = 0

    for (const row of toSave) {
      try {
        await addAttendanceEntry({
          studentId: row.rollNo,
          date: formattedDate,
          topic: row.topic,
          timeIn: row.timeIn,
          timeOut: row.timeOut
        })
        savedCount++
      } catch (err) {
        failed.push({ name: row.studentName || row.handwrittenName, error: err.message })
      }
    }

    setSaveResults({ savedCount, failed })
    setSaving(false)
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiCamera className="text-spark-orange" /> Scan Handwritten Attendance
        </h3>
        <p className="text-sm text-spark-ink/50 dark:text-white/50 mb-4">
          Upload one photo of the day's attendance page — one line per student, e.g.
          "Pavishi - 2:00 - 3:08 - CI blend". Everything gets read at once and matched to your roster.
        </p>

        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Photo</label>
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
              file && file.size > MAX_SIZE_MB * 1024 * 1024
                ? 'border-red-400 text-red-500'
                : 'border-spark-ink/20 dark:border-white/20 text-spark-ink/60 dark:text-white/60 hover:border-spark-orange'
            }`}>
              <FiUpload />
              {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)` : 'Choose a photo...'}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
          </div>
        </div>
        <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 inline-block mb-4">
          Only images under {MAX_SIZE_MB}MB are accepted
        </p>

        {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 mb-4">{error}</p>}

        <button
          onClick={scan}
          disabled={scanning}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
        >
          <FiCamera /> {scanning ? 'Reading photo... (can take a bit)' : 'Scan Photo'}
        </button>
      </div>

      {rows.length > 0 && (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1">Review Before Saving</h3>
          <p className="text-sm text-spark-ink/50 dark:text-white/50 mb-5">
            Check each row carefully — fix any student that wasn't matched, correct any misread times, then save.
          </p>

          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row._key}
                className={`grid sm:grid-cols-[auto,1.3fr,1fr,1fr,1.5fr] gap-3 items-center p-3 rounded-xl border ${
                  !row._matched ? 'border-amber-300 bg-amber-50/50 dark:bg-amber-500/5' : 'border-spark-ink/5 dark:border-white/10'
                }`}
              >
                <button onClick={() => toggleInclude(row._key)} className="shrink-0">
                  {row._include ? (
                    <FiCheck className="text-emerald-600 bg-emerald-50 rounded-full p-1" size={22} />
                  ) : (
                    <FiX className="text-spark-ink/30 bg-spark-surface rounded-full p-1" size={22} />
                  )}
                </button>

                <div>
                  <select
                    value={row.rollNo}
                    onChange={(e) => {
                      const student = students.find((s) => s.id === e.target.value)
                      updateRow(row._key, 'rollNo', e.target.value)
                      updateRow(row._key, 'studentName', student?.name || '')
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg border text-sm dark:bg-transparent dark:text-white outline-none ${
                      !row._matched ? 'border-amber-400' : 'border-spark-ink/10 dark:border-white/10'
                    }`}
                  >
                    <option value="">Choose student...</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} — {s.rollNo}</option>
                    ))}
                  </select>
                  {!row._matched && (
                    <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                      <FiAlertTriangle size={11} /> Wrote "{row.handwrittenName}" — pick the right student
                    </p>
                  )}
                </div>

                <input
                  value={row.timeIn}
                  onChange={(e) => updateRow(row._key, 'timeIn', e.target.value)}
                  placeholder="Time In"
                  className="px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm outline-none"
                />
                <input
                  value={row.timeOut}
                  onChange={(e) => updateRow(row._key, 'timeOut', e.target.value)}
                  placeholder="Time Out"
                  className="px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm outline-none"
                />
                <input
                  value={row.topic}
                  onChange={(e) => updateRow(row._key, 'topic', e.target.value)}
                  placeholder="Topic"
                  className="px-2.5 py-1.5 rounded-lg border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm outline-none"
                />
              </div>
            ))}
          </div>

          {saveResults && (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">
                Saved {saveResults.savedCount} of {rows.filter((r) => r._include).length} entries.
              </p>
              {saveResults.failed.map((f, i) => (
                <p key={i} className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">
                  {f.name}: {f.error}
                </p>
              ))}
            </div>
          )}

          <button
            onClick={saveAll}
            disabled={saving}
            className="mt-5 flex items-center gap-2 px-6 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            <FiSave /> {saving ? 'Saving...' : `Save ${rows.filter((r) => r._include).length} Entries`}
          </button>
        </div>
      )}
    </div>
  )
}
