<template>
  <Teleport to="body">
    <div v-if="show" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" @click="$emit('close')"></div>

      <!-- Modal -->
      <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 z-10">
        <!-- Header -->
        <div class="text-center mb-6">
          <div class="w-16 h-16 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h2 class="text-xl font-bold text-gray-800">เข้าสู่ระบบ</h2>
          <p class="text-sm text-gray-500 mt-1">ระบบบันทึกการตรวจสอบงานวิชาการ</p>
        </div>

        <!-- Role selector -->
        <div class="grid grid-cols-3 gap-2 mb-5">
          <button v-for="r in roles" :key="r.value"
            @click="selectedRole = r.value"
            :class="selectedRole === r.value
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'"
            class="border-2 rounded-xl py-2 text-xs font-medium transition flex flex-col items-center gap-1">
            <span class="text-lg">{{ r.icon }}</span>
            {{ r.label }}
          </button>
        </div>

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ selectedRole === 'teacher' ? 'รหัสครู (teacherId)' : 'ชื่อผู้ใช้' }}
            </label>
            <input v-model="username" type="text" required
              :placeholder="selectedRole === 'teacher' ? 'เช่น t105' : 'username'"
              class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ selectedRole === 'teacher' ? 'รหัสประจำตัว (citizenId)' : 'รหัสผ่าน' }}
            </label>
            <div class="relative">
              <input v-model="password" :type="showPass ? 'text' : 'password'" required
                class="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10" />
              <button type="button" @click="showPass = !showPass"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path v-if="!showPass" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Error -->
          <div v-if="auth.error" class="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2">
            {{ auth.error }}
          </div>

          <button type="submit" :disabled="auth.loading"
            class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-medium text-sm transition flex items-center justify-center gap-2">
            <svg v-if="auth.loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            {{ auth.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
          </button>
        </form>

        <!-- Close -->
        <button @click="$emit('close')" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'

const props = defineProps({ show: Boolean })
const emit = defineEmits(['close'])

const auth = useAuthStore()
const router = useRouter()

const selectedRole = ref('teacher')
const username = ref('')
const password = ref('')
const showPass = ref(false)

const roles = [
  { value: 'teacher', label: 'ครู', icon: '👩‍🏫' },
  { value: 'checker', label: 'ผู้ตรวจสอบ', icon: '🔍' },
  { value: 'admin',   label: 'แอดมิน', icon: '⚙️' },
]

// reset error เมื่อเปลี่ยน role
watch(selectedRole, () => { auth.error = '' })

async function handleLogin() {
  const ok = await auth.login(selectedRole.value, username.value, password.value)
  if (ok) {
    emit('close')
    username.value = ''
    password.value = ''
    if (auth.isAdmin)   router.push('/admin')
    if (auth.isChecker) router.push('/checker')
  }
}
</script>
