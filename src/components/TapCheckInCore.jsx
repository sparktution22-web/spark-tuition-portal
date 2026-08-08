import { useEffect, useMemo, useState } from 'react'
import { FiSearch, FiCheckCircle, FiXCircle, FiArrowLeft, FiGrid } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { getStudents, kioskCheckIn } from '../services/api/sheetsApi.js'

// exitLabel/onExit are optional — pass them for the admin version's
// "Exit" button (logs out); omit them for the public version, which has
// nothing to log out of. showDashboardLink shows a separate "Dashboard"
// link that just navigates back without logging out.
export default function TapCheckInCore({ exitLabel, onExit, showDashboardLink }) {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [confirming, setConfirming] = useState(null)
  const [status, setStatus] = useState(null)
  const [processing, setProcessing] = useState(false)

  useEffect(() => {
    getStudents().then((list) => {
      setStudents([...list].sort((a, b) => a.name.localeCompare(b.name)))
      setLoading(false)
    })
  }, [])

  const filtered = useMemo(() => {
    if (!search.trim()) return students
    const q = search.toLowerCase()
    return students.filter((s) => s.name.toLowerCase().includes(q) || s.rollNo.toLowerCase().includes(q))
  }, [students, search])

  const confirm = async () => {
    if (!confirming) return
    setProcessing(true)
    try {
      const result = await kioskCheckIn(confirming.id)
      setStatus({ ok: true, name: result.studentName, action: result.action, time: result.time, duration: result.duration })
    } catch (err) {
      setStatus({ ok: false, message: err.message || 'Could not process this.' })
    }
    setConfirming(null)
    setProcessing(false)
    setTimeout(() => setStatus(null), 2500)
  }

  return (
    <div className="fixed inset-0 bg-spark-dark text-white flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <p className="font-display font-extrabold text-xl text-spark-orange">SPARK</p>
        <div className="flex items-center gap-2">
          {showDashboardLink && (
            <Link
              to="/app"
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
            >
              <FiGrid size={13} /> Dashboard
            </Link>
          )}
          {onExit && (
            <button
              onClick={onExit}
              className="px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs font-semibold transition-colors"
            >
              {exitLabel || 'Exit'}
            </button>
          )}
        </div>
      </div>

      <div className="px-5 pb-3 shrink-0 max-w-3xl w-full mx-auto">
        <p className="text-white/50 text-sm mb-3">Tap your name to check in or out</p>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your name..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white/10 text-white placeholder-white/30 outline-none text-base"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-6 max-w-3xl w-full mx-auto">
        {loading ? (
          <p className="text-white/40 text-sm text-center mt-10">Loading students...</p>
        ) : filtered.length === 0 ? (
          <p className="text-white/40 text-sm text-center mt-10">No student matches "{search}"</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {filtered.map((s) => (
              <button
                key={s.id}
                onClick={() => setConfirming(s)}
                className="bg-white/5 hover:bg-white/10 active:bg-spark-orange/20 rounded-2xl px-4 py-5 text-left transition-colors cursor-pointer"
              >
                <p className="font-semibold text-base leading-tight">{s.name}</p>
                <p className="text-white/40 text-xs mt-1">{s.rollNo} &middot; Class {s.class}</p>
              </button>
            ))}
          </div>
        )}
      </div>

      {confirming && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center px-6 z-30">
          <div className="bg-spark-dark border border-white/10 rounded-3xl p-8 max-w-sm w-full text-center">
            <p className="text-white/60 text-sm mb-1">Is this you?</p>
            <p className="font-display font-bold text-2xl mb-1">{confirming.name}</p>
            <p className="text-white/40 text-sm mb-6">{confirming.rollNo} &middot; Class {confirming.class}</p>
            <div className="flex gap-3">
              <button
                onClick={confirm}
                disabled={processing}
                className="flex-1 py-3.5 rounded-full bg-spark-gradient font-bold disabled:opacity-60 cursor-pointer"
              >
                {processing ? 'Checking...' : 'Yes, it\u2019s me'}
              </button>
              <button
                onClick={() => setConfirming(null)}
                disabled={processing}
                className="flex-1 py-3.5 rounded-full bg-white/10 font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <FiArrowLeft size={15} /> Not me
              </button>
            </div>
          </div>
        </div>
      )}

      {status && (
        <div className={`fixed inset-0 flex flex-col items-center justify-center gap-4 px-6 text-center z-40 ${status.ok ? 'bg-emerald-600/95' : 'bg-red-600/95'}`}>
          {status.ok ? (
            <>
              <FiCheckCircle size={56} />
              <div>
                <p className="font-display font-bold text-2xl">{status.name}</p>
                <p className="text-white/90 mt-1 capitalize">{status.action.replace('-', ' ')} at {status.time}</p>
                {status.action === 'checked-out' && status.duration && (
                  <p className="text-white/70 text-sm mt-1">Total time: {status.duration.replace(' HRS', '')}</p>
                )}
              </div>
            </>
          ) : (
            <>
              <FiXCircle size={56} />
              <p className="font-semibold text-lg">{status.message}</p>
            </>
          )}
        </div>
      )}
    </div>
  )
}
