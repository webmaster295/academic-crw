<template>
  <div>
    <Banner />

    <div class="max-w-7xl mx-auto px-4 py-8 space-y-8">

      <!-- การ์ดงานที่ต้องส่ง (เฉพาะครู) -->
      <section v-if="auth.isTeacher">
        <h2 class="text-lg font-bold text-gray-800 mb-4">📋 งานที่ต้องส่ง</h2>
        <div v-if="activeAssignments.length === 0" class="text-gray-400 text-sm">ไม่มีงานที่กำหนด</div>
        <div class="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="a in activeAssignments" :key="a.id"
            class="bg-white rounded-2xl border shadow-sm p-5 hover:shadow-md transition"
            :class="myStatus(a.id) === 'ขอแก้ไข' ? 'border-orange-300' : 'border-gray-200'">

            <!-- แจ้งเตือนขอแก้ไข -->
            <div v-if="myStatus(a.id) === 'ขอแก้ไข'"
              class="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-700 text-xs rounded-lg px-3 py-2 mb-3">
              <span>↩</span>
              <span>ผู้ตรวจขอให้แก้ไขและส่งใหม่</span>
            </div>

            <div class="flex justify-between items-start mb-2">
              <h3 class="font-semibold text-gray-800">{{ a.name }}</h3>
              <span class="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full shrink-0 ml-2">เทอม {{ a.semester }}</span>
            </div>
            <p class="text-sm text-gray-500 mb-3">{{ a.description || 'ไม่มีรายละเอียด' }}</p>

            <!-- สถานะปัจจุบัน -->
            <div class="flex items-center gap-2 mb-4">
              <span class="text-xs text-gray-400">สถานะ:</span>
              <StatusBadge :status="myStatus(a.id)" />
            </div>

            <div class="flex justify-between items-center gap-2">
              <span class="text-xs text-gray-400 shrink-0">กำหนดส่ง: {{ formatDate(a.due_date) }}</span>
              <div class="flex flex-col items-end gap-1">
                <!-- กำลังโหลดสถานะ -->
                <div v-if="statusLoading"
                  class="text-xs px-4 py-2 rounded-lg bg-gray-100 text-gray-400 animate-pulse whitespace-nowrap">
                  กำลังตรวจสอบ...
                </div>
                <template v-else>
                  <button @click="openSubmit(a)"
                    :disabled="!canSubmit(a.id)"
                    :class="canSubmit(a.id)
                      ? 'bg-blue-700 hover:bg-blue-800 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'"
                    class="text-xs px-4 py-2 rounded-lg font-medium transition whitespace-nowrap">
                    {{ submitLabel(a.id) }}
                  </button>
                  <span v-if="!canSubmit(a.id) && myStatus(a.id) !== 'ยังไม่ส่ง'"
                    class="text-xs text-gray-400 italic">
                    หากต้องการแก้ไขติดต่อแอดมิน
                  </span>
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- dropdown เลือกงาน + dashboard -->
      <section>
        <div class="flex flex-col items-center text-center gap-3 mb-6">
          <h2 class="text-lg font-bold text-gray-800">📊 ดูสถานะงาน</h2>
          <select v-model="selectedAssignmentId" @change="loadDashboard"
            class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 w-full max-w-sm">
            <option value="">— เลือกงานที่ต้องการดู —</option>
            <option v-for="a in visibleAssignments" :key="a.id" :value="a.id">
              {{ a.name }} (ปี {{ a.academic_year }} เทอม {{ a.semester }})
            </option>
          </select>
        </div>

        <template v-if="selectedAssignmentId">
          <div v-if="data.loading" class="text-center py-16 text-gray-400">
            <svg class="animate-spin w-8 h-8 mx-auto mb-2 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            กำลังโหลดข้อมูล...
          </div>
          <template v-else>
            <DashboardStats :rows="filteredDashboardRows" class="mb-6" />
            <TeacherDataTable :rows="data.dashboard.teachers" :show-actions="false"
              @filtered="filteredDashboardRows = $event" />
          </template>
        </template>
        <div v-else class="text-center py-16 text-gray-300">
          <div class="text-6xl mb-3">📂</div>
          <p class="text-sm">เลือกงานด้านบนเพื่อดูสถานะ</p>
        </div>
      </section>
    </div>

    <!-- Modal ส่งงาน (ครู) -->
    <Teleport to="body">
      <div v-if="submitModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" @click="submitModal = false"></div>
        <div class="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10">
          <h3 class="font-bold text-gray-800 mb-1">บันทึกการส่งงาน</h3>
          <p class="text-sm text-blue-700 font-medium mb-4">{{ currentAssignment?.name }}</p>

          <!-- แจ้งสถานะที่จะส่ง -->
          <div class="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 mb-4 flex items-center gap-3">
            <span class="text-2xl">⏳</span>
            <div>
              <p class="text-sm font-semibold text-yellow-800">สถานะหลังส่ง: รอตรวจสอบ</p>
              <p class="text-xs text-yellow-600">ผู้ตรวจสอบจะอนุมัติและเปลี่ยนสถานะให้ภายหลัง</p>
            </div>
          </div>

          <div class="space-y-3">
            <!-- ลิงค์ไฟล์งาน -->
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ลิงค์ไฟล์งาน</label>
              <input v-model="submitForm.link_url" type="url"
                placeholder="https://drive.google.com/..."
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
              <p class="text-xs text-amber-600 mt-1">⚠ ลิงค์ต้องตั้งเป็นสาธารณะ (Anyone with link) ก่อนส่ง</p>
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">ชื่อหัวข้อที่ส่ง</label>
              <input v-model="submitForm.link_title"
                placeholder="เช่น แผนการสอน บทที่ 1 ภาษาไทย"
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">หมายเหตุ (ถ้ามี)</label>
              <textarea v-model="submitForm.note" rows="2" placeholder="รายละเอียดเพิ่มเติม..."
                class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
            </div>
            <button @click="handleSubmit" :disabled="submitLoading"
              class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-2.5 rounded-xl text-sm font-medium transition">
              {{ submitLoading ? 'กำลังบันทึก...' : '📤 ส่งงาน' }}
            </button>
          </div>
          <button @click="submitModal = false" class="absolute top-4 right-4 text-gray-400 hover:text-gray-600">✕</button>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import Banner from '../components/Banner.vue'
