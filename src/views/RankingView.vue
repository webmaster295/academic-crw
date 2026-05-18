<template>
  <div class="min-h-screen" :style="{ background: 'linear-gradient(160deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)' }">

    <!-- ══════ HEADER ══════ -->
    <div class="max-w-5xl mx-auto px-4 pt-10 pb-6 text-center">
      <p class="text-blue-300 text-sm font-medium tracking-widest uppercase mb-2">{{ config.school_name }}</p>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-white leading-tight">
        🏆 จัดอันดับการส่งงานวิชาการ
      </h1>
      <p class="text-blue-200 text-sm mt-2">
        ภาคเรียนที่ {{ config.semester }} ปีการศึกษา {{ config.academic_year }}
      </p>

      <!-- Stats bar -->
      <div class="flex flex-wrap justify-center gap-4 mt-6">
        <div class="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center">
          <div class="text-2xl font-bold text-white">{{ stats.perfect }}</div>
          <div class="text-xs text-blue-200">ส่งครบทุกงาน ⭐</div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center">
          <div class="text-2xl font-bold text-yellow-300">{{ stats.active }}</div>
          <div class="text-xs text-blue-200">กำลังดำเนินการ</div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center">
          <div class="text-2xl font-bold text-white">{{ stats.ranked }}</div>
          <div class="text-xs text-blue-200">มีอันดับแล้ว</div>
        </div>
        <div class="bg-white/10 backdrop-blur rounded-2xl px-5 py-3 text-center">
          <div class="text-2xl font-bold text-white">{{ totalAssignments }}</div>
          <div class="text-xs text-blue-200">งานทั้งหมด</div>
        </div>
      </div>

      <!-- refresh -->
      <div class="flex items-center justify-center gap-3 mt-4">
        <span class="text-xs text-blue-300">อัปเดตล่าสุด: {{ lastUpdated }}</span>
        <button @click="load" class="text-xs text-blue-400 hover:text-white border border-blue-700 hover:border-blue-400 px-3 py-1 rounded-full transition">
          🔄 รีเฟรช
        </button>
      </div>
    </div>

    <!-- ══════ PODIUM TOP 3 ══════ -->
    <div v-if="!loading && top3.length" class="max-w-2xl mx-auto px-4 mb-10">
      <div class="flex items-end justify-center gap-3">

        <!-- 2nd place -->
        <div v-if="top3[1]" class="flex-1 flex flex-col items-center">
          <div class="relative mb-2">
            <img :src="top3[1].imgurl" class="w-16 h-16 rounded-full object-cover border-4 border-gray-400 shadow-xl"
              @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(top3[1].fullName)+'&background=4b5563&color=fff'" />
            <span class="absolute -bottom-1 -right-1 w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">2</span>
          </div>
          <div class="bg-gradient-to-b from-gray-500 to-gray-600 rounded-t-2xl w-full px-2 py-3 text-center" style="height:90px">
            <p class="text-white font-bold text-xs leading-tight line-clamp-2">{{ top3[1].fullName }}</p>
            <p class="text-gray-300 text-xs mt-1">{{ top3[1].approvedCount }}/{{ totalAssignments }} งาน</p>
            <CompletionBar :value="top3[1].completionRate" class="mt-1.5" />
          </div>
        </div>

        <!-- 1st place -->
        <div v-if="top3[0]" class="flex-1 flex flex-col items-center -mt-4">
          <div class="text-3xl mb-1 animate-bounce">👑</div>
          <div class="relative mb-2">
            <img :src="top3[0].imgurl" class="w-20 h-20 rounded-full object-cover border-4 border-yellow-400 shadow-2xl ring-4 ring-yellow-400/30"
              @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(top3[0].fullName)+'&background=1e3a5f&color=fff'" />
            <span class="absolute -bottom-1 -right-1 w-7 h-7 bg-yellow-400 rounded-full flex items-center justify-center text-white text-sm font-bold shadow">1</span>
          </div>
          <div class="bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-t-2xl w-full px-2 py-3 text-center" style="height:120px">
            <p class="text-white font-bold text-sm leading-tight line-clamp-2">{{ top3[0].fullName }}</p>
            <p class="text-yellow-100 text-xs mt-1">{{ top3[0].approvedCount }}/{{ totalAssignments }} งาน</p>
            <p v-if="top3[0].completionRate===100" class="text-yellow-200 text-xs">⭐ ส่งครบทุกงาน</p>
            <CompletionBar :value="top3[0].completionRate" class="mt-1.5" color="bg-white" />
          </div>
        </div>

        <!-- 3rd place -->
        <div v-if="top3[2]" class="flex-1 flex flex-col items-center">
          <div class="relative mb-2">
            <img :src="top3[2].imgurl" class="w-14 h-14 rounded-full object-cover border-4 border-amber-600 shadow-xl"
              @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(top3[2].fullName)+'&background=92400e&color=fff'" />
            <span class="absolute -bottom-1 -right-1 w-6 h-6 bg-amber-600 rounded-full flex items-center justify-center text-white text-xs font-bold shadow">3</span>
          </div>
          <div class="bg-gradient-to-b from-amber-600 to-amber-700 rounded-t-2xl w-full px-2 py-3 text-center" style="height:75px">
            <p class="text-white font-bold text-xs leading-tight line-clamp-2">{{ top3[2].fullName }}</p>
            <p class="text-amber-200 text-xs mt-1">{{ top3[2].approvedCount }}/{{ totalAssignments }} งาน</p>
          </div>
        </div>

      </div>
    </div>

    <!-- ══════ FILTER + PER PAGE ══════ -->
    <div class="max-w-5xl mx-auto px-4 mb-4">
      <div class="flex flex-wrap gap-2 items-center justify-between">
        <div class="flex flex-wrap gap-2">
          <button @click="setFilter('')"
            :class="filterCat==='' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-blue-200 border-white/20 hover:bg-white/20'"
            class="text-xs px-3 py-1.5 rounded-full border transition font-medium">
            ทั้งหมด ({{ rankedTeachers.length }})
          </button>
          <button v-for="c in categories" :key="c" @click="setFilter(c)"
            :class="filterCat===c ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-blue-200 border-white/20 hover:bg-white/20'"
            class="text-xs px-3 py-1.5 rounded-full border transition font-medium">
            {{ c }}
          </button>
        </div>
        <!-- per page -->
        <select v-model="perPage" @change="currentPage = 1"
          class="text-xs bg-white/10 text-blue-200 border border-white/20 rounded-full px-3 py-1.5 outline-none">
          <option :value="10">10 คน/หน้า</option>
          <option :value="20">20 คน/หน้า</option>
          <option :value="50">50 คน/หน้า</option>
          <option :value="9999">ทั้งหมด</option>
        </select>
      </div>
    </div>

    <!-- ══════ LEADERBOARD ══════ -->
    <div class="max-w-5xl mx-auto px-4 pb-12">

      <!-- Loading -->
      <div v-if="loading" class="text-center py-20 text-blue-300">
        <svg class="animate-spin w-8 h-8 mx-auto mb-3" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        กำลังโหลดข้อมูล...
      </div>

      <div v-else>

        <!-- ยังไม่มีอันดับ -->
        <div v-if="rankedTeachers.length === 0" class="text-center py-20">
          <div class="text-6xl mb-4">🏅</div>
          <p class="text-blue-300 text-lg font-semibold">ยังไม่มีอันดับ</p>
          <p class="text-blue-400 text-sm mt-1">เมื่อครูส่งงานและได้รับการอนุมัติ อันดับจะแสดงที่นี่</p>
        </div>

        <div v-else class="space-y-2">
          <TransitionGroup name="rank">
            <div v-for="teacher in pagedRanking" :key="teacher.teacherId"
              :class="[
                rankCardClass(teacher.rank),
                teacher.completionRate === 100 ? 'ring-1 ring-yellow-400/50' : ''
              ]"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 transition hover:scale-[1.01]">

              <!-- Rank badge -->
              <div class="w-10 shrink-0 text-center">
                <span v-if="teacher.rank <= 3" class="text-2xl">{{ ['🥇','🥈','🥉'][teacher.rank-1] }}</span>
                <span v-else class="text-lg font-bold" :class="teacher.rank<=10?'text-white':'text-blue-300'">
                  {{ teacher.rank }}
                </span>
              </div>

              <!-- Avatar -->
              <img :src="teacher.imgurl" class="w-11 h-11 rounded-full object-cover border-2 shrink-0"
                :class="teacher.rank===1?'border-yellow-400':teacher.rank===2?'border-gray-400':teacher.rank===3?'border-amber-600':'border-white/20'"
                @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(teacher.fullName)+'&background=1e3a5f&color=fff'" />

              <!-- Name + category -->
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-semibold text-white text-sm truncate">{{ teacher.fullName }}</span>
                  <span v-if="teacher.completionRate===100" class="text-yellow-300 text-xs">⭐ ครบ</span>
                </div>
                <div class="text-xs text-blue-300 truncate">{{ teacher.categoryName }}</div>
                <div class="mt-1.5 flex items-center gap-2">
                  <div class="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                      :class="teacher.completionRate===100?'bg-yellow-400':'bg-blue-400'"
                      :style="{ width: teacher.completionRate + '%' }"></div>
                  </div>
                  <span class="text-xs text-blue-300 shrink-0">{{ teacher.approvedCount }}/{{ totalAssignments }}</span>
                </div>
              </div>

              <!-- จำนวนส่ง -->
              <div class="text-right shrink-0">
                <div class="text-lg font-bold" :class="teacher.rank===1?'text-yellow-300':teacher.completionRate===100?'text-green-300':'text-white'">
                  {{ teacher.approvedCount }}/{{ totalAssignments }}
                </div>
                <div class="text-xs text-blue-300">งาน</div>
              </div>

            </div>
          </TransitionGroup>

          <!-- ไม่พบในหมวดนี้ -->
          <div v-if="filteredRanking.length === 0" class="text-center py-16 text-blue-400">
            ไม่พบครูในกลุ่มสาระนี้
          </div>

          <!-- ══════ PAGINATION ══════ -->
          <div v-if="totalPages > 1" class="flex items-center justify-center gap-2 pt-6">
            <button @click="currentPage = 1" :disabled="currentPage === 1"
              class="text-xs px-3 py-1.5 rounded-full border border-white/20 text-blue-300 hover:bg-white/10 disabled:opacity-30 transition">
              «
            </button>
            <button @click="currentPage--" :disabled="currentPage === 1"
              class="text-xs px-3 py-1.5 rounded-full border border-white/20 text-blue-300 hover:bg-white/10 disabled:opacity-30 transition">
              ‹
            </button>

            <template v-for="p in pageButtons" :key="p">
              <span v-if="p === '...'" class="text-blue-400 text-xs px-1">…</span>
              <button v-else @click="currentPage = p"
                :class="p === currentPage ? 'bg-blue-600 text-white border-blue-600' : 'bg-white/10 text-blue-200 border-white/20 hover:bg-white/20'"
                class="text-xs w-8 h-8 rounded-full border transition font-medium">
                {{ p }}
              </button>
            </template>

            <button @click="currentPage++" :disabled="currentPage === totalPages"
              class="text-xs px-3 py-1.5 rounded-full border border-white/20 text-blue-300 hover:bg-white/10 disabled:opacity-30 transition">
              ›
            </button>
            <button @click="currentPage = totalPages" :disabled="currentPage === totalPages"
              class="text-xs px-3 py-1.5 rounded-full border border-white/20 text-blue-300 hover:bg-white/10 disabled:opacity-30 transition">
              »
            </button>
          </div>

          <!-- info -->
          <p v-if="filteredRanking.length > 0" class="text-center text-xs text-blue-400 mt-2">
            แสดง {{ pageStart }}–{{ pageEnd }} จาก {{ filteredRanking.length }} คน
          </p>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { api } from '../services/api'
