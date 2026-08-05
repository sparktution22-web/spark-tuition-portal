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
export function generateMonthlyReportPDF({ student, attendance, marks, monthLabel = 'August 2026' }) {
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
  doc.text(`Academic Year 2026-2027  \u00b7  ${monthLabel}`, pageWidth - margin, 60, { align: 'right' })

  y += 18
  doc.setDrawColor(230, 230, 230)
  doc.line(margin, y, pageWidth - margin, y)
  y += 22

  // --- Student info block ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(14)
  doc.setTextColor(...INK)
  doc.text(student.name, margin, y)

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text(`Class ${student.class}   \u00b7   Roll No. ${student.rollNo}   \u00b7   Days: Mon-Sat   \u00b7   Slot: 5 PM - 7 PM`, margin, y + 16)

  const summary = summarizeAttendance(attendance)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.setTextColor(...BRAND_ORANGE)
  doc.text(`Total Classes: ${summary.total}   \u00b7   Attendance: ${summary.pct}%`, pageWidth - margin, y, { align: 'right' })

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
      ['Holiday', summary.holiday],
      ['Late', summary.late],
      ['Attendance %', `${summary.pct}%`]
    ],
    styles: { fontSize: 9, cellPadding: 5, textColor: INK },
    theme: 'plain',
    columnStyles: { 0: { fontStyle: 'bold' } }
  })
  const summaryEndY = doc.lastAutoTable.finalY

  const overallPct = marks.length ? Math.round(marks.reduce((s, m) => s + m.score, 0) / marks.length) : 0
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.setTextColor(...INK)
  doc.text('Subject Marks', margin + 280, y)
  autoTable(doc, {
    startY: y + 8,
    margin: { left: margin + 280 },
    tableWidth: pageWidth - margin - (margin + 280),
    head: [['Subject', 'Score', 'Grade']],
    body: marks.map((m) => [m.subject, `${m.score}/${m.max}`, gradeFromPercent(m.score)]),
    foot: [['Overall', `${overallPct}%`, gradeFromPercent(overallPct)]],
    styles: { fontSize: 8.5, cellPadding: 4, textColor: INK },
    headStyles: { fillColor: BRAND_ORANGE, textColor: [255, 255, 255], fontStyle: 'bold' },
    footStyles: { fillColor: [255, 233, 217], textColor: INK, fontStyle: 'bold' },
    theme: 'grid'
  })
  const marksEndY = doc.lastAutoTable.finalY

  y = Math.max(summaryEndY, marksEndY) + 30

  // --- Teacher remarks ---
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...INK)
  doc.text('Teacher Remarks', margin, y)
  doc.setDrawColor(230, 230, 230)
  doc.rect(margin, y + 8, pageWidth - margin * 2, 40)
  doc.setFont('helvetica', 'italic')
  doc.setFontSize(9)
  doc.setTextColor(...MUTED)
  doc.text('Consistent effort this month. Keep focusing on Social Studies revision.', margin + 8, y + 26)

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

  doc.save(`SPARK_Report_${student.name.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.pdf`)
}
