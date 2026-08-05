import { useEffect, useState } from 'react'
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiKey } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { motion, AnimatePresence } from 'framer-motion'
import { getStudents, addStudent, updateStudent, deleteStudent } from '../../services/api/sheetsApi.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'
import { FiUsers } from 'react-icons/fi'

function StudentModal({ student, onClose, onSave }) {
  const { register, handleSubmit, formState: { errors } } = useForm({ defaultValues: student || {} })

  const submit = (data) => {
    onSave(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-5" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white dark:bg-spark-dark rounded-xl3 shadow-card-hover w-full max-w-md p-7"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-display font-bold text-lg text-spark-ink dark:text-white">
            {student ? 'Edit Student' : 'Add Student'}
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-spark-peach dark:hover:bg-white/10">
            <FiX className="text-spark-ink dark:text-white" />
          </button>
        </div>
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Full Name</label>
            <input {...register('name', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
            {errors.name && <p className="text-xs text-red-500 mt-1">Name is required</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Class</label>
              <input {...register('class', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
            </div>
            <div>
              <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Roll No.</label>
              <input type="number" {...register('rollNo', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Parent Email</label>
            <input type="email" {...register('parentEmail', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
          </div>
          <div>
            <label className="text-xs font-semibold text-spark-ink/50 dark:text-white/50 mb-1.5 block">Student Email</label>
            <input type="email" {...register('studentEmail', { required: true })} className="w-full px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none" />
          </div>
          <button type="submit" className="w-full py-3 rounded-full bg-spark-gradient text-white font-bold shadow-soft hover:shadow-card-hover transition-all">
            {student ? 'Save Changes' : 'Add Student'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default function AdminStudents() {
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState(null) // null | 'add' | student object

  useEffect(() => {
    getStudents().then((data) => {
      setStudents(data)
      setLoading(false)
    })
  }, [])

  const filtered = students.filter(
    (s) => s.name.toLowerCase().includes(search.toLowerCase()) || String(s.rollNo).includes(search) || s.class.includes(search)
  )

  const handleSave = async (data) => {
    if (modal && modal !== 'add') {
      const updated = await updateStudent(modal.id, data)
      setStudents((list) => list.map((s) => (s.id === modal.id ? { ...s, ...updated } : s)))
    } else {
      const created = await addStudent(data)
      setStudents((list) => [...list, created])
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Remove this student? This cannot be undone.')) return
    await deleteStudent(id)
    setStudents((list) => list.filter((s) => s.id !== id))
  }

  const handleResetPassword = (student) => {
    alert(`Password reset link would be sent to ${student.parentEmail} (and ${student.studentEmail}).`)
  }

  if (loading) return <SkeletonTable rows={6} />

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-spark-ink/30" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, roll no, class..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 dark:bg-transparent dark:text-white text-sm focus:border-spark-orange outline-none"
          />
        </div>
        <button
          onClick={() => setModal('add')}
          className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-spark-gradient text-white font-bold text-sm shadow-soft hover:shadow-card-hover transition-all"
        >
          <FiPlus /> Add Student
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={FiUsers} title="No students found" description="Try a different search, or add a new student." />
      ) : (
        <div className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-spark-ink/40 dark:text-white/40 uppercase tracking-wide bg-spark-surface dark:bg-white/5">
                  <th className="px-6 py-3 font-semibold">Name</th>
                  <th className="px-6 py-3 font-semibold">Class</th>
                  <th className="px-6 py-3 font-semibold">Roll No.</th>
                  <th className="px-6 py-3 font-semibold hidden md:table-cell">Parent Email</th>
                  <th className="px-6 py-3 font-semibold hidden lg:table-cell">Joined</th>
                  <th className="px-6 py-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s) => (
                  <tr key={s.id} className="border-t border-spark-ink/5 dark:border-white/5 hover:bg-spark-peach/30 dark:hover:bg-white/5 transition-colors">
                    <td className="px-6 py-3.5 font-semibold text-spark-ink dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-spark-gradient text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {s.name[0]}
                      </div>
                      {s.name}
                    </td>
                    <td className="px-6 py-3.5 text-spark-ink/70 dark:text-white/70">{s.class}</td>
                    <td className="px-6 py-3.5 font-mono text-spark-ink/70 dark:text-white/70">{s.rollNo}</td>
                    <td className="px-6 py-3.5 text-spark-ink/50 dark:text-white/50 hidden md:table-cell">{s.parentEmail}</td>
                    <td className="px-6 py-3.5 text-spark-ink/50 dark:text-white/50 hidden lg:table-cell">{s.joined}</td>
                    <td className="px-6 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => handleResetPassword(s)} title="Reset password" className="p-2 rounded-lg hover:bg-spark-peach dark:hover:bg-white/10 text-spark-ink/50 dark:text-white/50 hover:text-spark-orange transition-colors">
                          <FiKey size={15} />
                        </button>
                        <button onClick={() => setModal(s)} title="Edit" className="p-2 rounded-lg hover:bg-spark-peach dark:hover:bg-white/10 text-spark-ink/50 dark:text-white/50 hover:text-spark-orange transition-colors">
                          <FiEdit2 size={15} />
                        </button>
                        <button onClick={() => handleDelete(s.id)} title="Delete" className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10 text-spark-ink/50 dark:text-white/50 hover:text-red-500 transition-colors">
                          <FiTrash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <AnimatePresence>
        {modal && (
          <StudentModal
            student={modal === 'add' ? null : modal}
            onClose={() => setModal(null)}
            onSave={handleSave}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