import { useDataStore } from '../stores/data'

// ── inline CompletionBar ──────────────────────────
const CompletionBar = {
  props: { value: Number, color: { default: 'bg-blue-300' } },
  template: `
    <div class="w-full bg-white/20 rounded-full h-1.5 overflow-hidden">
      <div :class="color" class="h-full rounded-full transition-all duration-700"
        :style="{ width: value + '%' }"></div>
    </div>`
}

const dataStore = useDataStore()
const config    = computed(() => dataStore.config)

const ranking          = ref([])
const totalAssignments = ref(0)
const loading          = ref(true)
const filterCat        = ref('')
const lastUpdated      = ref('—')
const perPage          = ref(10)
const currentPage      = ref(1)
let   refreshTimer     = null

// เฉพาะครูที่มี approvedCount > 0 (มีงานส่งเรียบร้อยแล้ว)
const rankedTeachers = computed(() =>
  ranking.value.filter(t => t.approvedCount > 0)
)

const top3 = computed(() => rankedTeachers.value.slice(0, 3))

const categories = computed(() =>
  [...new Set(rankedTeachers.value.map(t => t.categoryName).filter(Boolean))].sort()
)

const filteredRanking = computed(() => {
  if (!filterCat.value) return rankedTeachers.value
  return rankedTeachers.value.filter(t => t.categoryName === filterCat.value)
})

