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
  const holiday = records.filter((r) => r.status === 'Holiday').length
  const late = records.filter((r) => r.status === 'Late').length
  // Only days that actually happened count toward the total — Holiday
  // days were already excluded, but future/not-yet-happened days (which
  // have no status yet, i.e. neither Present nor Absent) were previously
  // being counted too (records.length - holiday), which inflated the
  // "total classes" number and deflated the percentage by treating the
  // rest of the month as if it had already happened and been missed.
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
