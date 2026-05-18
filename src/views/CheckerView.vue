<template>
  <div class="max-w-7xl mx-auto px-4 py-8 space-y-6">

    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <h1 class="text-xl font-bold text-gray-800">🔍 ตรวจสอบงาน</h1>
      <select v-model="selectedAssignmentId" @change="loadData"
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 sm:w-96">
        <option value="">— เลือกงาน —</option>
        <option v-for="a in data.assignments" :key="a.id" :value="a.id">
          {{ a.name }} (ปี {{ a.academic_year }} เทอม {{ a.semester }})
        </option>
      </select>
    </div>

    <template v-if="selectedAssignmentId">

      <!-- Action bar -->
      <div class="flex flex-wrap gap-2 items-center">
        <button @click="exportExcel"
          class="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
          📥 ส่งออก Excel
        </button>
        <button @click="clearAllSubmissions"
          class="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white text-sm px-4 py-2 rounded-lg font-medium transition">
          🗑️ ล้างข้อมูลการส่งทั้งหมด
        </button>
        <button @click="loadData"
          class="flex items-center gap-2 border border-gray-300 text-gray-600 hover:bg-gray-50 text-sm px-4 py-2 rounded-lg font-medium transition">
          🔄 รีเฟรช
        </button>
        <span class="text-xs text-gray-400 ml-auto">
          โหลดล่าสุด: {{ lastLoaded }}
        </span>
      </div>

      <!-- Loading -->
      <div v-if="data.loading" class="text-center py-16 text-gray-400">
        <svg class="animate-spin w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        กำลังโหลดข้อมูล...
      </div>
      <template v-else>
        <DashboardStats :stats="data.dashboard.stats" />

        <!-- inline badge filter -->
        <div class="flex flex-wrap gap-2">
          <button v-for="f in statusFilters" :key="f.value"
            @click="activeFilter = activeFilter === f.value ? '' : f.value"
            :class="activeFilter === f.value ? f.active : f.inactive"
            class="text-xs font-medium px-3 py-1.5 rounded-full border transition">
            {{ f.label }}
            <span class="ml-1 font-bold">{{ countByStatus(f.value) }}</span>
          </button>
        </div>

        <TeacherDataTable
          :rows="filteredRows"
          :show-actions="true"
          @edit="openEdit" />
      </template>
    </template>

    <div v-else class="text-center py-20 text-gray-300">
      <div class="text-6xl mb-3">🔍</div>
      <p>เลือกงานเพื่อเริ่มตรวจสอบ</p>
    </div>

    <!-- ══════ Edit modal ══════ -->
    <Teleport to="body">
      <div v-if="editModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="editModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">

          <!-- Teacher info -->
          <div class="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
            <img :src="editRow.imgurl" class="w-12 h-12 rounded-full object-cover border border-gray-200"
              @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(editRow.fullName)+'&background=1e3a5f&color=fff'" />
            <div class="flex-1 min-w-0">
              <h3 class="font-bold text-gray-800 truncate">{{ editRow.fullName }}</h3>
              <p class="text-xs text-gray-500">{{ editRow.categoryName }}</p>
            </div>
            <StatusBadge :status="editRow.status" />
          </div>

          <!-- ไฟล์ที่ครูส่ง -->
          <div v-if="editRow.linkUrl" class="mb-4 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
            <p class="text-xs font-medium text-blue-700 mb-1">📎 ไฟล์ที่ส่ง</p>
            <a :href="editRow.linkUrl" target="_blank" rel="noopener"
              class="text-sm text-blue-700 hover:text-blue-900 hover:underline font-medium break-all">
              {{ editRow.linkTitle || editRow.linkUrl }}
            </a>
          </div>

          <!-- Quick action buttons -->
          <p class="text-xs font-medium text-gray-500 mb-2">เปลี่ยนสถานะ</p>
          <div class="grid grid-cols-2 gap-2 mb-4">
            <button v-for="action in quickActions" :key="action.status"
              @click="editForm.status = action.status"
              :class="[action.cls, editForm.status === action.status ? 'ring-2 ring-offset-1' : 'opacity-60 hover:opacity-100']"
              class="flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-semibold transition">
              {{ action.icon }} {{ action.label }}
            </button>
          </div>

          <!-- Full select (กรณีบันทึกผิด) -->
          <details class="mb-3">
            <summary class="text-xs text-gray-400 cursor-pointer hover:text-gray-600 select-none">
              แก้ไขสถานะขั้นสูง (กรณีบันทึกผิดพลาด)
            </summary>
            <select v-model="editForm.status"
              class="w-full mt-2 border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option v-for="s in allStatuses" :key="s" :value="s">{{ s }}</option>
            </select>
          </details>

          <!-- หมายเหตุ -->
          <div class="mb-4">
            <label class="text-sm font-medium text-gray-700 block mb-1">
              {{ editForm.status === 'ขอแก้ไข' ? 'สิ่งที่ต้องแก้ไข *' : 'หมายเหตุ' }}
            </label>
            <textarea v-model="editForm.note" rows="3"
              :placeholder="editForm.status === 'ขอแก้ไข' ? 'ระบุรายละเอียดที่ต้องการให้แก้ไข...' : 'หมายเหตุเพิ่มเติม (ถ้ามี)'"
              class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
          </div>

          <button @click="handleSave" :disabled="saving"
            class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition">
            {{ saving ? 'กำลังบันทึก...' : 'บันทึก' }}
          </button>

          <button @click="editModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl">✕</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import DashboardStats   from '../components/DashboardStats.vue'
