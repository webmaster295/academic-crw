import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { api } from '../services/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(JSON.parse(sessionStorage.getItem('user') || 'null'))
  const role = ref(sessionStorage.getItem('role') || null)
  const loading = ref(false)
  const error = ref('')

  const isLoggedIn  = computed(() => !!user.value)
  const isTeacher   = computed(() => role.value === 'teacher')
  const isAdmin     = computed(() => role.value === 'admin')
  const isChecker   = computed(() => role.value === 'checker')

  async function login(loginRole, username, password) {
    loading.value = true
    error.value = ''
    try {
      const res = await api.login({ role: loginRole, username, password })
      if (res.success) {
        user.value = res.user
        role.value = res.role
        sessionStorage.setItem('user', JSON.stringify(res.user))
        sessionStorage.setItem('role', res.role)
        return true
      } else {
        error.value = res.message || 'เข้าสู่ระบบไม่สำเร็จ'
        return false
      }
    } catch (e) {
      error.value = 'เชื่อมต่อระบบไม่ได้'
      return false
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    role.value = null
    sessionStorage.removeItem('user')
    sessionStorage.removeItem('role')
  }

  return { user, role, loading, error, isLoggedIn, isTeacher, isAdmin, isChecker, login, logout }
})
