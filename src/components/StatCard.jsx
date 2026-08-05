import { motion } from 'framer-motion'
import AnimatedCounter from './AnimatedCounter.jsx'

export default function StatCard({ icon: Icon, label, value, suffix = '', decimals = 0, trend, tone = 'orange' }) {
  const toneMap = {
    orange: 'bg-spark-peach text-spark-orange',
    green: 'bg-emerald-50 text-emerald-600',
    red: 'bg-red-50 text-red-500',
    blue: 'bg-blue-50 text-blue-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 sm:p-6 border border-spark-ink/5 dark:border-white/10"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${toneMap[tone]}`}>
          <Icon className="w-5 h-5" />
        </div>
        {trend && (
          <span className={`text-xs font-bold ${trend.startsWith('-') ? 'text-red-500' : 'text-emerald-600'}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="font-mono font-mono-nums font-bold text-2xl sm:text-3xl text-spark-ink dark:text-white">
        <AnimatedCounter value={value} suffix={suffix} decimals={decimals} />
      </p>
      <p className="mt-1 text-xs sm:text-sm font-semibold text-spark-ink/50 dark:text-white/50">{label}</p>
    </motion.div>
  )
}
