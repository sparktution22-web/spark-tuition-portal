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
  const total = records.length - holiday
  return {
    present,
    absent,
    holiday,
    late,
    total,
    pct: total ? Math.round((present / total) * 100) : 0
  }
}
