import { useState } from 'react'

const TYPE_STYLES = {
  Holiday: { dot: 'bg-blue-500', label: 'Holiday' },
  Birthday: { dot: 'bg-pink-500', label: 'Birthday' },
  Test: { dot: 'bg-spark-orange', label: 'Test' },
  Important: { dot: 'bg-emerald-500', label: 'Important Day' }
}

const WEEKDAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

// events: [{ date: 'dd.MM.yyyy', type: 'Holiday'|'Birthday'|'Test'|'Important', title }]
// year, month: month is 1-12
export default function Calendar({ year, month, events = [] }) {
  const [hoveredDay, setHoveredDay] = useState(null)
  const firstOfMonth = new Date(year, month - 1, 1)
  const daysInMonth = new Date(year, month, 0).getDate()
  const startWeekday = firstOfMonth.getDay() // 0 = Sunday

  // Group events by day-of-month for quick lookup while rendering
  const eventsByDay = {}
  events.forEach((e) => {
    const day = parseInt(e.date.split('.')[0], 10)
    if (!eventsByDay[day]) eventsByDay[day] = []
    eventsByDay[day].push(e)
  })

  const cells = []
  for (let i = 0; i < startWeekday; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)

  const monthLabel = firstOfMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const today = new Date()
  const isCurrentMonth = today.getFullYear() === year && today.getMonth() + 1 === month

  return (
    <div>
      <p className="text-sm font-semibold text-spark-ink dark:text-white mb-3">{monthLabel}</p>

      <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-bold text-spark-ink/40 dark:text-white/40 mb-1">
        {WEEKDAY_LABELS.map((w, i) => (
          <div key={i}>{w}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (d === null) return <div key={i} />
          const dayEvents = eventsByDay[d] || []
          const isToday = isCurrentMonth && today.getDate() === d
          const isHovered = hoveredDay === d
          return (
            <div
              key={i}
              className="relative"
              onMouseEnter={() => dayEvents.length > 0 && setHoveredDay(d)}
              onMouseLeave={() => setHoveredDay(null)}
            >
              <div
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-xs ${
                  isToday
                    ? 'bg-spark-gradient text-white font-bold'
                    : 'text-spark-ink dark:text-white hover:bg-spark-peach/50 dark:hover:bg-white/5'
                } ${dayEvents.length > 0 ? 'cursor-help' : ''}`}
              >
                <span>{d}</span>
                {dayEvents.length > 0 && (
                  <div className="flex gap-0.5 mt-0.5">
                    {dayEvents.slice(0, 3).map((e, idx) => (
                      <span key={idx} className={`w-1.5 h-1.5 rounded-full ${TYPE_STYLES[e.type]?.dot || 'bg-spark-ink/30'}`} />
                    ))}
                  </div>
                )}
              </div>

              {isHovered && dayEvents.length > 0 && (
                <div className="absolute z-20 bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[220px] bg-spark-ink dark:bg-white text-white dark:text-spark-ink text-xs rounded-xl shadow-card-hover px-3 py-2.5 space-y-1.5">
                  {dayEvents.map((e, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className={`w-2 h-2 rounded-full mt-1 shrink-0 ${TYPE_STYLES[e.type]?.dot || 'bg-white/50'}`} />
                      <div>
                        <p className="font-bold leading-tight">{TYPE_STYLES[e.type]?.label || e.type}</p>
                        <p className="opacity-80 leading-tight">{e.title}</p>
                      </div>
                    </div>
                  ))}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-spark-ink dark:bg-white rotate-45 -mt-1" />
                </div>
              )}
            </div>
          )
        })}
      </div>

      <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-spark-ink/50 dark:text-white/50">
        {Object.entries(TYPE_STYLES).map(([key, s]) => (
          <span key={key} className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full ${s.dot} inline-block`} /> {s.label}
          </span>
        ))}
      </div>
    </div>
  )
}
