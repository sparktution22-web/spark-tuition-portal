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
  // Skip undefined/null values entirely — URLSearchParams.set() would
  // otherwise stringify a genuinely-missing optional parameter (like
  // month when nobody passes one) into the literal text "undefined",
  // which the backend then treats as a real, meaningful value instead
  // of "not provided". This was the actual cause of Test Marks coming
  // back empty: month=undefined was being sent as a real filter value
  // that matched nothing, wiping out every result.
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null) url.searchParams.set(k, v)
  })
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
// Exact list of 'YYYY-MM' months that genuinely have data for this
// student — used to build the Monthly Reports month picker from real
// data instead of guessing based on today's date.
export async function getAvailableReportMonths(studentId) {
  if (USE_MOCK) {
    await delay()
    return ['2026-04', '2026-05', '2026-06', '2026-07', '2026-08']
  }
  return callScript('getAvailableReportMonths', { studentId })
}
export async function getMarks(studentId, month) {
  if (USE_MOCK) {
    await delay()
    return generateMarks(studentId)
  }
  return callScript('getMarks', { studentId, month })
}
// One month's AI-synthesized overall performance summary + specific
// improvement points, based on that month's actual test results.
export async function getMonthlyPerformanceSummary(studentId, month) {
  if (USE_MOCK) {
    await delay()
    return { summary: '', improvementPoints: [] }
  }
  return callScript('getMonthlyPerformanceSummary', { studentId, month })
}
export async function getNotifications(studentId) {
  if (USE_MOCK) {
    await delay()
    return NOTIFICATIONS
  }
  return callScript('getNotifications', { studentId })
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
// Powers the Analytics page — real mode computes this server-side in one
// pass (see getAdminAnalytics_ in Code.gs), replacing what used to be a
// per-student loop of getFees/getMarks/getAttendance calls.
export async function getAdminAnalytics() {
  if (USE_MOCK) {
    await delay()
    return {
      totalStudents: STUDENTS.length,
      avgAttendance: 82,
      totalFees: STUDENTS.length * 3500,
      collected: Math.round(STUDENTS.length * 3500 * 0.6),
      pending: Math.round(STUDENTS.length * 3500 * 0.4),
      avgMarks: 78,
      feeTrend: [],
      attTrend: []
    }
  }
  return callScript('getAdminAnalytics')
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
export async function getAnnouncements(className) {
  if (USE_MOCK) {
    await delay()
    return ANNOUNCEMENTS
  }
  return callScript('getAnnouncements', { className })
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
// appendMode: true merges with whatever's already saved for that day
// (combines subject names, widens the time span) instead of overwriting
// it — use for "add a second subject on the same day."
export async function addAttendanceEntry({ studentId, date, topic, timeIn, timeOut, month, appendMode }) {
  if (USE_MOCK) {
    await delay()
    return { saved: true, studentId, date, topic, timeIn, timeOut }
  }
  return postScript_('addAttendanceEntry', { studentId, date, topic, timeIn, timeOut, month, appendMode })
}
// Called by the TV kiosk QR scanner. Auto-detects check-in vs check-out
// based on today's existing row — returns { studentId, studentName,
// action: 'checked-in'|'checked-out', time }.
export async function kioskCheckIn(studentId) {
  if (USE_MOCK) {
    await delay()
    return { studentId, studentName: 'Demo Student', action: 'checked-in', time: new Date().toLocaleTimeString() }
  }
  return postScript_('kioskCheckIn', { studentId })
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
// Admin-only in the UI. One student's fee record for a given month
// (omit month for the current one) — Total/Collected/Pending/Status/Paid On.
export async function getFeeRecord(studentId, month) {
  if (USE_MOCK) {
    await delay()
    return { studentId, total: 0, collected: 0, pending: 0, status: 'Pending', paidOn: '' }
  }
  return callScript('getFeeRecord', { studentId, month })
}
// Admin-only in the UI. { studentId, collected, month?, paidOn? } —
// writes directly into the same Collected/Status/Paid On cells manual
// editing would use. Status is derived automatically server-side.
export async function updateFeeStatus({ studentId, collected, month, paidOn, remarks }) {
  if (USE_MOCK) {
    await delay()
    return { studentId, collected, status: 'Paid' }
  }
  return postScript_('updateFeeStatus', { studentId, collected, month, paidOn, remarks })
}
// Admin-only in the UI.
export async function addAnnouncement({ title, body, date, className }) {
  if (USE_MOCK) {
    await delay()
    return { added: true, title, body, className }
  }
  return postScript_('addAnnouncement', { title, body, date, className })
}
// Admin-only in the UI. Flags an email as needing to change its
// (temporary) password before it can be used normally.
export async function flagPasswordChangeRequired(email) {
  if (USE_MOCK) {
    await delay()
    return { email, flagged: true }
  }
  return postScript_('flagPasswordChangeRequired', { email })
}
// Checked right after login — { mustChangePassword: true|false }.
export async function checkPasswordChangeRequired(email) {
  if (USE_MOCK) {
    await delay()
    return { mustChangePassword: false }
  }
  return callScript('checkPasswordChangeRequired', { email })
}
// Called once the person has set their own new password.
export async function clearPasswordChangeRequired(email) {
  if (USE_MOCK) {
    await delay()
    return { email, cleared: true }
  }
  return postScript_('clearPasswordChangeRequired', { email })
}

// Admin-only in the UI. Links an additional student to an existing
// parent login's email, so that login can switch between siblings.
export async function linkStudentToParent(email, studentId) {
  if (USE_MOCK) {
    await delay()
    return { email, studentId, linked: true }
  }
  return postScript_('linkStudentToParent', { email, studentId })
}
// Every student a given login's email can see — for a parent with
// linked siblings, all of them; for everyone else, just their own.
export async function getLinkedStudents(email, studentId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getLinkedStudents', { email, studentId })
}

// Admin-only in the UI. Posts one homework item for a class.
export async function createHomework({ className, subject, description, dueDate }) {
  if (USE_MOCK) {
    await delay()
    return { homeworkId: 'MOCKHW1', className, subject, description, dueDate }
  }
  return postScript_('createHomework', { className, subject, description, dueDate })
}
// A student's own homework list — their class's items, each annotated
// with whether THEY specifically have marked it done.
export async function getHomeworkForStudent(studentId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getHomeworkForStudent', { studentId })
}
// Admin-only in the UI. Every homework item posted for a class (no
// per-student completion — see getHomeworkCompletion for that).
export async function getHomeworkForClass(className) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getHomeworkForClass', { className })
}
// Student marks one homework item done or not-done.
export async function markHomeworkDone(homeworkId, studentId, done) {
  if (USE_MOCK) {
    await delay()
    return { homeworkId, studentId, done }
  }
  return postScript_('markHomeworkDone', { homeworkId, studentId, done })
}
// Admin-only in the UI. Which students in the class have/haven't
// completed one specific homework item.
export async function getHomeworkCompletion(homeworkId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getHomeworkCompletion', { homeworkId })
}

// Saves this login's push notification token — called once after the
// person grants notification permission and Firebase Messaging hands
// back a token.
export async function savePushToken(email, token) {
  if (USE_MOCK) {
    await delay()
    return { email, saved: true }
  }
  return postScript_('savePushToken', { email, token })
}

// Records one successful login — call this right after a real login
// resolves, not on every page load.
export async function logLogin(email, role, studentId) {
  if (USE_MOCK) {
    await delay()
    return { logged: true }
  }
  return postScript_('logLogin', { email, role, studentId })
}
// Admin-only in the UI. Returns { summary, activity } together in one
// round-trip — combines what used to be two separate calls that each
// independently re-read the whole login log from scratch.
export async function getLoginActivityData() {
  if (USE_MOCK) {
    await delay()
    return { summary: [], activity: [] }
  }
  return callScript('getLoginActivityData')
}

// Admin-only in the UI. Uploads one study material PDF for a class.
export async function createStudyMaterial({ className, subject, title, fileBase64 }) {
  if (USE_MOCK) {
    await delay()
    return { materialId: 'MOCKM1', className, subject, title }
  }
  return postScript_('createStudyMaterial', { className, subject, title, fileBase64 })
}
// Every study material for a given class (or all, if omitted — the
// admin's own management view).
export async function getStudyMaterialsForClass(className) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getStudyMaterialsForClass', { className })
}
// Student submits one doubt/question.
export async function submitDoubt({ studentId, subject, question }) {
  if (USE_MOCK) {
    await delay()
    return { doubtId: 'MOCKD1', status: 'Pending' }
  }
  return postScript_('submitDoubt', { studentId, subject, question })
}
// A student's own doubts — pending and answered.
export async function getDoubtsForStudent(studentId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getDoubtsForStudent', { studentId })
}
// Admin-only in the UI. Every pending (unanswered) doubt.
export async function getPendingDoubts() {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getPendingDoubts')
}
// Admin-only in the UI. Answers one doubt — notifies the student once
// answered.
export async function answerDoubt(doubtId, answer) {
  if (USE_MOCK) {
    await delay()
    return { doubtId, answered: true }
  }
  return postScript_('answerDoubt', { doubtId, answer })
}

// Everything needed for the Full Year Record — attendance across every
// available month, all marks ever recorded, and full fee history.
export async function getYearlyReport(studentId) {
  if (USE_MOCK) {
    await delay()
    return { info: {}, attendance: [], marks: [], fees: [] }
  }
  return callScript('getYearlyReport', { studentId })
}

// Admin-only in the UI. Every month that has a real Fees tab right now.
export async function getFeeMonths() {
  if (USE_MOCK) {
    await delay()
    return ['2026-08']
  }
  return callScript('getFeeMonths')
}
// Admin-only in the UI. Creates a new month's Fees tab automatically —
// duplicates the most recent existing one, carrying the roster and fee
// amounts forward, and resets everyone to Pending for the new month.
export async function createFeeMonth(monthKey) {
  if (USE_MOCK) {
    await delay()
    return { monthKey, created: true }
  }
  return postScript_('createFeeMonth', { monthKey })
}

// Admin-only in the UI. Saves an already-generated report PDF (as
// base64) to Drive, fires an in-app + push notification, and returns
// the parent's contact info + a shareable view link for building a
// WhatsApp message.
export async function shareMonthlyReport(studentId, monthLabel, pdfBase64) {
  if (USE_MOCK) {
    await delay()
    return { fileId: 'MOCKF1', viewUrl: '#', studentName: 'Student', parentName: '', parentMobile: '' }
  }
  return postScript_('shareMonthlyReport', { studentId, monthLabel, pdfBase64 })
}

export const isMockMode = USE_MOCK

// ---- AI answer script grading ----

// Reads a File object into a base64 string (without the data: prefix)
// for sending to Apps Script, which decodes and saves it to Drive.
export function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(reader.result.split(',')[1])
    // Reject with a real Error, not the raw ProgressEvent FileReader
    // passes to onerror — that event has no .message property at all,
    // which meant any read failure showed up everywhere as a generic
    // "could not upload" fallback text with no way to tell what
    // actually went wrong (file too large, unreadable, permissions,
    // etc.).
    reader.onerror = () => reject(new Error('Could not read the selected file — it may be too large, corrupted, or an unsupported type.'))
    reader.readAsDataURL(file)
  })
}

