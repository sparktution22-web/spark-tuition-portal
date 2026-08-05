import { motion } from 'framer-motion'

const TESTIMONIALS = [
  {
    quote:
      "I used to call the centre every week just to ask about attendance. Now I open SPARK and it's already there — with the exact dates.",
    name: 'Parent',
    role: 'Class 6 student\u2019s guardian'
  },
  {
    quote:
      'Fee follow-ups went from a spreadsheet I dreaded opening to a dashboard that tells me who to remind, today.',
    name: 'Admin',
    role: 'Centre coordinator'
  },
  {
    quote:
      'Seeing my subject-wise trend before a test — not just after — changed how I actually studied for it.',
    name: 'Student',
    role: 'Class 9'
  }
]

export default function Testimonials() {
  return (
    <section id="testimonials" className="bg-spark-peach/40 py-28">
      <div className="max-w-6xl mx-auto px-5">
        <div className="max-w-2xl mx-auto text-center mb-16">
          <span className="text-xs font-bold tracking-wide uppercase text-spark-orange">Who it's for</span>
          <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-spark-ink">
            Built around three people, not one dashboard
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map((t, i) => (
            <motion.figure
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="bg-white rounded-xl2 shadow-card p-7 flex flex-col"
            >
              <blockquote className="text-spark-ink/75 leading-relaxed text-sm flex-1">
                “{t.quote}”
              </blockquote>
              <figcaption className="mt-5 pt-5 border-t border-spark-ink/10">
                <p className="font-display font-bold text-spark-ink text-sm">{t.name}</p>
                <p className="text-xs text-spark-ink/45">{t.role}</p>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </div>
    </section>
  )
}
