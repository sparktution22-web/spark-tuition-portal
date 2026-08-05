import { motion } from 'framer-motion'
import { FiCalendar, FiDollarSign, FiAward, FiFileText, FiBell, FiShield } from 'react-icons/fi'

const FEATURES = [
  {
    icon: FiCalendar,
    title: 'Live attendance',
    desc: 'Day-wise, monthly and heatmap views — pulled straight from your attendance sheet the moment it updates.'
  },
  {
    icon: FiDollarSign,
    title: 'Fees at a glance',
    desc: 'Paid, pending and due-date status per student, with collection trends admins can act on.'
  },
  {
    icon: FiAward,
    title: 'Marks & rank',
    desc: 'Subject-wise scores across English, Maths, Science, Social, Hindi and Computer, with grade and rank auto-computed.'
  },
  {
    icon: FiFileText,
    title: 'Report-ready PDFs',
    desc: 'A parent-signed, teacher-remarked monthly report card — generated and downloadable in one tap.'
  },
  {
    icon: FiBell,
    title: 'Smart notifications',
    desc: 'Fee reminders, absence alerts and upcoming-test nudges, sent to the right role automatically.'
  },
  {
    icon: FiShield,
    title: 'Role-based access',
    desc: 'Admins manage everything. Parents and students see only what belongs to them — nothing more.'
  }
]

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }
  })
}

export default function Features() {
  return (
    <section id="features" className="max-w-7xl mx-auto px-5 py-28">
      <div className="max-w-2xl mx-auto text-center mb-16">
        <span className="text-xs font-bold tracking-wide uppercase text-spark-orange">What you get</span>
        <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-spark-ink">
          Everything a tuition centre needs, nothing it doesn't
        </h2>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((f, i) => (
          <motion.div
            key={f.title}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-60px' }}
            className="group bg-white rounded-xl2 shadow-card hover:shadow-card-hover p-7 transition-all hover:-translate-y-1 border border-spark-ink/5"
          >
            <div className="w-12 h-12 rounded-2xl bg-spark-peach flex items-center justify-center mb-5 group-hover:bg-spark-gradient transition-colors">
              <f.icon className="w-6 h-6 text-spark-orange group-hover:text-white transition-colors" />
            </div>
            <h3 className="font-display font-bold text-lg text-spark-ink mb-2">{f.title}</h3>
            <p className="text-sm text-spark-ink/55 leading-relaxed">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
