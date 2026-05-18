<template>
  <nav class="bg-white shadow-md sticky top-0 z-50">
    <div class="max-w-7xl mx-auto px-4">
      <div class="flex items-center justify-between h-16">

        <!-- LEFT: โลโก้ + ชื่อระบบ (แสดงทุกขนาดจอ) -->
        <RouterLink to="/" class="flex items-center gap-2 shrink-0">
          <img v-if="config.logo_url" :src="config.logo_url"
            class="h-10 w-auto object-contain" />
          <div v-else class="w-10 h-10 bg-blue-700 flex items-center justify-center text-white font-bold text-base rounded shrink-0">ว</div>
          <span class="font-bold text-blue-900 text-sm sm:text-base leading-tight">
            {{ config.system_name || 'ระบบตรวจสอบงานวิชาการ' }}
          </span>
        </RouterLink>

        <!-- RIGHT: desktop menu + login -->
        <div class="hidden md:flex items-center gap-1">
          <RouterLink to="/" class="nav-link">หน้าแรก</RouterLink>
          <RouterLink to="/ranking" class="nav-link">🏆 จัดอันดับ</RouterLink>
          <RouterLink v-if="auth.isChecker || auth.isAdmin" to="/checker" class="nav-link">ตรวจสอบงาน</RouterLink>
          <RouterLink v-if="auth.isChecker || auth.isAdmin" to="/report"  class="nav-link">รายงาน</RouterLink>
          <RouterLink v-if="auth.isAdmin" to="/admin" class="nav-link">จัดการระบบ</RouterLink>

          <div class="ml-3 flex items-center gap-2">
            <template v-if="auth.isLoggedIn">
              <div class="flex items-center gap-2 bg-blue-50 rounded-full px-3 py-1.5">
                <img v-if="auth.user?.imgurl" :src="auth.user.imgurl"
                  class="w-7 h-7 rounded-full object-cover shrink-0"
                  @error="e => e.target.style.display='none'" />
                <div v-else class="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                  {{ auth.user?.fullName?.charAt(0) }}
                </div>
                <span class="text-sm text-blue-800 font-medium max-w-[100px] truncate">{{ auth.user?.fullName }}</span>
                <span class="text-xs bg-blue-600 text-white rounded-full px-2 py-0.5 shrink-0">{{ roleLabel }}</span>
              </div>
              <button @click="auth.logout()" class="text-sm text-red-500 hover:text-red-700 font-medium px-2">ออก</button>
            </template>
            <template v-else>
              <button @click="$emit('openLogin')"
                class="bg-blue-700 hover:bg-blue-800 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
                เข้าสู่ระบบ
              </button>
            </template>
          </div>
        </div>

        <!-- RIGHT mobile: hamburger เท่านั้น (โลโก้+ชื่ออยู่ซ้ายแล้ว) -->
        <button @click="menuOpen = !menuOpen" class="md:hidden p-2 rounded text-gray-600">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path v-if="!menuOpen" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
            <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

      <!-- Mobile dropdown -->
      <div v-if="menuOpen" class="md:hidden border-t border-gray-100 py-3 space-y-1">
        <RouterLink to="/" @click="menuOpen=false" class="mobile-link">หน้าแรก</RouterLink>
        <RouterLink to="/ranking" @click="menuOpen=false" class="mobile-link">🏆 จัดอันดับ</RouterLink>
        <RouterLink v-if="auth.isChecker || auth.isAdmin" to="/checker" @click="menuOpen=false" class="mobile-link">ตรวจสอบงาน</RouterLink>
        <RouterLink v-if="auth.isChecker || auth.isAdmin" to="/report"  @click="menuOpen=false" class="mobile-link">รายงาน</RouterLink>
        <RouterLink v-if="auth.isAdmin" to="/admin" @click="menuOpen=false" class="mobile-link">จัดการระบบ</RouterLink>
        <div class="pt-3 border-t border-gray-100">
          <template v-if="auth.isLoggedIn">
            <p class="text-sm text-gray-600 px-2 mb-2">
              {{ auth.user?.fullName }}
              <span class="text-xs text-blue-600 ml-1">({{ roleLabel }})</span>
            </p>
            <button @click="auth.logout(); menuOpen=false" class="mobile-link text-red-500 hover:text-red-700 hover:bg-red-50">
              ออกจากระบบ
            </button>
          </template>
          <template v-else>
            <button @click="$emit('openLogin'); menuOpen=false"
              class="w-full bg-blue-700 text-white text-sm py-2.5 rounded-lg font-medium">
              เข้าสู่ระบบ
            </button>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useDataStore } from '../stores/data'

defineEmits(['openLogin'])

const auth      = useAuthStore()
const dataStore = useDataStore()
const config    = computed(() => dataStore.config)
const menuOpen  = ref(false)

const roleLabel = computed(() => ({
  teacher: 'ครู', admin: 'ผู้ดูแล', checker: 'ผู้ตรวจสอบ'
}[auth.role] || ''))
</script>

<style scoped>
@reference "tailwindcss";
.nav-link {
  @apply text-gray-600 hover:text-blue-700 hover:bg-blue-50 text-sm font-medium px-3 py-2 rounded-lg transition;
}
.mobile-link {
  @apply block text-gray-700 hover:text-blue-700 hover:bg-blue-50 py-2 px-3 rounded-lg text-sm w-full text-left;
}
</style>
