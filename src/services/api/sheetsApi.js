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
export async function getAnnouncements() {
  if (USE_MOCK) {
    await delay()
    return ANNOUNCEMENTS
  }
  return callScript('getAnnouncements')
}
// Write operations (admin only). In mock mode these resolve without
// persisting — swap in real POSTs to the Apps Script doPost() handler.
export async function addStudent(student) {
  if (USE_MOCK) {
    await delay()
    return { ...student, id: `S${String(Date.now()).slice(-3)}` }
  }
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'addStudent', student })
  })
  return res.json()
}
export async function updateStudent(id, updates) {
  if (USE_MOCK) {
    await delay()
    return { id, ...updates }
  }
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'updateStudent', id, updates })
  })
  return res.json()
}
export async function deleteStudent(id) {
  if (USE_MOCK) {
    await delay()
    return { id, deleted: true }
  }
  const res = await fetch(SCRIPT_URL, {
    method: 'POST',
    body: JSON.stringify({ action: 'deleteStudent', id })
  })
  return res.json()
}
export const isMockMode = USE_MOCK
