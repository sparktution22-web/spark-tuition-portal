import { motion } from 'framer-motion'
import AnimatedCounter from '../AnimatedCounter.jsx'

const STATS = [
  { value: 1200, suffix: '+', label: 'Students tracked' },
  { value: 96, suffix: '%', label: 'Average attendance visibility' },
  { value: 45, suffix: 'min', label: 'Saved per report, per week' },
  { value: 3, suffix: '', label: 'Roles, one source of truth' }
]

export default function Stats() {
  return (
    <section id="stats" className="relative -mt-12 z-10">
      <div className="max-w-6xl mx-auto px-5">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.6 }}
          className="glass rounded-xl3 shadow-card px-6 sm:px-10 py-8 grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-mono font-bold text-3xl sm:text-4xl text-spark-orange">
                <AnimatedCounter value={s.value} suffix={s.suffix} />
              </p>
              <p className="mt-1 text-xs sm:text-sm font-semibold text-spark-ink/50">{s.label}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
