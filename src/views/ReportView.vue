<template>
  <div class="max-w-7xl mx-auto px-4 py-8">

    <!-- Controls -->
    <div class="no-print space-y-4 mb-6">
      <div class="flex flex-col sm:flex-row sm:items-center gap-3">
        <h1 class="text-xl font-bold text-gray-800">📄 รายงานผลการส่งงาน</h1>
        <button @click="printReport" :disabled="!selectedAssignmentId"
          class="ml-auto flex items-center gap-2 bg-blue-700 hover:bg-blue-800 disabled:opacity-40 text-white px-5 py-2 rounded-lg text-sm font-medium transition">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"/>
          </svg>
          พิมพ์รายงาน
        </button>
      </div>

      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-4 flex flex-wrap gap-4 items-end">
        <!-- งาน -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">งาน</label>
          <select v-model="selectedAssignmentId" @change="loadReport"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-64">
            <option value="">— เลือกงาน —</option>
            <option v-for="a in data.assignments" :key="a.id" :value="a.id">
              {{ a.name }} (ปี {{ a.academic_year }} เทอม {{ a.semester }})
            </option>
          </select>
        </div>

        <!-- ประเภท -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">ประเภทรายงาน</label>
          <select v-model="reportType" @change="onTypeChange"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="all">ทั้งหมด</option>
            <option value="group">แยกตามกลุ่มสาระ</option>
            <option value="person">รายบุคคล</option>
          </select>
        </div>

        <!-- filter กลุ่มสาระ -->
        <div v-if="reportType === 'group'">
          <label class="block text-xs font-medium text-gray-600 mb-1">กลุ่มสาระ</label>
          <select v-model="filterCategory"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— ทั้งหมด —</option>
            <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
          </select>
        </div>

        <!-- filter ครู -->
        <div v-if="reportType === 'person'">
          <label class="block text-xs font-medium text-gray-600 mb-1">ครู</label>
          <select v-model="filterTeacherId"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-52">
            <option value="">— ทั้งหมด —</option>
            <option v-for="t in data.teachers" :key="t.teacherId" :value="t.teacherId">{{ t.fullName }}</option>
          </select>
        </div>

        <!-- สถานะ -->
        <div>
          <label class="block text-xs font-medium text-gray-600 mb-1">สถานะ</label>
          <select v-model="filterStatus"
            class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">— ทุกสถานะ —</option>
            <option value="ยังไม่ส่ง">ยังไม่ส่ง</option>
            <option value="รอตรวจสอบ">รอตรวจสอบ</option>
            <option value="ส่งเรียบร้อย">ส่งเรียบร้อย</option>
            <option value="ขอแก้ไข">ขอแก้ไข</option>
            <option value="ไม่ผ่าน">ไม่ผ่าน</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="text-center py-16 text-gray-400 no-print">
      <svg class="animate-spin w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
      กำลังโหลดข้อมูล...
    </div>

    <!-- ═══════ PRINTABLE AREA ═══════ -->
    <div v-else-if="selectedAssignmentId" id="print-area"
      class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 sm:p-8">

      <!-- Header -->
      <div class="text-center mb-6 border-b border-gray-200 pb-6">
        <div class="flex justify-center mb-3">
          <img v-if="config.logo_url" :src="config.logo_url" class="w-16 h-16 object-contain" />
          <div v-else class="w-16 h-16 rounded-full bg-blue-700 flex items-center justify-center text-white text-2xl font-bold">ว</div>
        </div>
        <p class="text-sm font-semibold text-gray-600">{{ config.school_name }}</p>
        <h2 class="text-xl font-bold text-gray-900 mt-1">รายงานผลการส่งงานวิชาการ</h2>
        <h3 class="text-base font-semibold text-blue-700 mt-1">{{ currentAssignmentName }}</h3>
        <p class="text-sm text-gray-500 mt-1">
          ภาคเรียนที่ {{ config.semester }} ปีการศึกษา {{ config.academic_year }}
          <span v-if="filterCategory" class="ml-2 text-blue-600 font-medium">| {{ filterCategory }}</span>
        </p>
        <p class="text-xs text-gray-400 mt-1">วันที่พิมพ์: {{ printDate }}</p>
      </div>

      <!-- Stats — อัปเดตตาม filter -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div class="border border-blue-100 bg-blue-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-blue-700">{{ summaryStats.total }}</div>
          <div class="text-xs text-gray-500 mt-1">ครูทั้งหมด</div>
        </div>
        <div class="border border-green-100 bg-green-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-green-600">{{ summaryStats.approved }}</div>
          <div class="text-xs text-gray-500 mt-1">ส่งเรียบร้อย</div>
        </div>
        <div class="border border-yellow-100 bg-yellow-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-yellow-600">{{ summaryStats.pending }}</div>
          <div class="text-xs text-gray-500 mt-1">รอตรวจสอบ</div>
        </div>
        <div class="border border-gray-100 bg-gray-50 rounded-xl p-3 text-center">
          <div class="text-2xl font-bold text-gray-400">{{ summaryStats.notYet }}</div>
          <div class="text-xs text-gray-500 mt-1">ยังไม่ส่ง</div>
        </div>
      </div>

      <!-- ตาราง -->
      <template v-if="reportType === 'group'">
        <!-- แต่ละกลุ่มสาระ -->
        <div v-for="(groupRows, gname) in groupedRows" :key="gname" class="mb-8">
          <h4 class="font-bold text-white bg-blue-700 px-4 py-2 rounded-t-lg text-sm flex justify-between">
            <span>{{ gname }}</span>
            <span class="text-blue-200 font-normal text-xs">
              {{ groupRows.filter(r => r.status === 'ส่งเรียบร้อย').length }}/{{ groupRows.length }} คน
            </span>
          </h4>
          <ReportTable :rows="groupRows" />
        </div>
        <div v-if="Object.keys(groupedRows).length === 0" class="text-center py-10 text-gray-300">ไม่มีข้อมูล</div>
      </template>
      <template v-else>
        <ReportTable :rows="displayRows" />
        <div v-if="displayRows.length === 0" class="text-center py-10 text-gray-300">ไม่มีข้อมูล</div>
      </template>

      <!-- ลายเซ็น -->
      <div class="mt-16 grid grid-cols-1 sm:grid-cols-2 gap-10">
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-14">ลงชื่อ ........................................</p>
          <div class="border-t-2 border-gray-400 pt-3 mx-6">
            <p class="font-bold text-gray-800">{{ config.academic_head_name || '(....................................)' }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ config.academic_head_position || 'หัวหน้ากลุ่มบริหารวิชาการ' }}</p>
          </div>
        </div>
        <div class="text-center">
          <p class="text-sm text-gray-500 mb-14">ลงชื่อ ........................................</p>
          <div class="border-t-2 border-gray-400 pt-3 mx-6">
            <p class="font-bold text-gray-800">{{ config.deputy_director_name || '(....................................)' }}</p>
            <p class="text-sm text-gray-600 mt-1">{{ config.deputy_director_position || 'รองผู้อำนวยการกลุ่มบริหารวิชาการ' }}</p>
          </div>
        </div>
      </div>

    </div>

    <!-- Empty state -->
    <div v-else-if="!loading" class="text-center py-20 text-gray-300 no-print">
      <div class="text-6xl mb-3">📄</div>
      <p class="text-sm">เลือกงานเพื่อดูรายงาน</p>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import ReportTable from '../components/ReportTable.vue'
