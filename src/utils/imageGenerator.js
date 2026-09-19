import { summarizeAttendance } from './format.js'
import { gradeFromPercent } from '../services/api/mockData.js'

const BRAND_ORANGE = '#FF6B00'
const INK = '#1A1A1A'
const MUTED = '#787878'
const PEACH = '#FFF1E6'

/**
 * Generates a compact, WhatsApp-friendly PNG "report card" image —
 * a single-screen summary, not the full multi-page PDF. Parents can see
 * this inline in a WhatsApp chat without downloading and opening a
 * document, which is the whole point of offering an image alongside
 * the existing PDF option.
 *
 * Built by rendering a detached, off-screen DOM node (styled with plain
 * inline CSS so it renders correctly even though it's briefly appended
 * outside the normal page flow) and capturing it with html2canvas. This
 * means it works for ANY month's data passed in, independent of
 * whatever is currently visible on screen.
 *
 * Requires the html2canvas package: npm install html2canvas
 */
export async function generateMonthlyReportImage({ student, attendance, marks, monthLabel, skipSave = false }) {
  const html2canvas = (await import('html2canvas')).default

  const studentName = student.name || student.studentName || ''
  const summary = summarizeAttendance(attendance)

  const card = document.createElement('div')
  card.style.cssText = `
    position: fixed;
    left: -9999px;
    top: 0;
    width: 600px;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    color: ${INK};
    padding: 32px;
    box-sizing: border-box;
  `

  const marksRows = marks.length
    ? marks.map((m) => `
        <tr>
          <td style="padding:8px 0;border-top:1px solid #eee;">${m.subject}</td>
          <td style="padding:8px 0;border-top:1px solid #eee;text-align:center;">${m.score}/${m.max}</td>
          <td style="padding:8px 0;border-top:1px solid #eee;text-align:right;font-weight:bold;color:${BRAND_ORANGE};">${gradeFromPercent(Math.round((m.score / m.max) * 100))}</td>
        </tr>`).join('')
    : `<tr><td colspan="3" style="padding:12px 0;color:${MUTED};font-style:italic;">No test marks recorded yet.</td></tr>`

  card.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid ${BRAND_ORANGE};padding-bottom:16px;margin-bottom:20px;">
      <div>
        <div style="font-size:24px;font-weight:800;color:${BRAND_ORANGE};">SPARK</div>
        <div style="font-size:11px;color:${MUTED};margin-top:2px;">Educate &bull; Empower &bull; Enrich</div>
      </div>
      <div style="text-align:right;">
        <div style="font-size:14px;font-weight:bold;">Monthly Report</div>
        <div style="font-size:11px;color:${MUTED};margin-top:2px;">${monthLabel}</div>
      </div>
    </div>

    <div style="margin-bottom:20px;">
      <div style="font-size:18px;font-weight:bold;">${studentName}</div>
      <div style="font-size:12px;color:${MUTED};margin-top:2px;">Class ${student.class || ''} &middot; Roll No. ${student.rollNo || ''}</div>
    </div>

    <div style="display:flex;gap:12px;margin-bottom:24px;">
      ${[
        ['Present', summary.present],
        ['Absent', summary.absent],
        ['Attendance %', summary.pct + '%']
      ].map(([label, value]) => `
        <div style="flex:1;background:${PEACH};border-radius:12px;padding:14px 8px;text-align:center;">
          <div style="font-size:20px;font-weight:800;color:${BRAND_ORANGE};font-family:'Courier New',monospace;">${value}</div>
          <div style="font-size:10px;color:${MUTED};font-weight:600;margin-top:4px;">${label}</div>
        </div>
      `).join('')}
    </div>

    <div>
      <div style="font-size:14px;font-weight:bold;margin-bottom:8px;">Subject Marks</div>
      <table style="width:100%;border-collapse:collapse;font-size:13px;">
        <tbody>${marksRows}</tbody>
      </table>
    </div>

    <div style="margin-top:24px;padding-top:14px;border-top:1px solid #eee;text-align:center;font-size:10px;color:${MUTED};">
      sparktution22@gmail.com &bull; Instagram: @spark.v_s1102
    </div>
  `

  document.body.appendChild(card)

  try {
    const canvas = await html2canvas(card, { scale: 2, backgroundColor: '#ffffff' })
    const dataUrl = canvas.toDataURL('image/png')

    if (!skipSave) {
      const link = document.createElement('a')
      link.href = dataUrl
      link.download = `SPARK_Report_${studentName.replace(/\s+/g, '_')}_${monthLabel.replace(/\s+/g, '_')}.png`
      link.click()
    }

    return dataUrl
  } finally {
    document.body.removeChild(card)
  }
}
