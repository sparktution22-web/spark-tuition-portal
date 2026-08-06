import { useEffect, useState } from 'react'
import { FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getFees, getAdminDashboard } from '../../services/api/sheetsApi.js'
import { formatCurrency } from '../../utils/format.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import FeeCollectionChart from '../../components/charts/FeeCollectionChart.jsx'
import FeePieChart from '../../components/charts/FeePieChart.jsx'
import { SkeletonCards, SkeletonTable } from '../../components/Skeleton.jsx'

// Admin-only — consolidated centre-wide fees for this month + last month,
// shown above the per-student view below. Uses the same getAdminDashboard()
// call as the main Dashboard (cached server-side), so this doesn't add an
// extra slow round-trip.
function CentreWideFeesStats() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard().then((d) => {
      setData(d)
      setLoading(false)
    })
  }, [])

  if (loading) return <SkeletonCards count={3} />

  const thisMonthPct = data?.feesPayable ? Math.round((data.feesCollected / data.feesPayable) * 100) : 0
  const prevMonthPct = data?.feesPayablePrevMonth ? Math.round((data.feesCollectedPrevMonth / data.feesPayablePrevMonth) * 100) : 0

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
      <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Centre-wide Fees</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-2">This Month</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono font-bold text-spark-ink dark:text-white text-sm">{formatCurrency(data?.feesPayable ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Total</p>
            </div>
            <div>
              <p className="font-mono font-bold text-emerald-600 text-sm">{formatCurrency(data?.feesCollected ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Collected ({thisMonthPct}%)</p>
            </div>
            <div>
              <p className="font-mono font-bold text-red-500 text-sm">{formatCurrency(data?.feesPending ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Pending</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="text-xs font-semibold text-spark-ink/40 dark:text-white/40 uppercase tracking-wide mb-2">Last Month</p>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <p className="font-mono font-bold text-spark-ink dark:text-white text-sm">{formatCurrency(data?.feesPayablePrevMonth ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Total</p>
            </div>
            <div>
              <p className="font-mono font-bold text-emerald-600 text-sm">{formatCurrency(data?.feesCollectedPrevMonth ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Collected ({prevMonthPct}%)</p>
            </div>
            <div>
              <p className="font-mono font-bold text-red-500 text-sm">{formatCurrency(data?.feesPendingPrevMonth ?? 0)}</p>
              <p className="text-[10px] text-spark-ink/40 dark:text-white/40 mt-0.5">Pending</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function Fees() {
  const { user } = useAuth()
  const { selectedStudentId } = useStudentContext()
  const [fees, setFees] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStudentId) return
    setLoading(true)
    getFees(selectedStudentId).then((data) => {
      setFees(data)
      setLoading(false)
    })
  }, [selectedStudentId])

  const totalPayable = fees.reduce((s, f) => s + f.amountPayable, 0)
  const collected = fees.reduce((s, f) => s + f.paid, 0)
  const pending = fees.reduce((s, f) => s + f.pending, 0)

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCards count={4} />
        <SkeletonTable />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {user?.role === 'admin' && <CentreWideFeesStats />}

      <div className="flex justify-end">
        <StudentSwitcher />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FiDollarSign} label="Total Fees" value={totalPayable} tone="orange" />
        <StatCard icon={FiCheckCircle} label="Collected" value={collected} tone="green" />
        <StatCard icon={FiClock} label="Pending" value={pending} tone={pending > 0 ? 'red' : 'green'} />
        <StatCard icon={FiTrendingUp} label="Collection Rate" value={totalPayable ? Math.round((collected / totalPayable) * 100) : 0} suffix="%" tone="blue" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Monthly Collection</h3>
          <FeeCollectionChart data={fees.map((f) => ({ month: f.month.split(' ')[0], paid: f.paid, pending: f.pending }))} />
        </div>
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
          <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Overall Split</h3>
          <FeePieChart collected={collected} pending={pending} />
        </div>
      </div>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
        <h3 className="font-display font-bold text-spark-ink dark:text-white p-6 pb-4">Payment History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-spark-ink/40 dark:text-white/40 uppercase tracking-wide bg-spark-surface dark:bg-white/5">
                <th className="px-6 py-3 font-semibold">Month</th>
                <th className="px-6 py-3 font-semibold">Amount Payable</th>
                <th className="px-6 py-3 font-semibold">Paid</th>
                <th className="px-6 py-3 font-semibold">Pending</th>
                <th className="px-6 py-3 font-semibold">Payment Date</th>
                <th className="px-6 py-3 font-semibold">Receipt No.</th>
                <th className="px-6 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {fees.map((f) => (
                <tr key={f.month} className="border-t border-spark-ink/5 dark:border-white/5 hover:bg-spark-peach/30 dark:hover:bg-white/5 transition-colors">
                  <td className="px-6 py-3.5 font-semibold text-spark-ink dark:text-white">{f.month}</td>
                  <td className="px-6 py-3.5 font-mono text-spark-ink/70 dark:text-white/70">{formatCurrency(f.amountPayable)}</td>
                  <td className="px-6 py-3.5 font-mono text-emerald-600">{formatCurrency(f.paid)}</td>
                  <td className="px-6 py-3.5 font-mono text-red-500">{f.pending ? formatCurrency(f.pending) : '\u2014'}</td>
                  <td className="px-6 py-3.5 text-spark-ink/60 dark:text-white/60">{f.paymentDate}</td>
                  <td className="px-6 py-3.5 font-mono text-xs text-spark-ink/50 dark:text-white/50">{f.receiptNo}</td>
                  <td className="px-6 py-3.5">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${f.status === 'Paid' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10' : 'bg-red-50 text-red-500 dark:bg-red-500/10'}`}>
                      {f.status}
                    </span>
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