// pagination
const totalPages = computed(() =>
  perPage.value >= 9999 ? 1 : Math.ceil(filteredRanking.value.length / perPage.value)
)
const pageStart = computed(() => (currentPage.value - 1) * perPage.value + 1)
const pageEnd   = computed(() => Math.min(currentPage.value * perPage.value, filteredRanking.value.length))

const pagedRanking = computed(() => {
  if (perPage.value >= 9999) return filteredRanking.value
  return filteredRanking.value.slice(pageStart.value - 1, pageEnd.value)
})

const pageButtons = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const pages = []
  if (cur <= 4) {
    for (let i = 1; i <= 5; i++) pages.push(i)
    pages.push('...'); pages.push(total)
  } else if (cur >= total - 3) {
    pages.push(1); pages.push('...')
    for (let i = total - 4; i <= total; i++) pages.push(i)
  } else {
    pages.push(1); pages.push('...')
    for (let i = cur - 1; i <= cur + 1; i++) pages.push(i)
    pages.push('...'); pages.push(total)
  }
  return pages
})

const stats = computed(() => ({
  ranked:  rankedTeachers.value.length,
  perfect: rankedTeachers.value.filter(t => t.completionRate === 100).length,
  active:  rankedTeachers.value.filter(t => t.approvedCount > 0 && t.completionRate < 100).length,
}))

