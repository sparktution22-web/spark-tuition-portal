import { motion } from 'framer-motion'
import sparkLogo from '../../assets/spark-logo.png'

const SUBJECTS = [
  { name: 'English', score: 88 },
  { name: 'Maths', score: 92 },
  { name: 'Science', score: 85 },
  { name: 'Social', score: 79 },
  { name: 'Hindi', score: 90 },
  { name: 'Computer', score: 95 }
]

const ATTENDANCE_PCT = 94

/**
 * The hero's signature element — a live preview of the actual monthly report
 * SPARK generates as a PDF, not a generic dashboard mockup. This is what
 * grounds the hero in the real product deliverable.
 */
export default function ReportCardPreview() {
  const circumference = 2 * Math.PI * 42

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: 0 }}
      animate={{ opacity: 1, y: 0, rotate: -4 }}
      transition={{ duration: 0.9, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="relative w-full max-w-sm mx-auto animate-float"
    >
      <div className="glass rounded-xl3 shadow-card-hover p-6 border-white/60">
        {/* Card header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <img src={sparkLogo} alt="" className="h-5 w-auto" />
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-spark-ink/40">
            Aug 2026
          </span>
        </div>

        <p className="text-xs font-semibold text-spark-ink/50 mb-0.5">Monthly Report — Roll No. 24</p>
        <h3 className="font-display font-bold text-lg text-spark-ink mb-4">Aanya Menon · Class 8</h3>

        <div className="flex items-center gap-5 mb-5">
          {/* Attendance ring */}
          <div className="relative shrink-0 w-24 h-24">
            <svg viewBox="0 0 100 100" className="w-24 h-24 -rotate-90">
              <circle cx="50" cy="50" r="42" fill="none" stroke="#FFE9D9" strokeWidth="9" />
              <motion.circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="#FF6B00"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset: circumference * (1 - ATTENDANCE_PCT / 100) }}
                transition={{ duration: 1.4, delay: 1, ease: 'easeOut' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono font-bold text-lg text-spark-orange">{ATTENDANCE_PCT}%</span>
              <span className="text-[9px] text-spark-ink/40 font-semibold">Attendance</span>
            </div>
          </div>

          {/* Mini QR corner */}
          <div className="flex-1">
            <p className="text-[10px] font-semibold text-spark-ink/40 mb-2">Subject Performance</p>
            <div className="space-y-1.5">
              {SUBJECTS.slice(0, 3).map((s) => (
                <div key={s.name} className="flex items-center gap-2">
                  <span className="text-[10px] w-14 text-spark-ink/60 font-medium">{s.name}</span>
                  <div className="flex-1 h-1.5 rounded-full bg-spark-peach overflow-hidden">
                    <motion.div
                      className="h-full bg-spark-gradient rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${s.score}%` }}
                      transition={{ duration: 1, delay: 1.2 }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between border-t border-spark-ink/10 pt-3">
          <div>
            <p className="text-[10px] text-spark-ink/40 font-semibold">Overall Grade</p>
            <p className="font-display font-bold text-spark-orange text-xl">A+</p>
          </div>
          {/* Simplified QR mark */}
          <div className="grid grid-cols-4 grid-rows-4 gap-0.5 w-9 h-9 opacity-70">
            {Array.from({ length: 16 }).map((_, i) => (
              <span key={i} className={`rounded-[1px] ${[0, 1, 3, 5, 6, 9, 10, 12, 15].includes(i) ? 'bg-spark-ink' : 'bg-transparent'}`} />
            ))}
          </div>
        </div>
      </div>

      {/* Floating chip: today's status */}
      <motion.div
        initial={{ opacity: 0, x: -12, y: 12 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.7, delay: 1.4 }}
        className="absolute -left-8 -bottom-6 glass rounded-2xl shadow-card px-4 py-3 hidden sm:block"
      >
        <p className="text-[10px] font-semibold text-spark-ink/40">Fee Status</p>
        <p className="text-sm font-bold text-emerald-600">Paid ✓</p>
      </motion.div>
    </motion.div>
  )
}
