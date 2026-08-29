export function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount)
}
export function percent(part, total) {
  if (!total) return 0
  return Math.round((part / total) * 100)
}
export function summarizeAttendance(records) {
  const present = records.filter((r) => r.status === 'Present' || r.status === 'Late').length
  const absent = records.filter((r) => r.status === 'Absent').length
  // "No Class" days no longer produce a 'Holiday' status at all — the
  // backend now excludes them entirely (same as an unrecorded future
  // day, status: null), since a Holiday and a "No Class" day are
  // different concepts and neither should be counted toward attendance.
  // This field is kept only for backward compatibility with any old
  // cached data that still has the previous status — it will always be
  // 0 for anything fetched fresh going forward.
  const holiday = records.filter((r) => r.status === 'Holiday').length
  const late = records.filter((r) => r.status === 'Late').length
  // Only days that actually happened count toward the total — future/
  // not-yet-happened AND "No Class" days (both status: null) are
  // correctly excluded, rather than inflating the total as if they'd
  // already happened and been missed.
  const total = present + absent
  return {
    present,
    absent,
    holiday,
    late,
    total,
    pct: total ? Math.round((present / total) * 100) : 0
  }
}
