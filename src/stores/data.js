import { defineStore } from 'pinia'
import { ref } from 'vue'
import { api } from '../services/api'

// ── Cache helpers (localStorage, TTL 10 นาที) ──────────
const TTL = 10 * 60 * 1000  // 10 นาที

function cacheGet(key) {
  try {
    const raw = localStorage.getItem('cache_' + key)
    if (!raw) return null
    const { data, ts } = JSON.parse(raw)
    if (Date.now() - ts > TTL) { localStorage.removeItem('cache_' + key); return null }
    return data
  } catch { return null }
}

function cacheSet(key, data) {
  try { localStorage.setItem('cache_' + key, JSON.stringify({ data, ts: Date.now() })) } catch {}
}

function cacheClear(key) {
  localStorage.removeItem('cache_' + key)
}

// ──────────────────────────────────────────────────────
export const useDataStore = defineStore('data', () => {
  const config      = ref({})
  const teachers    = ref([])
  const assignments = ref([])
  const dashboard   = ref({ teachers: [], stats: {} })
  const loading     = ref(false)

  // โหลดจาก cache ก่อน แล้ว fetch ใหม่เบื้องหลัง
  async function loadConfig() {
    const cached = cacheGet('config')
    if (cached) config.value = cached
    const fresh = await api.getConfig()
    config.value = fresh
    cacheSet('config', fresh)
  }

  async function loadTeachers() {
    const cached = cacheGet('teachers')
    if (cached) teachers.value = cached
    const fresh = await api.getTeachers()
    teachers.value = fresh
    cacheSet('teachers', fresh)
  }

  async function loadAssignments() {
    const cached = cacheGet('assignments')
    if (cached) assignments.value = cached
    const fresh = await api.getAssignments()
    assignments.value = fresh
    cacheSet('assignments', fresh)
  }

  async function loadDashboard(assignmentId) {
    loading.value = true
    // dashboard เปลี่ยนบ่อย cache แค่ 2 นาที
    const key = 'dashboard_' + assignmentId
    const cached = cacheGet(key)
    if (cached) { dashboard.value = cached; loading.value = false }
    const fresh = await api.getDashboard(assignmentId)
    dashboard.value = fresh
    cacheSet(key, fresh)
    loading.value = false
  }

  async function loadAll() {
    // แสดง cache ก่อนทันที จากนั้น fetch ใหม่พร้อมกัน
    const cc = cacheGet('config')
    const ct = cacheGet('teachers')
    const ca = cacheGet('assignments')
    if (cc) config.value      = cc
    if (ct) teachers.value    = ct
    if (ca) assignments.value = ca

    // fetch ใหม่เบื้องหลัง
    await Promise.all([loadConfig(), loadTeachers(), loadAssignments()])
  }

  function clearCache() {
    cacheClear('config')
    cacheClear('teachers')
    cacheClear('assignments')
  }

  return {
    config, teachers, assignments, dashboard, loading,
    loadConfig, loadTeachers, loadAssignments, loadDashboard, loadAll, clearCache,
  }
})
