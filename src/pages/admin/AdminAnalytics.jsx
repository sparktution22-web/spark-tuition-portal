import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiAward, FiTrendingUp, FiDownload } from 'react-icons/fi'
import { getAdminAnalytics } from '../../services/api/sheetsApi.js'
import StatCard from '../../components/StatCard.jsx'
import FeeCollectionChart from '../../components/charts/FeeCollectionChart.jsx'
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart.jsx'
import { SkeletonCards, SkeletonBlock } from '../../components/Skeleton.jsx'
import { formatCurrency } from '../../utils/format.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'

export default function AdminAnalytics() {
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    const cached = loadCached('spark_cache_admin_analytics')
    if (cached) {
      setData(cached)
      setLoading(false)
    }
    getAdminAnalytics().then((result) => {
      setData(result)
      setLoading(false)
      saveCache('spark_cache_admin_analytics', result)
    })
  }, [])

  const exportSummaryCSV = () => {
    if (!data) return
    const header = ['Metric', 'Value']
    const rows = [
      ['Total Students', data.totalStudents],
      ['Average Attendance %', data.avgAttendance],
      ['Total Fees', data.totalFees],
      ['Fees Collected', data.collected],
      ['Fees Pending', data.pending],
      ['Average Marks %', data.avgMarks]
    ]
    const csv = [header, ...rows].map((r) => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'centre-analytics-summary.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={5} />
        <SkeletonBlock className="h-72" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={exportSummaryCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white dark:bg-white/5 shadow-card text-sm font-semibold text-spark-ink dark:text-white hover:text-spark-orange transition-colors border border-spark-ink/5 dark:border-white/10"
        >
          <FiDownload /> Export Summary
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard icon={FiUsers} label="Total Students" value={data.totalStudents} tone="orange" />
        <StatCard icon={FiTrendingUp} label="Avg Attendance" value={data.avgAttendance} suffix="%" tone="green" />
        <StatCard icon={FiDollarSign} label="Fees Collected" value={data.collected} tone="blue" />
        <StatCard icon={FiDollarSign} label="Fees Pending" value={data.pending} tone="red" />
        <StatCard icon={FiAward} label="Average Marks" value={data.avgMarks} suffix="%" tone="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Centre-wide Attendance Trend (this month)</h3>
          <AttendanceTrendChart data={data.attTrend} />
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Fee Collection by Month</h3>
          <FeeCollectionChart data={data.feeTrend} />
        </div>
      </div>

      <div className="bg-spark-peach/40 dark:bg-white/5 rounded-xl2 p-6 text-sm text-spark-ink/70 dark:text-white/60">
        Total fees expected across all students: <strong className="text-spark-ink dark:text-white">{formatCurrency(data.totalFees)}</strong>
      </div>
    </div>
  )
}
