import { useEffect, useState } from 'react'
import { FiSend, FiUsers, FiCheckSquare, FiSquare } from 'react-icons/fi'
import { getBroadcastContacts } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

// Same phone-number formatting already used for fee reminders — turns
// a stored parent number into the digits-only, country-code-prefixed
// format wa.me needs. Assumes India (+91).
function toWhatsAppNumber(raw) {
  const digits = String(raw || '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.length === 10) return '91' + digits
  if (digits.length === 11 && digits.startsWith('0')) return '91' + digits.slice(1)
  if (digits.length === 12 && digits.startsWith('91')) return digits
  return digits
}

export default function AdminSendMessage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(new Set())
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sentCount, setSentCount] = useState(0)

  useEffect(() => {
    const cached = loadCached('spark_cache_broadcast_contacts')
    if (cached) {
      setContacts(cached)
      setSelected(new Set(cached.filter((c) => toWhatsAppNumber(c.parentMobile)).map((c) => c.rollNo)))
      setLoading(false)
    }
    getBroadcastContacts().then((data) => {
      setContacts(data)
      setSelected(new Set(data.filter((c) => toWhatsAppNumber(c.parentMobile)).map((c) => c.rollNo)))
      setLoading(false)
      saveCache('spark_cache_broadcast_contacts', data)
    })
  }, [])

  const toggle = (rollNo) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(rollNo)) next.delete(rollNo)
      else next.add(rollNo)
      return next
    })
  }

  const sendableContacts = contacts.filter((c) => toWhatsAppNumber(c.parentMobile))
  const allSelected = sendableContacts.length > 0 && sendableContacts.every((c) => selected.has(c.rollNo))

  const toggleAll = () => {
    if (allSelected) setSelected(new Set())
    else setSelected(new Set(sendableContacts.map((c) => c.rollNo)))
  }

  // WhatsApp has no free API for sending automatically — this opens one
  // click-to-chat tab per selected family, with the message pre-filled.
  // Admin still taps Send in each tab themselves, same as Bulk Fee
  // Reminders already does. Opened with a short stagger so the browser
  // doesn't block them as spam popups.
  const sendToSelected = async () => {
    if (!message.trim()) return
    setSending(true)
    setSentCount(0)
    const targets = contacts.filter((c) => selected.has(c.rollNo) && toWhatsAppNumber(c.parentMobile))
    for (let i = 0; i < targets.length; i++) {
      const c = targets[i]
      const greeting = c.parentName ? `Dear ${c.parentName} (Parent of ${c.studentName})` : `Dear Parent of ${c.studentName}`
      const text = `${greeting},\n\n${message.trim()}\n\n\u2013 SPARK Tuition Centre`
      window.open(`https://wa.me/${toWhatsAppNumber(c.parentMobile)}?text=${encodeURIComponent(text)}`, '_blank')
      setSentCount(i + 1)
      if (i < targets.length - 1) await new Promise((r) => setTimeout(r, 400))
    }
    setSending(false)
  }

  if (loading) return <SkeletonTable rows={5} />

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
        <FiSend className="text-spark-orange" /> Send Message
      </h2>
      <p className="text-sm text-spark-ink/50 dark:text-white/50">
        Write one message and send it to everyone at once, or pick specific families — each opens as a WhatsApp chat with the message ready, you just tap Send yourself in each one.
      </p>

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Message</label>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
          placeholder="Type your message here..."
          className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none resize-none"
        />
      </div>

      {contacts.length === 0 ? (
        <EmptyState message="No students found." />
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-spark-ink/5 dark:border-white/10">
            <button onClick={toggleAll} className="flex items-center gap-2 text-sm font-semibold text-spark-ink dark:text-white">
              {allSelected ? <FiCheckSquare className="text-spark-orange" /> : <FiSquare className="text-spark-ink/30 dark:text-white/30" />}
              Select All ({sendableContacts.length} with a number on file)
            </button>
            <span className="text-xs text-spark-ink/40 dark:text-white/40 flex items-center gap-1"><FiUsers size={12} /> {selected.size} selected</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-spark-ink/5 dark:divide-white/5">
            {contacts.map((c) => {
              const hasNumber = toWhatsAppNumber(c.parentMobile)
              return (
                <button
                  key={c.rollNo}
                  onClick={() => hasNumber && toggle(c.rollNo)}
                  disabled={!hasNumber}
                  className={`w-full flex items-center gap-3 px-6 py-3 text-left transition-colors ${hasNumber ? 'hover:bg-spark-peach/40 dark:hover:bg-white/5' : 'opacity-40 cursor-not-allowed'}`}
                >
                  {selected.has(c.rollNo) ? <FiCheckSquare className="text-spark-orange shrink-0" /> : <FiSquare className="text-spark-ink/30 dark:text-white/30 shrink-0" />}
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-spark-ink dark:text-white truncate">{c.studentName} <span className="font-normal text-spark-ink/40 dark:text-white/40">· Class {c.class} · {c.rollNo}</span></p>
                    <p className="text-xs text-spark-ink/40 dark:text-white/40">{hasNumber ? c.parentMobile : 'No phone number on file'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      )}

      <button
        onClick={sendToSelected}
        disabled={sending || !message.trim() || selected.size === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
      >
        <FiSend /> {sending ? `Opening ${sentCount}/${selected.size}...` : `Send to ${selected.size} ${selected.size === 1 ? 'Family' : 'Families'}`}
      </button>
    </div>
  )
}
