import { useEffect, useState } from 'react'
import { FiUsers, FiDollarSign, FiAward, FiTrendingUp, FiDownload } from 'react-icons/fi'
import { getStudents, getFees, getMarks, getAttendance } from '../../services/api/sheetsApi.js'
import StatCard from '../../components/StatCard.jsx'
import FeeCollectionChart from '../../components/charts/FeeCollectionChart.jsx'
import AttendanceTrendChart from '../../components/charts/AttendanceTrendChart.jsx'
import { SkeletonCards, SkeletonBlock } from '../../components/Skeleton.jsx'
import { formatCurrency } from '../../utils/format.js'

export default function AdminAnalytics() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [aggregate, setAggregate] = useState({ totalFees: 0, collected: 0, pending: 0, avgAttendance: 0, avgMarks: 0 })
  const [feeTrend, setFeeTrend] = useState([])
  const [attTrend, setAttTrend] = useState([])

  useEffect(() => {
    getStudents().then(async (list) => {
      setStudents(list)

      let totalFees = 0, collected = 0, pending = 0, attSum = 0, marksSum = 0, marksCount = 0
      const feeByMonth = {}
      const attByWeek = {}

      for (const s of list) {
        const [fees, marks, attendance] = await Promise.all([getFees(s.id), getMarks(s.id), getAttendance(s.id)])
        fees.forEach((f) => {
          totalFees += f.amountPayable
          collected += f.paid
          pending += f.pending
          feeByMonth[f.month] = feeByMonth[f.month] || { month: f.month.split(' ')[0], paid: 0, pending: 0 }
          feeByMonth[f.month].paid += f.paid
          feeByMonth[f.month].pending += f.pending
        })
        marks.forEach((m) => { marksSum += m.score; marksCount += 1 })

        attendance.forEach((r) => {
          const week = `Wk ${Math.ceil(new Date(r.date).getDate() / 7)}`
          attByWeek[week] = attByWeek[week] || { label: week, present: 0, total: 0 }
          if (r.status !== 'Holiday') attByWeek[week].total += 1
          if (r.status === 'Present' || r.status === 'Late') attByWeek[week].present += 1
        })
        const presentCount = attendance.filter((r) => r.status === 'Present' || r.status === 'Late').length
        const totalCount = attendance.filter((r) => r.status !== 'Holiday').length
        attSum += totalCount ? (presentCount / totalCount) * 100 : 0
      }

      setAggregate({
        totalFees,
        collected,
        pending,
        avgAttendance: list.length ? Math.round(attSum / list.length) : 0,
        avgMarks: marksCount ? Math.round(marksSum / marksCount) : 0
      })
      setFeeTrend(Object.values(feeByMonth))
      setAttTrend(Object.values(attByWeek).map((w) => ({ label: w.label, present: w.total ? Math.round((w.present / w.total) * 100) : 0 })))
      setLoading(false)
    })
  }, [])

  const exportSummaryCSV = () => {
    const header = ['Metric', 'Value']
    const rows = [
      ['Total Students', students.length],
      ['Average Attendance %', aggregate.avgAttendance],
      ['Total Fees', aggregate.totalFees],
      ['Fees Collected', aggregate.collected],
      ['Fees Pending', aggregate.pending],
      ['Average Marks %', aggregate.avgMarks]
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
        <StatCard icon={FiUsers} label="Total Students" value={students.length} tone="orange" />
        <StatCard icon={FiTrendingUp} label="Avg Attendance" value={aggregate.avgAttendance} suffix="%" tone="green" />
        <StatCard icon={FiDollarSign} label="Fees Collected" value={aggregate.collected} tone="blue" />
        <StatCard icon={FiDollarSign} label="Fees Pending" value={aggregate.pending} tone="red" />
        <StatCard icon={FiAward} label="Average Marks" value={aggregate.avgMarks} suffix="%" tone="orange" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Centre-wide Attendance Trend</h3>
          <AttendanceTrendChart data={attTrend} />
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Fee Collection by Month</h3>
          <FeeCollectionChart data={feeTrend} />
        </div>
      </div>

      <div className="bg-spark-peach/40 dark:bg-white/5 rounded-xl2 p-6 text-sm text-spark-ink/70 dark:text-white/60">
        Total fees expected across all students: <strong className="text-spark-ink dark:text-white">{formatCurrency(aggregate.totalFees)}</strong>
      </div>
    </div>
  )
}