import TeacherDataTable from '../components/TeacherDataTable.vue'
import StatusBadge      from '../components/StatusBadge.vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'
import { api }          from '../services/api'
import { swal }         from '../services/swal'
import { exportSubmissions } from '../services/excel'

const data = useDataStore()
const auth = useAuthStore()

const selectedAssignmentId = ref('')
const editModal   = ref(false)
const editRow     = ref({})
const editForm    = ref({ status: '', note: '' })
const saving      = ref(false)
const lastLoaded  = ref('—')
const activeFilter = ref('')

const allStatuses = ['ยังไม่ส่ง', 'รอตรวจสอบ', 'ส่งเรียบร้อย', 'ขอแก้ไข', 'ไม่ผ่าน']

const quickActions = [
  { status: 'ส่งเรียบร้อย', label: 'อนุมัติ',  icon: '✓', cls: 'bg-green-100  text-green-700  ring-green-400' },
  { status: 'ขอแก้ไข',     label: 'ขอแก้ไข',  icon: '↩', cls: 'bg-orange-100 text-orange-700 ring-orange-400' },
  { status: 'ไม่ผ่าน',     label: 'ไม่ผ่าน',  icon: '✕', cls: 'bg-red-100    text-red-700    ring-red-400' },
  { status: 'ยังไม่ส่ง',   label: 'รีเซ็ต',    icon: '○', cls: 'bg-gray-100   text-gray-600   ring-gray-400' },
]

const statusFilters = [
  { value: 'รอตรวจสอบ',   label: 'รอตรวจสอบ',   active: 'bg-yellow-500 text-white border-yellow-500',  inactive: 'bg-white text-yellow-600 border-yellow-300 hover:bg-yellow-50' },
  { value: 'ส่งเรียบร้อย', label: 'ส่งเรียบร้อย', active: 'bg-green-500  text-white border-green-500',   inactive: 'bg-white text-green-600  border-green-300  hover:bg-green-50' },
  { value: 'ขอแก้ไข',     label: 'ขอแก้ไข',      active: 'bg-orange-500 text-white border-orange-500',  inactive: 'bg-white text-orange-600 border-orange-300 hover:bg-orange-50' },
  { value: 'ไม่ผ่าน',     label: 'ไม่ผ่าน',      active: 'bg-red-500    text-white border-red-500',     inactive: 'bg-white text-red-600    border-red-300    hover:bg-red-50' },
  { value: 'ยังไม่ส่ง',   label: 'ยังไม่ส่ง',    active: 'bg-gray-500   text-white border-gray-500',    inactive: 'bg-white text-gray-600   border-gray-300   hover:bg-gray-50' },
]

const filteredRows = computed(() => {
  const rows = data.dashboard.teachers || []
  if (!activeFilter.value) return rows
  return rows.filter(r => r.status === activeFilter.value)
})

function countByStatus(status) {
  return (data.dashboard.teachers || []).filter(r => r.status === status).length
}

async function loadData() {
  if (!selectedAssignmentId.value) return
  await data.loadDashboard(selectedAssignmentId.value)
  lastLoaded.value = new Date().toLocaleTimeString('th-TH')
}

function openEdit(row) {
  editRow.value   = row
  editForm.value  = { status: row.status || 'ยังไม่ส่ง', note: row.note || '' }
  editModal.value = true
}

async function handleSave() {
  saving.value = true
  swal.loading('กำลังบันทึก...')
  try {
    await api.saveSubmission({
      teacher_id:    editRow.value.id,
      assignment_id: selectedAssignmentId.value,
      status:        editForm.value.status,
      note:          editForm.value.note,
      link_url:      editRow.value.linkUrl   || '',
      link_title:    editRow.value.linkTitle || '',
    })
    swal.close()
    await swal.success('บันทึกเรียบร้อย', `${editRow.value.fullName} → ${editForm.value.status}`)
    editModal.value = false
    await loadData()
  } catch (e) {
    swal.close()
    swal.error('บันทึกไม่สำเร็จ', e.message)
  } finally {
    saving.value = false
  }
}

function exportExcel() {
  const rows = data.dashboard.teachers || []
  if (!rows.length) return swal.error('ไม่มีข้อมูล', 'กรุณาเลือกงานก่อน')
  const assignment = data.assignments.find(a => a.id === selectedAssignmentId.value)
  exportSubmissions(rows, assignment?.name || 'งาน', data.config)
  swal.success('ส่งออกสำเร็จ', 'ไฟล์ Excel ถูกดาวน์โหลดแล้ว')
}

async function clearAllSubmissions() {
  const result = await swal.confirmDanger(
    'ล้างข้อมูลการส่งทั้งหมด?',
    'ข้อมูลการส่งงานของงานนี้จะถูกลบทั้งหมด ไม่สามารถกู้คืนได้'
  )
  if (!result.isConfirmed) return

  swal.loading('กำลังล้างข้อมูล...')
  try {
    await api.clearSubmissions({ assignment_id: selectedAssignmentId.value })
    swal.close()
    await swal.success('ล้างข้อมูลเรียบร้อย')
    await loadData()
  } catch (e) {
    swal.close()
    swal.error('เกิดข้อผิดพลาด', e.message)
  }
}

onMounted(() => data.loadAssignments())
</script>
