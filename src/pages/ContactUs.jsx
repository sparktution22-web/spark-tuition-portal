import { useState } from 'react'
import { FaWhatsapp } from 'react-icons/fa'
import { FiMessageCircle } from 'react-icons/fi'
import { useStudentContext } from '../contexts/StudentContext.jsx'

const WHATSAPP_NUMBER = '919502590645'

export default function ContactUs() {
  const { selectedStudent } = useStudentContext()
  const [message, setMessage] = useState('')

  const send = () => {
    if (!message.trim()) return
    const context = selectedStudent ? ` (Regarding: ${selectedStudent.name}, Roll No ${selectedStudent.rollNo})` : ''
    const fullMessage = `Hi, I have a query from the SPARK app${context}:\n\n${message.trim()}`
    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`
    window.open(url, '_blank')
  }

  return (
    <div className="max-w-lg space-y-5">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1 flex items-center gap-2">
          <FiMessageCircle className="text-spark-orange" /> Contact Us
        </h3>
        <p className="text-sm text-spark-ink/50 dark:text-white/50 mb-5">
          Have a question about attendance, fees, or anything else? Type it below — it'll open
          WhatsApp with your message ready to send to us directly.
        </p>

        <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Your Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          placeholder="Type your question or query here..."
          className="w-full px-4 py-3 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none mb-4"
        />

        <button
          onClick={send}
          disabled={!message.trim()}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#25D366] text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-40"
        >
          <FaWhatsapp size={18} /> Send via WhatsApp
        </button>

        <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-4">
          This opens WhatsApp on your phone or computer with your message already typed in —
          you just need to hit send there to reach us.
        </p>
      </div>
    </div>
  )
}
