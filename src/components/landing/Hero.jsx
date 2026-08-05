import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import ReportCardPreview from './ReportCardPreview.jsx'

const headline = ['Every class,', 'every mark,', 'every rupee —', 'tracked in real time.']

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } }
}
const line = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } }
}

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 sm:pt-40 sm:pb-32">
      {/* Animated gradient blob background */}
      <div className="absolute inset-0 -z-10 overflow-hidden" aria-hidden="true">
        <div className="absolute top-[-10%] left-[-5%] w-[36rem] h-[36rem] rounded-full bg-spark-orange/20 blur-3xl animate-blob-1" />
        <div className="absolute bottom-[-15%] right-[-10%] w-[40rem] h-[40rem] rounded-full bg-spark-accent/20 blur-3xl animate-blob-2" />
        <div className="absolute inset-0 bg-spark-radial" />
      </div>

      <div className="max-w-7xl mx-auto px-5 grid lg:grid-cols-2 gap-16 items-center">
        <div>
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 text-xs font-bold tracking-wide uppercase text-spark-orange bg-spark-peach px-4 py-1.5 rounded-full mb-6"
          >
            Educate · Empower · Enrich
          </motion.span>

          <motion.h1
            variants={container}
            initial="hidden"
            animate="show"
            className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.08] text-spark-ink"
          >
            {headline.map((l, i) => (
              <motion.span key={i} variants={line} className={`block ${i === 2 ? 'text-gradient' : ''}`}>
                {l}
              </motion.span>
            ))}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.7 }}
            className="mt-6 text-lg text-spark-ink/60 max-w-lg"
          >
            SPARK gives admins, parents and students one live view of
            attendance, fees and marks — synced straight from your existing
            Google Sheets, no re-entry required.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.85 }}
            className="mt-9 flex flex-wrap items-center gap-4"
          >
            <Link
              to="/register"
              className="px-7 py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover hover:-translate-y-0.5 transition-all"
            >
              Get started free
            </Link>
            <Link
              to="/login"
              className="px-7 py-3.5 rounded-full border-2 border-spark-ink/10 font-bold text-spark-ink hover:border-spark-orange hover:text-spark-orange transition-colors"
            >
              Log in
            </Link>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="mt-6 text-xs text-spark-ink/40 font-medium"
          >
            No credit card needed · Works with your existing Sheets
          </motion.p>
        </div>

        <ReportCardPreview />
      </div>
    </section>
  )
}
