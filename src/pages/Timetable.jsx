import { useEffect, useState } from 'react'
import { FiClock, FiVideo } from 'react-icons/fi'
import { useStudentContext } from '../../contexts/StudentContext.jsx'
import { getTimetable } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import StudentSwitcher from '../../components/StudentSwitcher.jsx'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export default function Timetable() {
  const { selectedStudentId } = useStudentContext()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!selectedStudentId) return
    const cacheKey = 'spark_cache_timetable_' + selectedStudentId
    const cached = loadCached(cacheKey)
    if (cached) {
      setEntries(cached)
      setLoading(false)
    } else {
      setLoading(true)
    }
    getTimetable(selectedStudentId).then((data) => {
      setEntries(data)
      setLoading(false)
      saveCache(cacheKey, data)
    })
  }, [selectedStudentId])

  const byDay = DAYS.reduce((acc, day) => {
    acc[day] = entries.filter((e) => e.day.toLowerCase() === day.toLowerCase())
    return acc
  }, {})

  if (loading) return <SkeletonTable rows={5} />

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <StudentSwitcher />
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={FiClock} title="No timetable yet" description="Your weekly schedule will show up here once it's added." />
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {DAYS.filter((d) => byDay[d].length > 0).map((day) => (
            <div key={day} className="bg-white dark:bg-white/5 rounded-xl2 shadow-card p-5 border border-spark-ink/5 dark:border-white/10">
              <h3 className="font-display font-bold text-spark-orange mb-3">{day}</h3>
              <div className="space-y-3">
                {byDay[day].map((e) => (
                  <div key={e.id} className="pb-3 border-b border-spark-ink/5 dark:border-white/10 last:border-0 last:pb-0">
                    <p className="text-sm font-semibold text-spark-ink dark:text-white">{e.subject}</p>
                    <p className="text-xs text-spark-ink/50 dark:text-white/50 flex items-center gap-1 mt-0.5">
                      <FiClock size={11} /> {e.time}
                    </p>
                    {e.meetingLink && (
                      <a
                        href={e.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500 text-white text-xs font-bold w-fit"
                      >
                        <FiVideo size={12} /> Join Class
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
