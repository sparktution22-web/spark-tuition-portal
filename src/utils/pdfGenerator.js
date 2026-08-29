import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import { summarizeAttendance } from './format.js'
import { gradeFromPercent } from '../services/api/mockData.js'

const BRAND_ORANGE = [255, 107, 0]
const INK = [26, 26, 26]
const MUTED = [120, 120, 120]

/**
 * Generates the official-looking monthly report card PDF and triggers a
 * download. Matches the spec: header/branding, student info, day-wise
 * attendance table, summary, subject marks, remarks, and signature lines.
 */
export function generateMonthlyReportPDF({ student, attendance, marks, monthLabel = 'August 2026', performanceSummary }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  let y = 40

  // --- Header band ---
  doc.setFillColor(...BRAND_ORANGE)
  doc.rect(0, 0, pageWidth, 8, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.setTextColor(...BRAND_ORANGE)
  doc.text('SPARK', margin, (y += 36))

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Educate  \u2022  Empower  \u2022  Enrich', margin, (y += 14))

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(13)
  doc.setTextColor(...INK)
  doc.text('Monthly Student Report', pageWidth - margin, 46, { align: 'right' })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`Academic Year ${student.academicYear || '2026-2027'}  \u00b7  ${monthLabel}`, pageWidth - margin, 60, { align: 'right' })

  y += 18
  doc.setDrawColor(230, 230, 230)
  doc.line(margin, y, pageWidth - margin, y)
  y += 22

  // --- Student info block ---
  // student.name comes from mock data / StudentContext; student.studentName
  // comes from the real backend's getStudentDetails_ — fall back between
  // the two so this works with either shape.
  const studentName = student.name || student.studentName || ''
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...INK)
  doc.text(studentName, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  // Real days/slot when available — no more hardcoded "Mon-Sat, 5-7 PM"
  // that was wrong for any student not on exactly that schedule.
  const daysSlot = student.days || student.slot
    ? `Days: ${student.days || '\u2014'}   \u00b7   Slot: ${student.slot || '\u2014'}`
    : ''
  doc.text(
    `Class ${student.class}   \u00b7   Roll No. ${student.rollNo}` + (daysSlot ? `   \u00b7   ${daysSlot}` : ''),
    margin,
    y + 16
  )

  const summary = summarizeAttendance(attendance)
  // Deliberately uses the SAME real, computed total (present + absent)
  // that the summary table below is built from — not a separately
  // admin-entered "planned total for the month" figure, which could
  // easily disagree with the actual recorded data (e.g. if it was never
  // updated to reflect an actual holiday, or the month isn't finished
  // yet). Showing two different numbers that were never guaranteed to
  // reconcile was exactly what confused parents into thinking "No
  // Class" days were being silently folded into "Absent" — they never
  // were (see summarizeAttendance in format.js: Holiday and Absent are
  // always kept strictly separate), the two totals just didn't match up
  // visually. Using one single source of truth for both numbers fixes
  // that at the root.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_ORANGE)
  doc.text(`Classes So Far: ${summary.total}   \u00b7   Attendance: ${summary.pct}%`, pageWidth - margin, y, { align: 'right' })

  y += 34

  // --- Attendance table ---
  autoTable(doc, {
    startY: y,
    margin: { left: margin, right: margin },
    head: [['S.No', 'Date', 'Day', 'Subject', 'Topic', 'Time In', 'Time Out', 'Duration', 'Status', 'Remarks']],
    body: attendance.map((r) => [r.sNo, r.date, r.day, r.subject, r.topic, r.timeIn, r.timeOut, r.duration, r.status, r.remarks || '-']),
    styles: { fontSize: 7.5, cellPadding: 4, textColor: INK },
    headStyles: { fillColor: BRAND_ORANGE, textColor: [255, 255, 255], fontStyle: 'bold' },
    alternateRowStyles: { fillColor: [255, 248, 242] },
    theme: 'grid'
  })

  y = doc.lastAutoTable.finalY + 24

  // --- Summary + Marks side by side ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Attendance Summary', margin, y)
  autoTable(doc, {
    startY: y + 8,
    margin: { left: margin },
    tableWidth: 250,
    body: [
      ['Present', summary.present],
      ['Absent', summary.absent],
      ['Late', summary.late],
      ['Attendance %', `${summary.pct}%`]
    ],
    styles: { fontSize: 9, cellPadding: 5, textColor: INK },
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold' } }
  })
  const summaryEndY = doc.lastAutoTable.finalY

  doc.setFont('helvetica', 'italic')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text('"No Class" days are excluded entirely and never counted toward attendance \u2014 only Present and Absent make up the total above.', margin, summaryEndY + 12)

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Subject Marks', margin + 280, y)
  if (marks.length === 0) {
    doc.setFont('helvetica', 'italic')
    doc.setFontSize(9)
    doc.setTextColor(...MUTED)
    doc.text('No test marks recorded yet.', margin + 280, y + 22)
  } else {
    autoTable(doc, {
      startY: y + 8,
      margin: { left: margin + 280 },
      tableWidth: pageWidth - margin - (margin + 280),
      head: [['Subject', 'Score', 'Grade']],
      // Grade is computed from each test's actual PERCENTAGE
      // (score/max), not the raw score — a raw score of e.g. 26 isn't
      // meaningful as a percentage unless the test happened to be out
      // of exactly 100. No "Overall" row — averaging raw scores across
      // tests with different max marks produced a meaningless number
      // (see Performance Feedback below for actual test-by-test
      // performance instead of one misleading combined figure).
      body: marks.map((m) => [m.subject, `${m.score}/${m.max}`, gradeFromPercent(Math.round((m.score / m.max) * 100))]),
      styles: { fontSize: 8.5, cellPadding: 4, textColor: INK },
      headStyles: { fillColor: BRAND_ORANGE, textColor: [255, 255, 255], fontStyle: 'bold' },
      theme: 'grid'
    })
  }
  const marksEndY = doc.lastAutoTable ? doc.lastAutoTable.finalY : summaryEndY

  y = Math.max(summaryEndY, marksEndY) + 30

  // --- Overall monthly performance summary + improvement points (AI-
  // synthesized across all of this month's tests) — shown before the
  // per-test breakdown below, since this is the "big picture" view. ---
  if (performanceSummary && (performanceSummary.summary || performanceSummary.improvementPoints?.length)) {
    if (performanceSummary.summary) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text('This Month\u2019s Performance', margin, y)
      y += 16
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...MUTED)
      const wrappedSummary = doc.splitTextToSize(performanceSummary.summary, pageWidth - margin * 2)
      doc.text(wrappedSummary, margin, y)
      y += wrappedSummary.length * 11 + 16
    }
    if (performanceSummary.improvementPoints && performanceSummary.improvementPoints.length > 0) {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(10)
      doc.setTextColor(...INK)
      doc.text('Points to Improve', margin, y)
      y += 16
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...MUTED)
      performanceSummary.improvementPoints.forEach((point) => {
        const wrapped = doc.splitTextToSize('\u2022 ' + point, pageWidth - margin * 2)
        doc.text(wrapped, margin, y)
        y += wrapped.length * 11 + 4
      })
      y += 12
    }
  }

  // --- Per-test feedback (from AI-graded tests that have real feedback
  // text saved with them; manually-entered marks have none) ---
  const marksWithFeedback = marks.filter((m) => m.feedback && m.feedback.trim())
  if (marksWithFeedback.length > 0) {
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(10)
    doc.setTextColor(...INK)
    doc.text('Test-by-Test Feedback', margin, y)
    y += 16
    marksWithFeedback.forEach((m) => {
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(8.5)
      doc.setTextColor(...INK)
      const label = m.testName ? `${m.subject} \u2014 ${m.testName}` : m.subject
      doc.text(label, margin, y)
      y += 12
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8.5)
      doc.setTextColor(...MUTED)
      const wrapped = doc.splitTextToSize(m.feedback, pageWidth - margin * 2)
      doc.text(wrapped, margin, y)
      y += wrapped.length * 11 + 10
    })
    y += 10
  }

  // --- Teacher remarks ---
  // Left blank for the teacher to fill in by hand (or wire up a real
  // remarks source later) — previously this line was hardcoded fake text
  // ("Consistent effort this month...") that showed up on every single
  // report regardless of whether any teacher actually wrote it.
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Teacher Remarks', margin, y)
  doc.setDrawColor(230, 230, 230)
  doc.rect(margin, y + 8, pageWidth - margin * 2, 40)

  y += 70

  // --- Simple QR placeholder mark ---
  const qrSize = 46
  const qrX = pageWidth - margin - qrSize
  doc.setDrawColor(...INK)
  const cell = qrSize / 6
  const pattern = [1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1]
  pattern.forEach((v, i) => {
    if (!v) return
    const row = Math.floor(i / 6)
    const col = i % 6
    doc.setFillColor(...INK)
    doc.rect(qrX + col * cell, y + row * cell, cell, cell, 'F')
  })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7)
  doc.setTextColor(...MUTED)
  doc.text('Scan to verify', qrX + qrSize / 2, y + qrSize + 10, { align: 'center' })

  // --- Signatures ---
  doc.setDrawColor(180, 180, 180)
  doc.line(margin, y + 45, margin + 160, y + 45)
  doc.setFontSize(8)
  doc.setTextColor(...MUTED)
  doc.text('Parent Signature', margin, y + 57)

  doc.line(margin + 200, y + 45, margin + 360, y + 45)
  doc.text('Student Signature', margin + 200, y + 57)

  // --- Footer ---
  const pageHeight = doc.internal.pageSize.getHeight()
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.5)
  doc.setTextColor(...MUTED)
  doc.text(
    `Generated on ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}  \u00b7  SPARK Tuition Management Portal`,
    pageWidth / 2,
    pageHeight - 24,
    { align: 'center' }
  )

  doc.save(`SPARK_Report_${studentName.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`)
}
