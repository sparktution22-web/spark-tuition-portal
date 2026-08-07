import { useEffect, useState } from 'react'
import { FiAward, FiTrendingUp, FiBarChart2 } from 'react-icons/fi'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getMarks } from '../../services/api/sheetsApi.js'
import { gradeFromPercent } from '../../services/api/mockData.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import SubjectBarChart from '../../components/charts/SubjectBarChart.jsx'
import PerformanceRadarChart from '../../components/charts/PerformanceRadarChart.jsx'
import { SkeletonCards, SkeletonBlock } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

export default function TestMarks() {
  const { selectedStudentId } = useStudentContext()
  const [marks, setMarks] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStudentId) return
    setLoading(true)
    getMarks(selectedStudentId).then((data) => {
      setMarks(data)
      setLoading(false)
    })
  }, [selectedStudentId])

  // Percentage per mark — the real bug here was every stat below using
  // the raw score number (e.g. 35) as if it were already a percentage,
  // instead of score/max*100 (e.g. 35/40 = 87.5%). That's why a 35/40
  // was showing grade D: gradeFromPercent(35) looks up the grade for a
  // raw score of 35%, not the actual 87.5%.
  const withPct = marks.map((m) => ({ ...m, pct: m.max ? Math.round((m.score / m.max) * 100) : 0 }))
  const overall = withPct.length ? Math.round(withPct.reduce((s, m) => s + m.pct, 0) / withPct.length) : 0
  const highest = withPct.length ? Math.max(...withPct.map((m) => m.pct)) : 0
  const highestSubject = withPct.find((m) => m.pct === highest)?.subject || '-'
  const isSingleSubject = marks.length === 1

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={3} />
        <SkeletonBlock className="h-72" />
      </div>
    )
  }

  if (marks.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex justify-end">
          <StudentSwitcher />
        </div>
        <EmptyState
          icon={FiAward}
          title="No test marks yet"
          description="Results will show up here as soon as they're added."
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <StudentSwitcher />
      </div>

      {/* Overall/Grade/Highest only make sense across multiple subjects —
          with just one, the table row below already shows that subject's
          own score and grade, so showing "Overall" again is redundant
          and confusing. */}
      {!isSingleSubject && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard icon={FiAward} label="Overall %" value={overall} suffix="%" tone="orange" />
          <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 sm:p-6 border border-spark-ink/5 dark:border-white/10">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-50 text-emerald-600 mb-4">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <p className="font-mono font-bold text-2xl sm:text-3xl text-spark-ink dark:text-white">{gradeFromPercent(overall)}</p>
            <p className="mt-1 text-xs sm:text-sm font-semibold text-spark-ink/50 dark:text-white/50">Grade</p>
          </div>
          <StatCard icon={FiBarChart2} label="Highest" value={highest} suffix="%" tone="blue" />
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Subject Comparison</h3>
          <SubjectBarChart data={marks} />
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Performance Radar</h3>
          <PerformanceRadarChart data={marks} />
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <h3 className="font-display font-bold text-spark-ink dark:text-white p-6 pb-4">
          Subject-wise Marks {!isSingleSubject && <span className="text-spark-orange text-sm font-semibold ml-2">Highest in {highestSubject}</span>}
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-spark-ink/40 dark:text-white/40 uppercase tracking-wide bg-spark-surface dark:bg-white/5">
                <th className="px-6 py-3 font-semibold">Subject</th>
                <th className="px-6 py-3 font-semibold">Date</th>
                <th className="px-6 py-3 font-semibold">Score</th>
                <th className="px-6 py-3 font-semibold">Grade</th>
                <th className="px-6 py-3 font-semibold w-1/3">Performance</th>
              </tr>
            </thead>
            <tbody>
              {withPct.map((m) => (
                <tr key={m.subject + m.date} className="border-t border-spark-ink/5 dark:border-white/5">
                  <td className="px-6 py-3.5 font-semibold text-spark-ink dark:text-white">{m.subject}</td>
                  <td className="px-6 py-3.5 text-spark-ink/60 dark:text-white/60 font-mono text-xs">{m.date || '\u2014'}</td>
                  <td className="px-6 py-3.5 font-mono text-spark-ink/70 dark:text-white/70">{m.score}/{m.max}</td>
                  <td className="px-6 py-3.5">
                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-spark-peach text-spark-orange">
                      {gradeFromPercent(m.pct)}
                    </span>
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="h-2 rounded-full bg-spark-peach dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-spark-gradient rounded-full" style={{ width: `${m.pct}%` }} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
