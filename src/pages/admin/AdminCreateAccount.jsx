import { useEffect, useState } from 'react'
import { createUserWithEmailAndPassword, signOut } from 'firebase/auth'
import { FiUserPlus, FiCopy, FiCheckCircle, FiAlertCircle, FiUsers } from 'react-icons/fi'
import { secondaryAuth } from '../../services/firebase/secondaryAuth.js'
import { getStudents, flagPasswordChangeRequired, linkStudentToParent } from '../../services/api/sheetsApi.js'

// A short, easy-to-read-aloud-or-type temporary password — avoids
// visually ambiguous characters (0/O, 1/l/I) since admin will be sharing
// this verbally or over WhatsApp, not copy-pasting from a password manager.
function generateTempPassword() {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  let pwd = ''
  for (let i = 0; i < 8; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)]
  }
  return pwd
}

export default function AdminCreateAccount() {
  const [students, setStudents] = useState([])
  const [selectedId, setSelectedId] = useState('')
  const [role, setRole] = useState('parent')
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null) // { email, password, name }
  const [copied, setCopied] = useState(false)
  const [needsReset, setNeedsReset] = useState('') // email that already has an account and needs the delete-then-recreate flow

  // Separate small form for linking an additional child to an EXISTING
  // parent login — for parents who have more than one child at SPARK.
  const [linkEmail, setLinkEmail] = useState('')
  const [linkStudentId, setLinkStudentId] = useState('')
  const [linking, setLinking] = useState(false)
  const [linkError, setLinkError] = useState('')
  const [linkSuccess, setLinkSuccess] = useState('')

  useEffect(() => {
    getStudents().then(setStudents)
  }, [])

  const selectedStudent = students.find((s) => s.id === selectedId)

  const createAccount = async (e) => {
    e.preventDefault()
    setError('')
    setCreated(null)
    if (!selectedId) {
      setError('Choose a student first.')
      return
    }

    const email = `${selectedId.toLowerCase()}-${role}@spark.local`
    const tempPassword = generateTempPassword()

    setCreating(true)
    try {
      // Created on the SECONDARY auth instance — this does not touch or
      // sign out the admin's own session on the primary one.
      await createUserWithEmailAndPassword(secondaryAuth, email, tempPassword)
      await signOut(secondaryAuth) // secondary instance only — admin stays logged in

      await flagPasswordChangeRequired(email)

      setCreated({ email, password: tempPassword, name: selectedStudent?.name, role })
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        // Client-side Firebase Auth can't reset or delete another
        // account's password directly — the real fix is deleting the
        // old login in Firebase Console, then creating it fresh here.
        setNeedsReset(email)
      } else {
        setError(err.message || 'Could not create the account. Please try again.')
      }
    } finally {
      setCreating(false)
    }
  }

  const copyDetails = () => {
    if (!created) return
    const text = `SPARK Login\nRoll No: ${selectedId}\nRole: ${created.role}\nEmail: ${created.email}\nTemporary Password: ${created.password}\n\nPlease log in and set your own password when prompted.`
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-4 flex items-center gap-2">
          <FiUserPlus className="text-spark-orange" /> Create a Login
        </h3>
        <form onSubmit={createAccount} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Student</label>
            <select
              value={selectedId}
              onChange={(e) => { setSelectedId(e.target.value); setCreated(null); setError(''); setNeedsReset('') }}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            >
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.rollNo} (Class {s.class})</option>
              ))}
            </select>
          </div>

          <div>
            <span className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Login Type</span>
            <div className="grid grid-cols-2 gap-2">
              {[
                { key: 'parent', label: 'Parent' },
                { key: 'student', label: 'Student' }
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => { setRole(opt.key); setCreated(null); setError(''); setNeedsReset('') }}
                  className={`py-2.5 rounded-xl border font-semibold text-sm transition-colors ${
                    role === opt.key
                      ? 'border-spark-orange bg-spark-orange/10 text-spark-orange'
                      : 'border-spark-ink/10 dark:border-white/10 text-spark-ink/60 dark:text-white/60'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
              <FiAlertCircle className="shrink-0 mt-0.5" size={14} /> {error}
            </p>
          )}

          {needsReset && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-400 flex items-start gap-2">
                <FiAlertCircle className="shrink-0 mt-0.5" size={14} />
                A login already exists for this email — to reset it, delete the old one first, then create it fresh.
              </p>
              <ol className="text-xs text-amber-800/90 dark:text-amber-400/90 space-y-1.5 list-decimal list-inside">
                <li>Open <a href="https://console.firebase.google.com/project/sparkknowledgeacademy1/authentication/users" target="_blank" rel="noreferrer" className="underline font-semibold">Firebase Console \u2192 Users</a></li>
                <li>Search for <span className="font-mono bg-white/50 dark:bg-black/20 px-1 rounded">{needsReset}</span></li>
                <li>Click the three-dot menu next to it \u2192 <b>Delete account</b></li>
                <li>Come back here and click <b>Create Login</b> again \u2014 same student, same login type</li>
              </ol>
            </div>
          )}

          <button
            type="submit"
            disabled={creating}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all disabled:opacity-60"
          >
            <FiUserPlus /> {creating ? 'Creating...' : needsReset ? 'Try Again' : 'Create Login'}
          </button>
        </form>
      </div>

      {created && (
        <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-xl2 p-6">
          <p className="flex items-center gap-2 font-display font-bold text-emerald-700 dark:text-emerald-400 mb-4">
            <FiCheckCircle /> Login created for {created.name}
          </p>
          <div className="bg-white dark:bg-white/5 rounded-xl p-4 space-y-2 mb-4 font-mono text-sm">
            <p><span className="text-spark-ink/40 dark:text-white/40 font-sans">Email:</span> {created.email}</p>
            <p><span className="text-spark-ink/40 dark:text-white/40 font-sans">Temporary Password:</span> <span className="font-bold">{created.password}</span></p>
          </div>
          <p className="text-xs text-emerald-700/80 dark:text-emerald-400/80 mb-4">
            Share these details with the {created.role} now — this password is shown only once and can't be
            retrieved again. They'll be asked to set their own password the first time they log in.
          </p>
          <button
            onClick={copyDetails}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-white/10 border border-emerald-300 dark:border-emerald-500/30 text-emerald-700 dark:text-emerald-400 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            <FiCopy size={14} /> {copied ? 'Copied!' : 'Copy Details'}
          </button>
        </div>
      )}

      <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-6 border border-spark-ink/5 dark:border-white/10">
        <h3 className="font-display font-bold text-spark-ink dark:text-white mb-1 flex items-center gap-2">
          <FiUsers className="text-spark-orange" /> Link Another Child
        </h3>
        <p className="text-sm text-spark-ink/50 dark:text-white/50 mb-5">
          For a parent who already has a login and has a second child at SPARK — this lets that
          SAME login switch between both kids, instead of needing a separate account for each.
        </p>
        <form
          onSubmit={async (e) => {
            e.preventDefault()
            setLinkError('')
            setLinkSuccess('')
            if (!linkEmail.trim() || !linkStudentId) {
              setLinkError('Enter the parent\u2019s existing login email and choose the child to add.')
              return
            }
            setLinking(true)
            try {
              await linkStudentToParent(linkEmail.trim(), linkStudentId)
              const student = students.find((s) => s.id === linkStudentId)
              setLinkSuccess(`${student?.name || linkStudentId} is now linked to ${linkEmail.trim()} — they'll see both children next time they log in.`)
              setLinkEmail('')
              setLinkStudentId('')
            } catch (err) {
              setLinkError(err.message || 'Could not link this child. Please try again.')
            } finally {
              setLinking(false)
            }
          }}
          className="space-y-4"
        >
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Parent's Existing Login Email</label>
            <input
              type="text"
              value={linkEmail}
              onChange={(e) => setLinkEmail(e.target.value)}
              placeholder="e.g. spk009-parent@spark.local"
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Child to Add</label>
            <select
              value={linkStudentId}
              onChange={(e) => setLinkStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
            >
              <option value="">Choose a student...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} — {s.rollNo} (Class {s.class})</option>
              ))}
            </select>
          </div>
          {linkError && (
            <p className="text-sm text-red-500 bg-red-50 rounded-lg px-3 py-2 flex items-start gap-2">
              <FiAlertCircle className="shrink-0 mt-0.5" size={14} /> {linkError}
            </p>
          )}
          {linkSuccess && (
            <p className="text-sm text-emerald-600 bg-emerald-50 rounded-lg px-3 py-2 flex items-start gap-2">
              <FiCheckCircle className="shrink-0 mt-0.5" size={14} /> {linkSuccess}
            </p>
          )}
          <button
            type="submit"
            disabled={linking}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-white dark:bg-white/10 border-2 border-spark-orange text-spark-orange font-bold hover:bg-spark-orange hover:text-white transition-all disabled:opacity-60"
          >
            <FiUsers /> {linking ? 'Linking...' : 'Link Child to This Login'}
          </button>
        </form>
      </div>
    </div>
  )
}
