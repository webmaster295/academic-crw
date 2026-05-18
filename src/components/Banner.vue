<template>
  <div class="relative overflow-hidden" :style="{ background: `linear-gradient(135deg, ${bg1}, ${bg2})` }">
    <!-- decorative circles -->
    <div class="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full"></div>
    <div class="absolute -bottom-10 -left-10 w-48 h-48 bg-white/10 rounded-full"></div>

    <div class="relative max-w-7xl mx-auto px-4 py-10 sm:py-14 text-white">
      <div class="flex flex-col items-center text-center gap-4">

        <!-- โลโก้ -->
        <img v-if="config.logo_url" :src="config.logo_url"
          class="h-24 w-auto object-contain drop-shadow-lg" />
        <div v-else class="h-24 w-24 bg-white/20 border-2 border-white/40 rounded-xl flex items-center justify-center text-5xl">🏫</div>

        <!-- ชื่อ -->
        <div>
          <p class="text-white/80 text-sm font-medium mb-1">{{ config.school_name || 'โรงเรียน' }}</p>
          <h1 class="text-2xl sm:text-3xl font-bold leading-tight">
            {{ config.system_name || 'ระบบบันทึกการตรวจสอบงานวิชาการ' }}
          </h1>
        </div>

        <!-- badges -->
        <div class="flex flex-wrap gap-2 justify-center">
          <span class="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
            ภาคเรียนที่ {{ config.semester || '1' }}
          </span>
          <span class="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full border border-white/30">
            ปีการศึกษา {{ config.academic_year || '2567' }}
          </span>
        </div>

        <!-- ครูที่ login: แสดงรูป + ชื่อ -->
        <div v-if="auth.isTeacher && auth.user"
          class="flex flex-col items-center gap-2 mt-1">
          <img v-if="auth.user.imgurl" :src="auth.user.imgurl"
            class="w-16 h-16 rounded-full object-cover border-2 border-white/60 shadow-lg"
            @error="e => e.target.style.display='none'" />
          <div v-else class="w-16 h-16 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-2xl font-bold text-white">
            {{ auth.user.fullName?.charAt(0) }}
          </div>
          <div class="text-center">
            <p class="text-white font-semibold text-base leading-tight">{{ auth.user.fullName }}</p>
            <p class="text-white/70 text-xs mt-0.5">{{ auth.user.categoryName }}</p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'

const dataStore = useDataStore()
const auth      = useAuthStore()
const config    = computed(() => dataStore.config)

const bg1 = computed(() => config.value.banner_color  || '#1e3a5f')
const bg2 = computed(() => config.value.banner_color2 || '#1e6fa8')
</script>
