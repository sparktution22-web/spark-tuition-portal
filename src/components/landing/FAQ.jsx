import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiPlus } from 'react-icons/fi'

const FAQS = [
  {
    q: 'Do we need to change how we track attendance and fees?',
    a: 'No. SPARK reads directly from the Google Sheets your centre already uses for attendance and fees — you keep entering data the same way, and it reflects on the portal automatically.'
  },
  {
    q: 'What can parents and students actually see?',
    a: 'Parents see their own child\u2019s attendance, fees, marks and monthly reports. Students see the same, for themselves only. Admins are the only role that sees every student.'
  },
  {
    q: 'How does the monthly report PDF work?',
    a: 'Each student gets a downloadable report card with their attendance summary, subject-wise marks, teacher remarks and a QR code — ready to print or share.'
  },
  {
    q: 'Is our data secure?',
    a: 'The frontend never talks to Google Sheets directly. All reads and writes go through a Google Apps Script API, and access is gated by Firebase Authentication with role-based permissions.'
  },
  {
    q: 'Does it work offline?',
    a: 'SPARK can be installed as an app on phone or desktop and will show the last-synced data if your connection drops, syncing again once you\u2019re back online.'
  }
]

export default function FAQ() {
  const [open, setOpen] = useState(0)

  return (
    <section id="faqs" className="max-w-3xl mx-auto px-5 py-28">
      <div className="text-center mb-14">
        <span className="text-xs font-bold tracking-wide uppercase text-spark-orange">FAQs</span>
        <h2 className="mt-3 font-display font-extrabold text-3xl sm:text-4xl text-spark-ink">
          Questions, answered
        </h2>
      </div>

      <div className="space-y-3">
        {FAQS.map((item, i) => {
          const isOpen = open === i
          return (
            <div key={item.q} className="bg-white rounded-xl2 shadow-card overflow-hidden border border-spark-ink/5">
              <button
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
              >
                <span className="font-semibold text-spark-ink">{item.q}</span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25 }}
                  className="shrink-0 w-7 h-7 rounded-full bg-spark-peach flex items-center justify-center text-spark-orange"
                >
                  <FiPlus />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <p className="px-6 pb-5 text-sm text-spark-ink/60 leading-relaxed">{item.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )
        })}
      </div>
    </section>
  )
}
