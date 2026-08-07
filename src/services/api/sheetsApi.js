// Single entry point for all data reads/writes.
//
// When VITE_GOOGLE_SCRIPT_URL is set, every function here calls the deployed
// Apps Script Web App instead. Until then, it transparently serves mock data
// shaped identically, so every page in this app already works end-to-end and
// needs zero changes when the real backend is connected.
import { STUDENTS, generateAttendance, generateFees, generateMarks, NOTIFICATIONS, ANNOUNCEMENTS } from './mockData.js'
const SCRIPT_URL = import.meta.env.VITE_GOOGLE_SCRIPT_URL
const USE_MOCK = !SCRIPT_URL
async function callScript(action, params = {}, attempt = 1) {
  const url = new URL(SCRIPT_URL)
  url.searchParams.set('action', action)
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  try {
    const res = await fetch(url.toString())
    if (!res.ok) throw new Error(`Apps Script request failed: ${action}`)
    const json = await res.json()
    if (!json.success) throw new Error(json.error || `Apps Script error: ${action}`)
    return json.data
  } catch (err) {
    // Apps Script can flake under concurrent load (several requests fired
    // at once, e.g. from Promise.all on the dashboard) — retry a couple
    // times with a short backoff before actually giving up.
    if (attempt < 3) {
      await delay(400 * attempt)
      return callScript(action, params, attempt + 1)
    }
    throw err
  }
}
function delay(ms = 250) {
  return new Promise((res) => setTimeout(res, ms))
}
export async function getStudents() {
  if (USE_MOCK) {
    await delay()
    return STUDENTS
  }
  return callScript('getStudents')
}
export async function getStudentById(id) {
  if (USE_MOCK) {
    await delay()
    return STUDENTS.find((s) => s.id === id) || null
  }
  return callScript('getStudentById', { id })
}
export async function getAttendance(studentId, month = '2026-08') {
  if (USE_MOCK) {
    await delay()
    return generateAttendance(studentId, month)
  }
  return callScript('getAttendance', { studentId, month })
}
export async function getFees(studentId) {
  if (USE_MOCK) {
    await delay()
    return generateFees(studentId)
  }
  return callScript('getFees', { studentId })
}
export async function getMarks(studentId) {
  if (USE_MOCK) {
    await delay()
    return generateMarks(studentId)
  }
  return callScript('getMarks', { studentId })
}
export async function getNotifications() {
  if (USE_MOCK) {
    await delay()
    return NOTIFICATIONS
  }
  return callScript('getNotifications')
}
// Centre-wide overview for the admin dashboard — real mode computes this
// server-side in one pass (see getAdminDashboard_ in Code.gs). Mock mode
// approximates it from the existing STUDENTS/mock data since there's no
// real "today" concept in the demo dataset.
export async function getAdminDashboard() {
  if (USE_MOCK) {
    await delay()
    return {
      totalStudents: STUDENTS.length,
      today: new Date().toLocaleDateString('en-GB').replace(/\//g, '.'),
      presentToday: Math.round(STUDENTS.length * 0.8),
      absentToday: Math.round(STUDENTS.length * 0.2),
      todayAttendancePct: 80,
      feesPayable: STUDENTS.length * 3500,
      feesCollected: Math.round(STUDENTS.length * 3500 * 0.6),
      feesPending: Math.round(STUDENTS.length * 3500 * 0.4),
      dailyTrend: []
    }
  }
  return callScript('getAdminDashboard')
}
// Unified calendar: government holidays + admin-added holidays/birthdays/
// important days + test dates (pulled automatically from Marks). month is
// 'YYYY-MM' — omit for the current month.
export async function getCalendarEvents(month) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getCalendarEvents', month ? { month } : {})
}
// Admin-only in the UI. type: 'holiday' | 'birthday' | 'important'.
// studentId is optional (used for birthdays).
export async function addEvent({ type, date, title, studentId }) {
  if (USE_MOCK) {
    await delay()
    return { added: true, type, date, title }
  }
  return postScript_('addEvent', { type, date, title, studentId })
}
export async function getAnnouncements() {
  if (USE_MOCK) {
    await delay()
    return ANNOUNCEMENTS
  }
  return callScript('getAnnouncements')
}
// Combines attendance + fees + marks + notifications + announcements into
// ONE request instead of five, since Apps Script tends to serialize
// several concurrent requests rather than truly running them in parallel —
// this cuts dashboard load time roughly to that of a single call.
export async function getDashboardData(studentId, month = '2026-08') {
  if (USE_MOCK) {
    const student = STUDENTS.find((s) => s.id === studentId)
    const [attendance, fees, marks, notifications, announcements] = await Promise.all([
      generateAttendance(studentId, month),
      generateFees(studentId),
      generateMarks(studentId),
      NOTIFICATIONS,
      ANNOUNCEMENTS
    ])
    const info = {
      studentName: student?.name || '',
      rollNo: student?.rollNo || '',
      class: student?.class || '',
      days: '',
      slot: '',
      parentName: '',
      parentMobile: ''
    }
    return { info, attendance, fees, marks, notifications, announcements }
  }
  return callScript('getDashboardData', { studentId, month })
}
// Write operations (admin only in the UI). In mock mode these resolve
// without persisting — real mode POSTs to the Apps Script doPost() handler.
// Response shape matches reads: { success, data } — unwrapped here the
// same way callScript() does for GET calls.
async function postScript_(action, body) {
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action, ...body })
  })
  if (!res.ok) throw new Error(`Apps Script request failed: ${action}`)
  const json = await res.json()
  if (!json.success) throw new Error(json.error || `Apps Script error: ${action}`)
  return json.data
}
export async function addStudent(student) {
  if (USE_MOCK) {
    await delay()
    return { ...student, id: `S${String(Date.now()).slice(-3)}` }
  }
  return postScript_('addStudent', { student })
}
export async function updateStudent(id, updates) {
  if (USE_MOCK) {
    await delay()
    return { id, ...updates }
  }
  return postScript_('updateStudent', { id, updates })
}
export async function deleteStudent(id) {
  if (USE_MOCK) {
    await delay()
    return { id, deleted: true }
  }
  return postScript_('deleteStudent', { id })
}
// Adds one test-result row for a student. Admin-only in the UI.
// { studentId, subject, score, testName?, maxScore? (default 100), date? }
export async function addMarks({ studentId, subject, score, testName, maxScore, date }) {
  if (USE_MOCK) {
    await delay()
    return { added: true, studentId, subject, score, maxScore: maxScore ?? 100 }
  }
  return postScript_('addMarks', { studentId, subject, score, testName, maxScore, date })
}
// Admin-only in the UI. Writes directly into the student's real sheet
// row for that date — { studentId, date: 'dd.MM.yyyy', topic, timeIn,
// timeOut, month? }. The row must already exist (every day 1-31 already
// has a blank row); this doesn't create new rows or new month sheets.
export async function addAttendanceEntry({ studentId, date, topic, timeIn, timeOut, month }) {
  if (USE_MOCK) {
    await delay()
    return { saved: true, studentId, date, topic, timeIn, timeOut }
  }
  return postScript_('addAttendanceEntry', { studentId, date, topic, timeIn, timeOut, month })
}
// Admin-only in the UI. Every student with a pending fee balance this
// month, plus their parent's name/mobile — used to build WhatsApp
// click-to-chat reminder links.
export async function getFeeReminders() {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getFeeReminders')
}
// Admin-only in the UI.
export async function addAnnouncement({ title, body, date }) {
  if (USE_MOCK) {
    await delay()
    return { added: true, title, body }
  }
  return postScript_('addAnnouncement', { title, body, date })
}
export const isMockMode = USE_MOCK
// One student's timetable — [{ id, day, time, subject }], Monday-first.
export async function getTimetable(studentId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getTimetable', { studentId })
}
// Admin-only in the UI. { studentId, day, time, subject }.
export async function addTimetableEntry({ studentId, day, time, subject }) {
  if (USE_MOCK) {
    await delay()
    return { added: true, studentId, day, time, subject }
  }
  return postScript_('addTimetableEntry', { studentId, day, time, subject })
}
// Admin-only in the UI. id is the row id returned by getTimetable.
export async function deleteTimetableEntry(id) {
  if (USE_MOCK) {
    await delay()
    return { deleted: true, id }
  }
  return postScript_('deleteTimetableEntry', { id })
}
