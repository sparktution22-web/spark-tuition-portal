import { useEffect, useState } from 'react'
import { FiUpload, FiFileText, FiPlus } from 'react-icons/fi'
import { getTests, createTest, getStudents, fileToBase64 } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { loadCached, saveCache } from '../../utils/pageCache.js'

export default function AdminTests() {
  const [tests, setTests] = useState([])
  const [classOptions, setClassOptions] = useState([])
  const [loading, setLoading] = useState(true)
  const [subject, setSubject] = useState('')
  const [testName, setTestName] = useState('')
  const [maxMarks, setMaxMarks] = useState('')
  const [className, setClassName] = useState('')
  const [file, setFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const load = () => {
    const cacheKey = 'spark_cache_admin_tests'
    const cached = loadCached(cacheKey)
    if (cached) {
      setTests(cached.tests)
      setClassOptions(cached.classOptions)
      setLoading(false)
    } else {
      setLoading(true)
    }
    Promise.all([getTests(), getStudents()]).then(([testList, students]) => {
      setTests(testList)
      // Distinct class values from the real roster, so admin picks from
      // values that actually match students exactly (avoids typos that
      // would silently hide a test from everyone).
      const distinct = [...new Set(students.map((s) => s.class).filter(Boolean))]
      setClassOptions(distinct)
      setLoading(false)
      saveCache(cacheKey, { tests: testList, classOptions: distinct })
    })
  }

  useEffect(() => { load() }, [])

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    if (!subject.trim() || !testName.trim() || !maxMarks || !className || !file) {
      setError('All fields, including the class and question paper PDF, are required.')
      return
    }
    if (file.type !== 'application/pdf') {
      setError('Question paper must be a PDF file.')
      return
    }
    const MAX_SIZE_MB = 4
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      setError(`This file is too large (${(file.size / 1024 / 1024).toFixed(1)}MB). Please keep question papers under ${MAX_SIZE_MB}MB.`)
      return
    }
    setSaving(true)
    try {
      const base64 = await fileToBase64(file)
      await createTest({ subject: subject.trim(), testName: testName.trim(), maxMarks: Number(maxMarks), className, questionPaperBase64: base64 })
      setSuccess(`"${testName}" created — Class ${className} students can now submit answers against it.`)
      setSubject('')
      setTestName('')
      setMaxMarks('')
      setClassName('')
      setFile(null)
      load()
    } catch (err) {
      setError(err.message || 'Could not create test. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiFileText className="text-spark-orange" /> Create a Test
        </h3>
        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Maths"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Test Name</label>
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g. Chapter 4 Test"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Max Marks</label>
              <input
                type="number"
                value={maxMarks}
                onChange={(e) => setMaxMarks(e.target.value)}
                placeholder="e.g. 40"
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Class</label>
              <select
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
              >
                <option value="">Choose...</option>
                {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <p className="text-xs text-spark-ink/40 dark:text-white/40 -mt-2">
            Only students in this class will see the test to submit against.
          </p>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Question Paper (PDF)</label>
            <label className={`flex items-center gap-2 px-4 py-3 rounded-xl border border-dashed text-sm cursor-pointer transition-colors ${
              file && file.size > 4 * 1024 * 1024
                ? 'border-red-400 text-red-500'
                : 'border-spark-ink/20 dark:border-white/20 text-spark-ink/60 dark:text-white/60 hover:border-spark-orange'
            }`}>
              <FiUpload />
              {file ? `${file.name} (${(file.size / 1024 / 1024).toFixed(1)}MB)` : 'Choose a PDF file...'}
              <input type="file" accept="application/pdf" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
            </label>
            <p className="text-xs font-semibold text-amber-600 bg-amber-50 rounded-lg px-3 py-1.5 mt-1.5 inline-block">
              Only PDF files under 4MB are accepted
            </p>
          </div>
          {error && <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
          {success && <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2">{success}</p>}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            <FiPlus /> {saving ? 'Uploading...' : 'Create Test'}
          </button>
        </form>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Existing Tests</h3>
        {loading ? (
          <SkeletonTable rows={3} />
        ) : tests.length === 0 ? (
          <EmptyState icon={FiFileText} title="No tests yet" description="Create one to let students start submitting answers." />
        ) : (
          <div className="space-y-3">
            {tests.map((t) => (
              <div key={t.testId} className="flex items-center justify-between border-b border-spark-ink/5 dark:border-white/10 last:border-0 pb-3 last:pb-0">
                <div>
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{t.testName}</p>
                  <p className="text-xs text-spark-ink/40 dark:text-white/40">
                    {t.subject}{t.className ? ` \u00b7 Class ${t.className}` : ''}
                  </p>
                </div>
                <span className="text-xs font-bold text-spark-orange bg-spark-peach px-2.5 py-1 rounded-full">/{t.maxMarks}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
