import { useEffect, useState } from 'react'
import { FiBook, FiUpload, FiFileText } from 'react-icons/fi'
import { getStudents, createStudyMaterial, getStudyMaterialsForClass, fileToBase64 } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const MAX_SIZE_MB = 8

export default function AdminStudyMaterials() {
  const [classOptions, setClassOptions] = useState([])
  const [className, setClassName] = useState('')
  const [subject, setSubject] = useState('')
  const [title, setTitle] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [viewClass, setViewClass] = useState('')
  const [materials, setMaterials] = useState([])
  const [loadingList, setLoadingList] = useState(false)

  useEffect(() => {
    const cached = loadCached('spark_cache_admin_students')
    if (cached) setClassOptions([...new Set(cached.map((s) => s.class).filter(Boolean))])
    getStudents().then((list) => {
      const distinct = [...new Set(list.map((s) => s.class).filter(Boolean))]
      setClassOptions(distinct)
      saveCache('spark_cache_admin_students', list)
    })
  }, [])

  const loadList = (cls) => {
    if (!cls) {
      setMaterials([])
      return
    }
    setLoadingList(true)
    getStudyMaterialsForClass(cls).then((data) => {
      setMaterials(data)
      setLoadingList(false)
    })
  }

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!className || !subject.trim() || !title.trim() || !file) {
      setError('All fields, including the PDF, are required.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Only PDF files are accepted.')
      return
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`This file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please keep it under ${MAX_SIZE_MB}MB.`)
      return
    }
    setSaving(true)
    try {
      const fileBase64 = await fileToBase64(file)
      await createStudyMaterial({ className, subject: subject.trim(), title: title.trim(), fileBase64 })
      setSuccess(`"${title}" shared with Class ${className}.`)
      setSubject('')
      setTitle('')
      setFile(null)
      if (viewClass === className) loadList(className)
    } catch (err) {
      setError(err.message || 'Could not upload. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiBook className="text-spark-orange" /> Share Study Material
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
              placeholder="e.g. Science"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Chapter 5 Revision Notes"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">PDF File</label>
            <label className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
              file && file.size > MAX_SIZE_MB * 1024 * 1024
                ? 'border-red-400 text-red-500'
                : 'border-spark-ink/20 dark:border-white/20 text-spark-ink/60 dark:text-white/60 hover:border-spark-orange'
            }`}>
              <FiUpload />
              {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)` : 'Choose a PDF file...'}
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-1.5 inline-block">
              Only PDF files under {MAX_SIZE_MB}MB are accepted
            </p>
          </div>
          <div className="sm:col-span-2 space-y-3">
            {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
            {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
            >
              <FiUpload /> {saving ? 'Uploading...' : 'Share Material'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <div className="p-6 pb-4">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-3">View by Class</h3>
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
        ) : materials.length === 0 ? (
          <div className="px-6 pb-6"><EmptyState message="No materials shared for this class yet." /></div>
        ) : (
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {materials.map((m) => (
              <div key={m.materialId} className="flex items-center gap-3 px-6 py-3.5">
                <FiFileText className="text-spark-orange shrink-0" size={16} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{m.title}</p>
                  <p className="text-xs text-spark-ink/40 dark:text-white/40">{m.subject}</p>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