import { useDataStore } from '../stores/data'
import { api } from '../services/api'

const data = useDataStore()

const selectedAssignmentId = ref('')
const reportType           = ref('all')
const filterCategory       = ref('')
const filterTeacherId      = ref('')
const filterStatus         = ref('')
const allRows              = ref([])   // ข้อมูลดิบทั้งหมดจาก GAS
const loading              = ref(false)

const config = computed(() => data.config)

const categories = computed(() =>
  [...new Set(allRows.value.map(r => r.categoryName).filter(Boolean))].sort()
)

const currentAssignmentName = computed(() => {
  const a = data.assignments.find(a => String(a.id) === String(selectedAssignmentId.value))
  return a ? a.name : ''
})

// ── filter client-side ───────────────────────────
const displayRows = computed(() => {
  let rows = allRows.value

  // filter กลุ่มสาระ (เมื่อ reportType === 'group' และเลือกกลุ่มสาระ)
  if (reportType.value === 'group' && filterCategory.value) {
    rows = rows.filter(r => r.categoryName === filterCategory.value)
  }

  // filter รายบุคคล
  if (reportType.value === 'person' && filterTeacherId.value) {
    rows = rows.filter(r => String(r.teacherId) === String(filterTeacherId.value))
  }

  // filter สถานะ
  if (filterStatus.value) {
    rows = rows.filter(r => r.status === filterStatus.value)
  }

  return rows
})

// Stats อัปเดตตาม displayRows เสมอ
const summaryStats = computed(() => {
  const rows = displayRows.value
  return {
    total:    rows.length,
    approved: rows.filter(r => r.status === 'ส่งเรียบร้อย').length,
    pending:  rows.filter(r => r.status === 'รอตรวจสอบ').length,
    notYet:   rows.filter(r => r.status === 'ยังไม่ส่ง').length,
  }
})

// groupedRows สำหรับ reportType === 'group'
const groupedRows = computed(() => {
  const groups = {}
  displayRows.value.forEach(r => {
    const key = r.categoryName || 'ไม่ระบุ'
    if (!groups[key]) groups[key] = []
    groups[key].push(r)
  })
  return groups
})

const printDate = computed(() =>
  new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
)

function onTypeChange() {
  filterCategory.value  = ''
  filterTeacherId.value = ''
  filterStatus.value    = ''
}

function printReport() { window.print() }

async function loadReport() {
  if (!selectedAssignmentId.value) return
  loading.value = true
  // โหลดข้อมูลทั้งหมด แล้ว filter client-side
  allRows.value = await api.getReport({ assignmentId: selectedAssignmentId.value })
  loading.value = false
}

onMounted(() => data.loadAll())
</script>

<style>
@media print {
  .no-print { display: none !important; }
  nav       { display: none !important; }
  body      { font-family: 'Sarabun', sans-serif; background: white; }
  #print-area {
    border: none !important;
    box-shadow: none !important;
    padding: 0 !important;
    margin: 0 !important;
  }
  /* แต่ละกลุ่มสาระไม่ตัดหน้ากลางตาราง */
  .mb-8 { page-break-inside: avoid; }
}
</style>