import DashboardStats from '../components/DashboardStats.vue'
import TeacherDataTable from '../components/TeacherDataTable.vue'
import StatusBadge from '../components/StatusBadge.vue'
import { useDataStore } from '../stores/data'
import { useAuthStore } from '../stores/auth'
import { api } from '../services/api'

const data = useDataStore()
const auth = useAuthStore()

const selectedAssignmentId  = ref('')
const filteredDashboardRows = ref([])
const submitModal   = ref(false)
const submitLoading = ref(false)
const currentAssignment = ref(null)
const submitForm    = ref({ note: '', link_url: '', link_title: '' })

// map สถานะงานทั้งหมดของครูที่ login อยู่ { assignmentId: status }
const myStatusMap    = ref({})
const statusLoading  = ref(true)   // true จนกว่าจะโหลด submissions เสร็จ

async function loadMySubmissions() {
  if (!auth.isTeacher || !auth.user?.id) { statusLoading.value = false; return }
  try {
    const rows = await api.getMySubmissions(auth.user.id)
    const map = {}
    if (Array.isArray(rows)) {
      rows.forEach(r => { map[String(r.assignment_id)] = r.status })
    }
    myStatusMap.value = map
  } catch (e) {
    console.error('loadMySubmissions error:', e)
  } finally {
    statusLoading.value = false
  }
}

function myStatus(assignmentId) {
  return myStatusMap.value[String(assignmentId)] || 'ยังไม่ส่ง'
}

// ครูส่งได้เมื่อ: ยังไม่ส่ง หรือ ขอแก้ไข เท่านั้น
function canSubmit(assignmentId) {
  const s = myStatus(assignmentId)
  return s === 'ยังไม่ส่ง' || s === 'ขอแก้ไข'
}

function submitLabel(assignmentId) {
  const s = myStatus(assignmentId)
  if (s === 'รอตรวจสอบ')   return '⏳ รอการตรวจสอบ'
  if (s === 'ส่งเรียบร้อย') return '✓ ส่งเรียบร้อยแล้ว'
  if (s === 'ขอแก้ไข')     return '↩ ส่งใหม่'
  if (s === 'ไม่ผ่าน')     return '✕ ไม่ผ่าน'
  return '📤 ส่งงาน'
}

const activeAssignments = computed(() =>
  data.assignments.filter(a => a.is_active === true || a.is_active === 'TRUE')
)
const visibleAssignments = computed(() =>
  data.assignments.filter(a => a.is_visible !== false)
)

function formatDate(d) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
}

function openSubmit(assignment) {
  if (!canSubmit(assignment.id)) return
  currentAssignment.value = assignment
  submitForm.value = { note: '', link_url: '', link_title: '' }
  submitModal.value = true
}

async function loadDashboard() {
  if (!selectedAssignmentId.value) return
  filteredDashboardRows.value = []
  await data.loadDashboard(selectedAssignmentId.value)
}

async function handleSubmit() {
  submitLoading.value = true
  await api.saveSubmission({
    teacher_id:    auth.user.id,
    assignment_id: currentAssignment.value.id,
    status:        'รอตรวจสอบ',
    note:          submitForm.value.note,
    link_url:      submitForm.value.link_url,
    link_title:    submitForm.value.link_title,
  })
  // อัปเดต map สถานะทันทีโดยไม่ต้องรอโหลดใหม่
  myStatusMap.value[String(currentAssignment.value.id)] = 'รอตรวจสอบ'
  submitLoading.value = false
  submitModal.value = false
  if (selectedAssignmentId.value) loadDashboard()
}

// โหลดใหม่ทุกครั้งที่ teacher login (รวมกรณีเปิดหน้าก่อน login)
watch(() => auth.user?.id, (id) => {
  if (id && auth.isTeacher) {
    statusLoading.value = true
    loadMySubmissions()
  }
})

onMounted(() => {
  Promise.all([data.loadAll(), loadMySubmissions()])
})
</script>
