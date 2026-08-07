import { useEffect, useState } from 'react'
import { FiDollarSign, FiCheckCircle, FiClock, FiTrendingUp, FiSend, FiMessageCircle } from 'react-icons/fi'
import { useAuth } from '../../contexts/AuthContext.jsx'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getFees, getAdminDashboard, getFeeReminders } from '../../services/api/sheetsApi.js'
import { formatCurrency } from '../../utils/format.js'
import StatCard from '../../components/StatCard.jsx'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import FeeCollectionChart from '../../components/charts/FeeCollectionChart.jsx'
import FeePieChart from '../../components/charts/FeePieChart.jsx'
import { SkeletonCards, SkeletonTable } from '../../components/Skeleton.jsx'

// Turns a stored parent number (e.g. "8903480344" or with spaces/dashes)
// into the digits-only, country-code-prefixed format wa.me needs.
// Assumes India (+91) since that's this centre's numbers — adjust the
// prefix here if that's ever not the case.
function toWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return '91' + digits
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1)
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

function buildReminderLink(r) {
  const number = toWhatsAppNumber(r.parentMobile)
  if (!number) return null
  const greeting = r.parentName ? `Dear ${r.parentName} (Parent of ${r.name})` : `Dear Parent of ${r.name}`
  const message =
    `${greeting}, this is a gentle reminder from SPARK Tuition Centre that ${r.name}'s (Class ${r.class}) fee of ` +
    `${formatCurrency(r.pending)} for ${r.month} is still pending. Kindly clear it at your earliest convenience. Thank you!`
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

// Admin-only — every student with a pending balance this month, each
// with a "Send Reminder" button that opens WhatsApp pre-filled with a
// message to that parent. Free (no WhatsApp Business API needed) —
// admin still clicks Send themselves in WhatsApp, this just prepares
// the message and opens the right chat.
function FeeRemindersPanel() {
  const [reminders, setReminders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getFeeReminders().then((data) => {
      setReminders(data)
      setLoading(false)
    })
  }, [])

  if (loading) return <SkeletonTable rows={3} />

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
      <div className="p-6 pb-4 flex items-center justify-between">
        <h3 className="font-display font-bold text-spark-ink dark:text-white flex items-center gap-2">
          <FiMessageCircle className="text-emerald-500" /> Fee Reminders
        </h3>
        <span className="text-xs font-semibold text-spark-ink/40 dark:text-white/40">{reminders.length} pending</span>
      </div>

      {reminders.length === 0 ? (
        <p className="px-6 pb-6 text-sm text-spark-ink/50 dark:text-white/50">No pending fees this month — nothing to remind.</p>
      ) : (
        <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
          {reminders.map((r) => {
            const link = buildReminderLink(r)
            return (
              <div key={r.rollNo} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-semibold text-spark-ink dark:text-white">{r.name} <span className="text-xs font-normal text-spark-ink/40 dark:text-white/40">Class {r.class} · {r.rollNo}</span></p>
                  <p className="text-xs text-spark-ink/50 dark:text-white/50">
                    {r.parentName || 'Parent'} · {r.parentMobile || 'No number on file'} · <span className="text-red-500 font-semibold">{formatCurrency(r.pending)} pending</span>
                  </p>
                </div>
                {link ? (
                  <a
                    href={link}
                    target="_blank"
                    rel="noreferrer"
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-emerald-500 text-white text-xs font-bold shadow-soft hover:shadow-card-hover transition-all shrink-0"
                  >
                    <FiSend size={13} /> Send Reminder
                  </a>
                ) : (
                  <span className="text-xs text-spark-ink/30 dark:text-white/30 shrink-0">No number on file</span>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// Admin-only — consolidated centre-wide fees for the current month,
// shown above the per-student view below. Uses the same
// getAdminDashboard() call as the main Dashboard (cached server-side),
// so this doesn't add an extra slow round-trip.
// Total = sum of all students' fee amount for this month, Collected =
// this month's collected amount, Pending = Total - Collected.
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

  return (
    <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
      <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4">Centre-wide Fees — This Month</h3>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="font-mono font-bold text-spark-ink dark:text-white text-lg">{formatCurrency(data?.feesPayable ?? 0)}</p>
          <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1">Total Fees (all students)</p>
        </div>
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="font-mono font-bold text-emerald-600 text-lg">{formatCurrency(data?.feesCollected ?? 0)}</p>
          <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1">Collected ({thisMonthPct}%)</p>
        </div>
        <div className="rounded-xl bg-spark-surface dark:bg-white/5 p-4">
          <p className="font-mono font-bold text-red-500 text-lg">{formatCurrency(data?.feesPending ?? 0)}</p>
          <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1">Pending</p>
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

      {user?.role === 'admin' && <FeeRemindersPanel />}

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
