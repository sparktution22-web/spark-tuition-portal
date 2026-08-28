import { useEffect, useState } from 'react'
import { FiActivity, FiCheckCircle, FiXCircle, FiClock } from 'react-icons/fi'
import { getLoginSummary, getLoginActivity } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'

export default function AdminLoginActivity() {
  const [summary, setSummary] = useState([])
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('summary') // 'summary' | 'activity'

  useEffect(() => {
    const cached = loadCached('spark_cache_login_summary')
    const cachedActivity = loadCached('spark_cache_login_activity')
    if (cached) setSummary(cached)
    if (cachedActivity) setActivity(cachedActivity)
    if (cached || cachedActivity) setLoading(false)

    Promise.all([getLoginSummary(), getLoginActivity()]).then(([s, a]) => {
      setSummary(s)
      setActivity(a)
      setLoading(false)
      saveCache('spark_cache_login_summary', s)
      saveCache('spark_cache_login_activity', a)
    })
  }, [])

  if (loading) return <SkeletonTable rows={6} />

  const neverParent = summary.filter((s) => !s.parentLastLogin).length
  const neverStudent = summary.filter((s) => !s.studentLastLogin).length

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 border border-spark-ink/5 dark:border-white/10">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase mb-1">Parents Not Yet Logged In</p>
          <p className="text-3xl font-display font-bold text-spark-ink dark:text-white">{neverParent} <span className="text-sm font-normal text-spark-ink/40 dark:text-white/40">of {summary.length}</span></p>
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 border border-spark-ink/5 dark:border-white/10">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase mb-1">Students Not Yet Logged In</p>
          <p className="text-3xl font-display font-bold text-spark-ink dark:text-white">{neverStudent} <span className="text-sm font-normal text-spark-ink/40 dark:text-white/40">of {summary.length}</span></p>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setTab('summary')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'summary' ? 'bg-spark-gradient text-white' : 'bg-spark-surface dark:bg-white/5 text-spark-ink/60 dark:text-white/60'}`}
        >
          By Student
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`px-4 py-2 rounded-full text-sm font-semibold transition-colors ${tab === 'activity' ? 'bg-spark-gradient text-white' : 'bg-spark-surface dark:bg-white/5 text-spark-ink/60 dark:text-white/60'}`}
        >
          Recent Activity
        </button>
      </div>

      {tab === 'summary' ? (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-spark-ink/5 dark:border-white/10 text-left">
                <th className="px-5 py-3 font-semibold text-spark-ink/50 dark:text-white/50">Student</th>
                <th className="px-5 py-3 font-semibold text-spark-ink/50 dark:text-white/50">Parent Last Login</th>
                <th className="px-5 py-3 font-semibold text-spark-ink/50 dark:text-white/50">Student Last Login</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((s) => (
                <tr key={s.rollNo} className="border-b border-spark-ink/5 dark:border-white/5 last:border-0">
                  <td className="px-5 py-3">
                    <p className="font-semibold text-spark-ink dark:text-white">{s.studentName}</p>
                    <p className="text-xs text-spark-ink/40 dark:text-white/40">Class {s.class} · {s.rollNo}</p>
                  </td>
                  <td className="px-5 py-3">
                    {s.parentLastLogin ? (
                      <span className="flex items-center gap-1.5 text-emerald-600"><FiCheckCircle size={13} /> {s.parentLastLogin}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500"><FiXCircle size={13} /> Never</span>
                    )}
                  </td>
                  <td className="px-5 py-3">
                    {s.studentLastLogin ? (
                      <span className="flex items-center gap-1.5 text-emerald-600"><FiCheckCircle size={13} /> {s.studentLastLogin}</span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-red-500"><FiXCircle size={13} /> Never</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
          <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-spark-ink/40 dark:text-white/40">No login activity recorded yet.</p>
            ) : (
              activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <FiActivity className="text-spark-orange shrink-0" size={16} />
                    <div>
                      <p className="text-sm font-semibold text-spark-ink dark:text-white">{a.rollNo || '—'} <span className="font-normal text-spark-ink/40 dark:text-white/40 capitalize">· {a.role}</span></p>
                      <p className="text-xs text-spark-ink/40 dark:text-white/40">{a.email}</p>
                    </div>
                  </div>
                  <span className="flex items-center gap-1.5 text-xs text-spark-ink/50 dark:text-white/50 shrink-0">
                    <FiClock size={12} /> {a.timestamp}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
