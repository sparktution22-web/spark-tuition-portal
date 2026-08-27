import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

// A palette that cycles if there are more subjects than colors —
// matches the app's orange brand color as the first/most prominent line.
const COLORS = ['#F97316', '#0EA5E9', '#22C55E', '#A855F7', '#EF4444', '#EAB308', '#14B8A6', '#EC4899']

// Parses 'dd.MM.yyyy' into a Date for correct chronological sorting —
// the marks array isn't guaranteed to already be in date order.
function parseDate(dateStr) {
  const [d, m, y] = String(dateStr).split('.')
  return new Date(Number(y), Number(m) - 1, Number(d))
}

export default function MarksTrendChart({ marks }) {
  if (!marks || marks.length < 2) {
    // A trend needs at least two points to mean anything — with 0 or 1
    // tests, there's nothing to show a line for.
    return (
      <div className="flex items-center justify-center h-48 text-sm text-spark-ink/40 dark:text-white/40">
        Need at least two tests to show a trend.
      </div>
    )
  }

  const sorted = [...marks].sort((a, b) => parseDate(a.date) - parseDate(b.date))
  const subjects = [...new Set(sorted.map((m) => m.subject))]

  // One row per test DATE, with each subject's percentage as its own
  // column — this is the shape recharts needs to draw one line per
  // subject on a shared timeline. A test date with no entry for a given
  // subject just leaves that line with a gap there, which recharts
  // handles by default (connectNulls left off intentionally, so gaps
  // show as gaps rather than misleadingly joining unrelated points).
  const chartData = sorted.map((m) => {
    const row = { date: m.date, label: `${m.date}${m.testName ? ' \u2014 ' + m.testName : ''}` }
    row[m.subject] = m.max ? Math.round((m.score / m.max) * 100) : 0
    return row
  })

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top: 8, right: 16, left: -16, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e0d8" />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} tickFormatter={(v) => `${v}%`} />
        <Tooltip
          formatter={(value) => [`${value}%`, '']}
          labelFormatter={(_, payload) => payload?.[0]?.payload?.label || ''}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {subjects.map((subject, i) => (
          <Line
            key={subject}
            type="monotone"
            dataKey={subject}
            stroke={COLORS[i % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