function setFilter(cat) {
  filterCat.value  = cat
  currentPage.value = 1
}

// reset page เมื่อ filter เปลี่ยน
watch(filterCat, () => { currentPage.value = 1 })

function rankCardClass(rank) {
  if (rank === 1) return 'bg-gradient-to-r from-yellow-900/60 to-yellow-800/40'
  if (rank === 2) return 'bg-gradient-to-r from-gray-700/60 to-gray-600/40'
  if (rank === 3) return 'bg-gradient-to-r from-amber-900/60 to-amber-800/40'
  if (rank <= 10) return 'bg-white/10'
  return 'bg-white/5'
}

async function load() {
  loading.value = true
  try {
    await dataStore.loadConfig()
    const res = await api.getRanking()
    ranking.value          = res.teachers || []
    totalAssignments.value = res.totalAssignments || 0
    lastUpdated.value      = new Date().toLocaleTimeString('th-TH')
    currentPage.value      = 1
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  load()
  refreshTimer = setInterval(load, 5 * 60 * 1000)
})

onUnmounted(() => clearInterval(refreshTimer))
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.rank-move, .rank-enter-active, .rank-leave-active { transition: all 0.4s ease; }
.rank-enter-from { opacity: 0; transform: translateY(20px); }
.rank-leave-to   { opacity: 0; transform: translateY(-20px); }
</style>