// Admin-only in the UI. { subject, testName, maxMarks, className, questionPaperBase64 }.
// className is which class should see it (e.g. "VIII") — must match the
// student's Class value exactly, same text as shown in Manage Students.
export async function createTest({ subject, testName, maxMarks, className, questionPaperBase64 }) {
  if (USE_MOCK) {
    await delay()
    return { testId: 'MOCK1', subject, testName, maxMarks, className }
  }
  return postScript_('createTest', { subject, testName, maxMarks, className, questionPaperBase64 })
}
// Pass className to only get tests for that class (what a student's
// submit-answer page should do); omit it to see every test (what the
// admin's Manage Tests page should do).
export async function getTests(className) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getTests', className ? { className } : {})
}
// Student-only in the UI. { testId, studentId, answerBase64 } — saves
// the PDF and grades it with Claude in the same request.
export async function submitAnswer({ testId, studentId, answerBase64 }) {
  if (USE_MOCK) {
    await delay()
    return { submissionId: 'MOCKSUB1', status: 'Pending Review', aiScore: 0, aiFeedback: '' }
  }
  return postScript_('submitAnswer', { testId, studentId, answerBase64 })
}
// Admin-only in the UI. Reads a photo of the handwritten attendance
// page — returns the extracted list ONLY, does not save anything.
// Each entry: { rollNo, studentName, handwrittenName, timeIn, timeOut, topic }.
export async function extractAttendanceFromImage(imageBase64, mediaType) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return postScript_('extractAttendanceFromImage', { imageBase64, mediaType })
}
// Admin-only in the UI. Every AI-graded submission awaiting review.
export async function getSubmissionsForReview() {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getSubmissionsForReview')
}
// Admin-only in the UI. { submissionId, finalScore } — approves
// (optionally overriding the AI's suggested score), writes into MARKS.
export async function approveSubmission({ submissionId, finalScore }) {
  if (USE_MOCK) {
    await delay()
    return { submissionId, approved: true, finalScore }
  }
  return postScript_('approveSubmission', { submissionId, finalScore })
}
// A student's own submissions and their status/score once approved.
export async function getMySubmissions(studentId) {
  if (USE_MOCK) {
    await delay()
    return []
  }
  return callScript('getMySubmissions', { studentId })
}
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
// Admin-only in the UI. Edits an existing slot in place.
export async function updateTimetableEntry({ id, day, time, subject }) {
  if (USE_MOCK) {
    await delay()
    return { updated: true, id, day, time, subject }
  }
  return postScript_('updateTimetableEntry', { id, day, time, subject })
}
