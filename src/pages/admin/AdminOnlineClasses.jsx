import { useEffect, useState } from 'react'
import { FiVideo, FiCopy, FiExternalLink, FiClock } from 'react-icons/fi'
import { getOnlineClasses } from '../../services/api/sheetsApi.js'
import { loadCached, saveCache } from '../../utils/pageCache.js'
import { SkeletonTable } from '../../components/Skeleton.jsx'
import EmptyState from '../../components/EmptyState.jsx'

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

function groupByDay(entries) {
  const groups = {}
  entries.forEach((e) => {
    const day = DAY_ORDER.find((d) => d.toLowerCase() === e.day.toLowerCase()) || e.day
    if (!groups[day]) groups[day] = []
    groups[day].push(e)
  })
  return DAY_ORDER.filter((d) => groups[d]).map((d) => [d, groups[d]])
}

export default function AdminOnlineClasses() {
  const [classes, setClasses] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState(null)

  useEffect(() => {
    const cached = loadCached('spark_cache_online_classes')
    if (cached) {
      setClasses(cached)
      setLoading(false)
    }
    getOnlineClasses().then((data) => {
      setClasses(data)
      setLoading(false)
      saveCache('spark_cache_online_classes', data)
    })
  }, [])

  const copyLink = (entry) => {
    navigator.clipboard.writeText(entry.meetingLink)
    setCopiedId(entry.id)
    setTimeout(() => setCopiedId(null), 1500)
  }

  if (loading) return <SkeletonTable rows={5} />

  const grouped = groupByDay(classes)

  return (
    <div className="space-y-6">
      <h2 className="font-display font-bold text-xl text-spark-ink dark:text-white flex items-center gap-2">
        <FiVideo className="text-spark-orange" /> Online Classes
      </h2>
      <p className="text-sm text-spark-ink/50 dark:text-white/50">
        Every student with a Google Meet link on their timetable, organized by day. Add a link to any timetable slot in Manage Timetable to have it show up here.
      </p>

      {classes.length === 0 ? (
        <EmptyState message="No online classes set up yet — add a meeting link to a timetable slot in Manage Timetable." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, entries]) => (
            <div key={day} className="bg-white dark:bg-white/5 rounded-xl2 shadow-card border border-spark-ink/5 dark:border-white/10 overflow-hidden">
              <h3 className="font-display font-bold text-spark-ink dark:text-white px-6 pt-5 pb-3">{day}</h3>
              <div className="divide-y divide-spark-ink/5 dark:divide-white/5">
                {entries.map((e) => (
                  <div key={e.id} className="flex items-center justify-between gap-3 px-6 py-4 flex-wrap">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-spark-ink dark:text-white">{e.studentName} <span className="font-normal text-spark-ink/40 dark:text-white/40">· Class {e.class} · {e.rollNo}</span></p>
                      <p className="text-sm text-spark-ink/60 dark:text-white/60 mt-0.5">{e.subject}</p>
                      <p className="text-xs text-spark-ink/40 dark:text-white/40 mt-1 flex items-center gap-1"><FiClock size={11} /> {e.time}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => copyLink(e)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-spark-ink/10 dark:border-white/10 text-xs font-semibold text-spark-ink/70 dark:text-white/70 hover:border-spark-orange hover:text-spark-orange transition-colors"
                      >
                        <FiCopy size={13} /> {copiedId === e.id ? 'Copied!' : 'Copy Link'}
                      </button>
                      <a
                        href={e.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-spark-gradient text-white text-xs font-bold shadow-soft hover:shadow-card-hover transition-all"
                      >
                        <FiExternalLink size={13} /> Join
                      </a>
                    </div>
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
