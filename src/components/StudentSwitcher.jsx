import { useStudentContext } from '../contexts/StudentContext.jsx'

export default function StudentSwitcher() {
  const { students, selectedStudentId, setSelectedStudentId, canSwitch } = useStudentContext()

  if (!canSwitch) return null

  return (
    <select
      value={selectedStudentId || ''}
      onChange={(e) => setSelectedStudentId(e.target.value)}
      className="px-4 py-2.5 rounded-xl border border-spark-ink/10 dark:border-white/10 bg-white dark:bg-white/5 text-sm font-semibold text-spark-ink dark:text-white focus:border-spark-orange outline-none transition-colors"
    >
      {students.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name} · Class {s.class} · Roll {s.rollNo}
        </option>
      ))}
    </select>
  )
}
