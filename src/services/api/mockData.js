// Mock dataset shaped exactly like what the Google Apps Script API will
// return once VITE_GOOGLE_SCRIPT_URL is wired up (see sheetsApi.js).
// Replace this file's role once the real endpoints exist — the shape
// returned by getStudents(), getAttendance() etc. should not need to change.

export const STUDENTS = [
  { id: 'S001', name: 'Aanya Menon', rollNo: 24, class: '8', parentEmail: 'parent1@demo.com', studentEmail: 'student1@demo.com', joined: '2025-06-01' },
  { id: 'S002', name: 'Kabir Nair', rollNo: 12, class: '8', parentEmail: 'parent2@demo.com', studentEmail: 'student2@demo.com', joined: '2025-06-01' },
  { id: 'S003', name: 'Diya Pillai', rollNo: 7, class: '7', parentEmail: 'parent3@demo.com', studentEmail: 'student3@demo.com', joined: '2025-07-15' },
  { id: 'S004', name: 'Rohan Varma', rollNo: 19, class: '9', parentEmail: 'parent4@demo.com', studentEmail: 'student4@demo.com', joined: '2025-06-10' },
  { id: 'S005', name: 'Meera Krishnan', rollNo: 3, class: '9', parentEmail: 'parent5@demo.com', studentEmail: 'student5@demo.com', joined: '2025-08-01' },
  { id: 'S006', name: 'Arjun Thomas', rollNo: 15, class: '7', parentEmail: 'parent6@demo.com', studentEmail: 'student6@demo.com', joined: '2025-06-20' }
]

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const SUBJECTS = ['English', 'Mathematics', 'Science', 'Social', 'Hindi', 'Computer']
const TOPICS = {
  English: ['Grammar — Tenses', 'Comprehension', 'Essay Writing', 'Poetry Analysis'],
  Mathematics: ['Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
  Science: ['Photosynthesis', 'Chemical Bonding', 'Motion & Force', 'Human Body'],
  Social: ['Indian Constitution', 'World War II', 'Map Reading', 'Economics Basics'],
  Hindi: ['Vyakaran', 'Kahani Lekhan', 'Kavita', 'Anuched Lekhan'],
  Computer: ['Python Basics', 'HTML/CSS', 'Logic Building', 'Excel Formulas']
}

function seedRandom(seed) {
  let s = seed
  return () => {
    s = (s * 9301 + 49297) % 233280
    return s / 233280
  }
}

export function generateAttendance(studentId, month = '2026-08') {
  const rnd = seedRandom(studentId.charCodeAt(studentId.length - 1) * 17 + month.length)
  const [year, mon] = month.split('-').map(Number)
  const daysInMonth = new Date(year, mon, 0).getDate()
  const records = []
  let sNo = 1

  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, mon - 1, d)
    const dayName = date.toLocaleDateString('en-US', { weekday: 'long' })
    if (dayName === 'Sunday') continue // Mon-Sat schedule per brief

    const subject = SUBJECTS[d % SUBJECTS.length]
    const topics = TOPICS[subject]
    const topic = topics[d % topics.length]
    const roll = rnd()
    let status = 'Present'
    if (roll < 0.06) status = 'Absent'
    else if (roll < 0.1) status = 'Holiday'
    else if (roll < 0.16) status = 'Late'

    records.push({
      sNo: sNo++,
      date: date.toISOString().slice(0, 10),
      day: dayName,
      topic,
      subject,
      timeIn: status === 'Absent' || status === 'Holiday' ? '-' : status === 'Late' ? '5:20 PM' : '5:00 PM',
      timeOut: status === 'Absent' || status === 'Holiday' ? '-' : '7:00 PM',
      duration: status === 'Absent' || status === 'Holiday' ? '0h' : status === 'Late' ? '1h 40m' : '2h',
      status,
      remarks: status === 'Late' ? 'Arrived late' : status === 'Absent' ? 'Informed in advance' : ''
    })
  }
  return records
}

export function generateFees(studentId) {
  const rnd = seedRandom(studentId.charCodeAt(0) * 31)
  const months = ['May', 'June', 'July', 'August']
  return months.map((m, i) => {
    const payable = 3500
    const isPaid = i < 3 || rnd() > 0.35
    return {
      month: `${m} 2026`,
      amountPayable: payable,
      paid: isPaid ? payable : 0,
      pending: isPaid ? 0 : payable,
      paymentDate: isPaid ? `2026-${String(i + 5).padStart(2, '0')}-05` : '-',
      receiptNo: isPaid ? `RCP-${1000 + i}-${studentId}` : '-',
      status: isPaid ? 'Paid' : 'Pending'
    }
  })
}

export function generateMarks(studentId) {
  const rnd = seedRandom(studentId.length * 41 + studentId.charCodeAt(2))
  return SUBJECTS.map((subject) => {
    const score = Math.round(65 + rnd() * 33)
    return { subject, score, max: 100 }
  })
}

export function gradeFromPercent(pct) {
  if (pct >= 90) return 'A+'
  if (pct >= 80) return 'A'
  if (pct >= 70) return 'B+'
  if (pct >= 60) return 'B'
  if (pct >= 50) return 'C'
  return 'D'
}

export const NOTIFICATIONS = [
  { id: 'n1', type: 'fee', title: 'Fee Reminder', message: 'August fee payment due in 3 days.', date: '2026-08-02', read: false },
  { id: 'n2', type: 'absent', title: 'Absent Alert', message: 'Marked absent on Aug 1 — Mathematics.', date: '2026-08-01', read: false },
  { id: 'n3', type: 'test', title: 'Upcoming Test', message: 'Science unit test scheduled for Aug 10.', date: '2026-07-30', read: true },
  { id: 'n4', type: 'report', title: 'Report Ready', message: 'Your July monthly report is ready to download.', date: '2026-07-31', read: true },
  { id: 'n5', type: 'announcement', title: 'Announcement', message: 'Centre closed Aug 15 for Independence Day.', date: '2026-07-28', read: true }
]

export const ANNOUNCEMENTS = [
  { id: 'a1', title: 'Independence Day Holiday', date: '2026-08-15', body: 'The centre will remain closed on Aug 15.' },
  { id: 'a2', title: 'Parent-Teacher Meet', date: '2026-08-22', body: 'PTM scheduled from 4 PM to 6 PM. All parents requested to attend.' }
]
