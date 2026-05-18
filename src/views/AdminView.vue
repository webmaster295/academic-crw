<template>
  <div class="max-w-7xl mx-auto px-4 py-8">
    <h1 class="text-xl font-bold text-gray-800 mb-6">⚙️ จัดการระบบ</h1>

    <!-- Tabs -->
    <div class="flex gap-1 mb-6 border-b border-gray-200 overflow-x-auto">
      <button v-for="tab in tabs" :key="tab.key" @click="activeTab = tab.key"
        :class="activeTab === tab.key
          ? 'border-b-2 border-blue-700 text-blue-700 bg-blue-50'
          : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'"
        class="px-4 py-2.5 text-sm font-medium whitespace-nowrap transition rounded-t-lg">
        {{ tab.icon }} {{ tab.label }}
      </button>
    </div>

    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: งาน                                  -->
    <!-- ══════════════════════════════════════════ -->
    <section v-if="activeTab === 'assignments'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold text-gray-700">รายการงาน</h2>
        <button @click="openAssignmentModal()" class="btn-primary">+ เพิ่มงานใหม่</button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-2 py-3 text-center w-16">ลำดับ</th>
              <th class="px-4 py-3 text-left">ชื่องาน</th>
              <th class="px-4 py-3 text-center hidden sm:table-cell">ภาคเรียน</th>
              <th class="px-4 py-3 text-center hidden sm:table-cell">ปีการศึกษา</th>
              <th class="px-4 py-3 text-center hidden md:table-cell">กำหนดส่ง</th>
              <th class="px-4 py-3 text-center">สถานะ</th>
              <th class="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="assignments.length === 0"><td colspan="7" class="text-center py-8 text-gray-300">ยังไม่มีรายการ</td></tr>
            <tr v-for="(a, idx) in assignments" :key="a.id" class="border-t border-gray-100 hover:bg-gray-50">
              <!-- ↑↓ reorder -->
              <td class="px-2 py-3 text-center">
                <div class="flex flex-col items-center gap-0.5">
                  <button @click="moveAssignment(idx, -1)" :disabled="idx === 0"
                    class="text-gray-400 hover:text-blue-600 disabled:opacity-20 leading-none text-base px-1">▲</button>
                  <button @click="moveAssignment(idx, 1)" :disabled="idx === assignments.length - 1"
                    class="text-gray-400 hover:text-blue-600 disabled:opacity-20 leading-none text-base px-1">▼</button>
                </div>
              </td>
              <td class="px-4 py-3 font-medium">
                <span v-if="a.is_pinned" class="text-amber-500 mr-1" title="ปักหมุด">📌</span>
                {{ a.name }}
              </td>
              <td class="px-4 py-3 text-center hidden sm:table-cell">{{ a.semester }}</td>
              <td class="px-4 py-3 text-center hidden sm:table-cell">{{ a.academic_year }}</td>
              <td class="px-4 py-3 text-center text-xs text-gray-500 hidden md:table-cell">{{ a.due_date || '—' }}</td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-wrap gap-1 justify-center">
                  <span :class="isActive(a) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'"
                    class="text-xs px-2 py-0.5 rounded-full">{{ isActive(a) ? 'เปิดใช้' : 'ปิด' }}</span>
                  <span :class="a.is_visible ? 'bg-blue-100 text-blue-600' : 'bg-red-50 text-red-400'"
                    class="text-xs px-2 py-0.5 rounded-full">{{ a.is_visible ? '👁 แสดง' : '🚫 ซ่อน' }}</span>
                  <span v-if="a.is_pinned" class="text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-600">📌 ปักหมุด</span>
                </div>
              </td>
              <td class="px-4 py-3 text-center">
                <div class="flex flex-wrap gap-1.5 justify-center">
                  <button @click="togglePin(a)" :title="a.is_pinned ? 'เลิกปักหมุด' : 'ปักหมุด'"
                    class="text-amber-500 hover:text-amber-700 text-sm">{{ a.is_pinned ? '📌' : '📍' }}</button>
                  <button @click="toggleVisible(a)" :title="a.is_visible ? 'ซ่อน' : 'แสดง'"
                    class="text-blue-500 hover:text-blue-700 text-sm">{{ a.is_visible ? '👁' : '🚫' }}</button>
                  <button @click="exportAssignment(a)" class="text-green-600 hover:underline text-xs">📥</button>
                  <button @click="openAssignmentModal(a)" class="text-blue-600 hover:underline text-xs">แก้ไข</button>
                  <button @click="confirmDelete('assignment', a.id, a.name)" class="text-red-500 hover:underline text-xs">ลบ</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: ครู                                   -->
    <!-- ══════════════════════════════════════════ -->
    <section v-if="activeTab === 'teachers'">
      <div class="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center mb-4">
        <h2 class="font-semibold text-gray-700">รายชื่อครู ({{ filteredTeachers.length }} คน)</h2>
        <div class="flex gap-2 w-full sm:w-auto">
          <input v-model="teacherSearch" placeholder="ค้นหาชื่อ..." class="input-sm flex-1 sm:w-40" />
          <select v-model="teacherCatFilter" class="input-sm">
            <option value="">ทุกกลุ่มสาระ</option>
            <option v-for="c in teacherCategories" :key="c" :value="c">{{ c }}</option>
          </select>
          <input ref="excelFileInput" type="file" accept=".xlsx,.xls,.csv" class="hidden" @change="handleExcelImport" />
          <button @click="excelFileInput.click()" class="btn-secondary shrink-0">📥 นำเข้า Excel</button>
          <button @click="openTeacherModal()" class="btn-primary shrink-0">+ เพิ่มครู</button>
        </div>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left">ครู</th>
              <th class="px-4 py-3 text-left hidden md:table-cell">กลุ่มสาระ</th>
              <th class="px-4 py-3 text-center hidden sm:table-cell">รหัสครู</th>
              <th class="px-4 py-3 text-center hidden lg:table-cell">citizenId</th>
              <th class="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="filteredTeachers.length === 0"><td colspan="5" class="text-center py-8 text-gray-300">ไม่พบข้อมูล</td></tr>
            <tr v-for="t in pagedTeachers" :key="t.teacherId" class="border-t border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-3">
                <div class="flex items-center gap-3">
                  <img :src="t.imgurl" class="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                    @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(t.fullName)+'&background=1e3a5f&color=fff'" />
                  <div>
                    <div class="font-medium text-gray-800">{{ t.fullName }}</div>
                    <div class="text-xs text-gray-400 md:hidden">{{ t.categoryName }}</div>
                  </div>
                </div>
              </td>
              <td class="px-4 py-3 hidden md:table-cell">
                <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{{ t.categoryName }}</span>
              </td>
              <td class="px-4 py-3 text-center font-mono text-xs hidden sm:table-cell">{{ t.teacherId }}</td>
              <td class="px-4 py-3 text-center font-mono text-xs hidden lg:table-cell text-gray-400">{{ t.citizenId }}</td>
              <td class="px-4 py-3 text-center space-x-2">
                <button @click="openTeacherModal(t)" class="text-blue-600 hover:underline text-xs">แก้ไข</button>
                <button @click="confirmDelete('teacher', t.teacherId, t.fullName)" class="text-red-500 hover:underline text-xs">ลบ</button>
              </td>
            </tr>
          </tbody>
        </table>
        <!-- pagination ครู -->
        <div class="px-4 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
          <span>แสดง {{ teacherRangeStart }}–{{ teacherRangeEnd }} จาก {{ filteredTeachers.length }}</span>
          <div class="flex gap-1">
            <button @click="teacherPage--" :disabled="teacherPage===1" class="pag-btn">‹</button>
            <span class="px-3 py-1 bg-blue-700 text-white rounded-lg">{{ teacherPage }}/{{ teacherTotalPages }}</span>
            <button @click="teacherPage++" :disabled="teacherPage===teacherTotalPages" class="pag-btn">›</button>
          </div>
        </div>
      </div>
    </section>


    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: บัญชี                                -->
    <!-- ══════════════════════════════════════════ -->
    <section v-if="activeTab === 'accounts'">
      <div class="flex justify-between items-center mb-4">
        <h2 class="font-semibold text-gray-700">บัญชี Admin / Checker</h2>
        <button @click="openAccountModal()" class="btn-primary">+ เพิ่มบัญชี</button>
      </div>
      <div class="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <table class="min-w-full text-sm">
          <thead class="bg-gray-50 text-gray-600">
            <tr>
              <th class="px-4 py-3 text-left">ชื่อ</th>
              <th class="px-4 py-3 text-center">username</th>
              <th class="px-4 py-3 text-center">บทบาท</th>
              <th class="px-4 py-3 text-center">สถานะ</th>
              <th class="px-4 py-3 text-center">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-if="accounts.length === 0"><td colspan="5" class="text-center py-8 text-gray-300">ยังไม่มีรายการ</td></tr>
            <tr v-for="a in accounts" :key="a.id" class="border-t border-gray-100 hover:bg-gray-50">
              <td class="px-4 py-3 font-medium">{{ a.full_name }}</td>
              <td class="px-4 py-3 text-center font-mono text-xs">{{ a.username }}</td>
              <td class="px-4 py-3 text-center">
                <span :class="a.role==='admin'?'bg-purple-100 text-purple-700':'bg-blue-100 text-blue-700'"
                  class="text-xs px-2 py-1 rounded-full">{{ a.role }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <span :class="isActiveAcc(a)?'bg-green-100 text-green-700':'bg-gray-100 text-gray-500'"
                  class="text-xs px-2 py-1 rounded-full">{{ isActiveAcc(a) ? 'ใช้งาน' : 'ระงับ' }}</span>
              </td>
              <td class="px-4 py-3 text-center">
                <button @click="openAccountModal(a)" class="text-blue-600 hover:underline text-xs">แก้ไข</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ -->
    <!-- TAB: config                               -->
    <!-- ══════════════════════════════════════════ -->
    <section v-if="activeTab === 'config'">
      <h2 class="font-semibold text-gray-700 mb-4">ตั้งค่าระบบ</h2>
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg space-y-4">
        <div v-for="field in configFields" :key="field.key">
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ field.label }}</label>
          <div v-if="field.type === 'color'" class="flex items-center gap-3">
            <input type="color" v-model="configForm[field.key]"
              class="w-10 h-10 rounded border border-gray-300 cursor-pointer p-0.5" />
            <span class="text-sm text-gray-500 font-mono">{{ configForm[field.key] }}</span>
          </div>
          <input v-else v-model="configForm[field.key]" type="text" class="input-field" />
        </div>
        <button @click="saveConfig" :disabled="savingConfig"
          class="bg-blue-700 text-white text-sm px-6 py-2.5 rounded-lg hover:bg-blue-800 disabled:opacity-60 transition">
          {{ savingConfig ? 'กำลังบันทึก...' : 'บันทึกการตั้งค่า' }}
        </button>
      </div>

      <!-- Supabase info -->
      <div class="bg-white rounded-xl border border-gray-200 shadow-sm p-6 max-w-lg mt-4">
        <h3 class="font-semibold text-gray-700 mb-1">ฐานข้อมูล Supabase</h3>
        <p class="text-xs text-gray-400 mb-2">ระบบเชื่อมต่อกับ Supabase โดยตรง ไม่ต้องตั้งค่าเพิ่มเติม</p>
        <p class="text-xs font-mono bg-gray-50 border rounded-lg px-3 py-2 text-gray-600 break-all">
          kflwcriegxxdhdarfsqy.supabase.co
        </p>
      </div>
    </section>

    <!-- ══════════════════════════════════════════ -->
    <!-- MODALS                                    -->
    <!-- ══════════════════════════════════════════ -->

    <!-- Modal: Assignment -->
    <Teleport to="body">
      <div v-if="assignmentModal" class="modal-backdrop">
        <div class="absolute inset-0 bg-black/50" @click="assignmentModal=false"></div>
        <div class="modal-box">
          <h3 class="font-bold mb-4">{{ editingAssignment.id ? 'แก้ไขงาน' : 'เพิ่มงานใหม่' }}</h3>
          <div class="space-y-3">
            <input v-model="editingAssignment.name" placeholder="ชื่องาน *" class="input-field" />
            <textarea v-model="editingAssignment.description" placeholder="รายละเอียด" rows="2" class="input-field"></textarea>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-sm">ภาคเรียน</label>
                <input v-model="editingAssignment.semester" placeholder="เช่น 1" class="input-field" />
              </div>
              <div>
                <label class="label-sm">ปีการศึกษา</label>
                <input v-model="editingAssignment.academic_year" placeholder="เช่น 2567" class="input-field" />
              </div>
            </div>
            <div>
              <label class="label-sm">กำหนดส่ง</label>
              <input v-model="editingAssignment.due_date" type="date" class="input-field" />
            </div>
            <div class="flex flex-col gap-2 pt-1">
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="editingAssignment.is_active" class="w-4 h-4 accent-blue-700" />
                เปิดใช้งาน (ครูส่งงานได้)
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="editingAssignment.is_visible" class="w-4 h-4 accent-blue-700" />
                แสดงในตัวเลือกงาน (dropdown)
              </label>
              <label class="flex items-center gap-2 text-sm cursor-pointer">
                <input type="checkbox" v-model="editingAssignment.is_pinned" class="w-4 h-4 accent-amber-500" />
                ปักหมุดแรก 📌
              </label>
            </div>
            <button @click="handleSaveAssignment" :disabled="savingAssignment" class="btn-save">
              {{ savingAssignment ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
          <button @click="assignmentModal=false" class="modal-close">✕</button>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Teacher -->
    <Teleport to="body">
      <div v-if="teacherModal" class="modal-backdrop">
        <div class="absolute inset-0 bg-black/50" @click="teacherModal=false"></div>
        <div class="modal-box">
          <h3 class="font-bold mb-4">{{ editingTeacher.teacherId ? 'แก้ไขข้อมูลครู' : 'เพิ่มครูใหม่' }}</h3>
          <div class="space-y-3">
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="label-sm">รหัสครู (teacherId) *</label>
                <input v-model="editingTeacher.teacherId" placeholder="เช่น t105" class="input-field" />
              </div>
              <div>
                <label class="label-sm">รหัสผ่าน (citizenId) *</label>
                <input v-model="editingTeacher.citizenId" placeholder="เลขบัตร/รหัส" class="input-field" />
              </div>
            </div>
            <p v-if="editingTeacher._isEdit" class="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2">
              แก้ไขรหัสครูหรือรหัสผ่านได้เลย — ประวัติการส่งงานจะยังคงอยู่
            </p>
            <div>
              <label class="label-sm">ชื่อ-นามสกุล (fullName) *</label>
              <input v-model="editingTeacher.fullName" placeholder="เช่น นางสาวชื่อ นามสกุล" class="input-field" />
            </div>
            <div>
              <label class="label-sm">กลุ่มสาระ (categoryName) *</label>
              <input v-model="editingTeacher.categoryName" list="cat-list" placeholder="เช่น กลุ่มสาระภาษาไทย" class="input-field" />
              <datalist id="cat-list">
                <option v-for="c in teacherCategories" :key="c" :value="c" />
              </datalist>
            </div>
            <div>
              <label class="label-sm">URL รูปภาพ (imgurl)</label>
              <input v-model="editingTeacher.imgurl" placeholder="https://..." class="input-field" />
              <img v-if="editingTeacher.imgurl" :src="editingTeacher.imgurl"
                class="w-12 h-12 rounded-full object-cover mt-2 border"
                @error="e => e.target.style.display='none'" />
            </div>
            <button @click="handleSaveTeacher" :disabled="savingTeacher" class="btn-save">
              {{ savingTeacher ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
          <button @click="teacherModal=false" class="modal-close">✕</button>
        </div>
      </div>
    </Teleport>

    <!-- Modal: Account -->
    <Teleport to="body">
      <div v-if="accountModal" class="modal-backdrop">
        <div class="absolute inset-0 bg-black/50" @click="accountModal=false"></div>
        <div class="modal-box">
          <h3 class="font-bold mb-4">{{ editingAccount.id ? 'แก้ไขบัญชี' : 'เพิ่มบัญชีใหม่' }}</h3>
          <div class="space-y-3">
            <div>
              <label class="label-sm">ชื่อ-นามสกุล *</label>
              <input v-model="editingAccount.full_name" placeholder="ชื่อ-นามสกุล" class="input-field" />
            </div>
            <div>
              <label class="label-sm">username *</label>
              <input v-model="editingAccount.username" class="input-field" />
            </div>
            <div>
              <label class="label-sm">{{ editingAccount.id ? 'รหัสผ่านใหม่ (ว่าง=ไม่เปลี่ยน)' : 'รหัสผ่าน *' }}</label>
              <input v-model="editingAccount.password" type="password" class="input-field" />
            </div>
            <div>
              <label class="label-sm">บทบาท</label>
              <select v-model="editingAccount.role" class="input-field">
                <option value="checker">checker — ผู้ตรวจสอบ</option>
                <option value="admin">admin — ผู้ดูแลระบบ</option>
              </select>
            </div>
            <label class="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" v-model="editingAccount.is_active" class="w-4 h-4 accent-blue-700" />
              เปิดใช้งาน
            </label>
            <button @click="handleSaveAccount" :disabled="savingAccount" class="btn-save">
              {{ savingAccount ? 'กำลังบันทึก...' : 'บันทึก' }}
            </button>
          </div>
          <button @click="accountModal=false" class="modal-close">✕</button>
        </div>
      </div>
    </Teleport>

  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { api } from '../services/api'
import { useDataStore } from '../stores/data'
import { swal } from '../services/swal'
import * as XLSX from 'xlsx'
import { exportSubmissions } from '../services/excel'

const data = useDataStore()

const activeTab = ref('assignments')
const tabs = [
  { key: 'assignments', label: 'จัดการงาน',    icon: '📋' },
  { key: 'teachers',    label: 'จัดการครู',     icon: '👩‍🏫' },
  { key: 'accounts',    label: 'บัญชีผู้ใช้',   icon: '👤' },
  { key: 'config',      label: 'ตั้งค่าระบบ',   icon: '⚙️' },
]

const isActive    = a => a.is_active === true || a.is_active === 'TRUE'
const isActiveAcc = a => a.is_active === true || a.is_active === 'TRUE'

// ── Assignments ────────────────────────────────
const assignments      = ref([])
const assignmentModal  = ref(false)
const savingAssignment = ref(false)
const editingAssignment = ref({})

function openAssignmentModal(a = null) {
  editingAssignment.value = a
    ? { ...a }
    : { name:'', description:'', semester:'', academic_year:'', due_date:'', is_active:true, is_visible:true, is_pinned:false }
  assignmentModal.value = true
}

// ── เลื่อนลำดับ ↑↓ ──────────────────────────────
async function moveAssignment(idx, dir) {
  const arr = assignments.value
  const swapIdx = idx + dir
  if (swapIdx < 0 || swapIdx >= arr.length) return

  // สร้างลำดับใหม่โดยสลับ 2 รายการ แล้วอัปเดต sort_order ทุกตัว
  const newOrder = [...arr]
  ;[newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]]
  const updates = newOrder.map((a, i) => ({ id: a.id, sort_order: i * 10 }))
  await api.updateSortOrders(updates)
  await loadAssignments()
}

// ── Toggle pin / visible ─────────────────────────
async function togglePin(a) {
  await api.saveAssignment({ ...a, is_pinned: !a.is_pinned })
  await loadAssignments()
}
async function toggleVisible(a) {
  await api.saveAssignment({ ...a, is_visible: !a.is_visible })
  await loadAssignments()
}
async function handleSaveAssignment() {
  savingAssignment.value = true
  await api.saveAssignment(editingAssignment.value)
  await loadAssignments()
  savingAssignment.value = false
  assignmentModal.value = false
}
async function loadAssignments() {
  assignments.value = await api.getAssignments({})
}

// ── Teachers ───────────────────────────────────
const teachers       = ref([])
const teacherModal   = ref(false)
const savingTeacher  = ref(false)
const editingTeacher = ref({})
const teacherSearch  = ref('')
const teacherCatFilter = ref('')
const teacherPage    = ref(1)
const teacherPageSize = 15

const teacherCategories = computed(() =>
  [...new Set(teachers.value.map(t => t.categoryName).filter(Boolean))].sort()
)
const filteredTeachers = computed(() =>
  teachers.value.filter(t => {
    if (teacherSearch.value && !t.fullName?.includes(teacherSearch.value)) return false
    if (teacherCatFilter.value && t.categoryName !== teacherCatFilter.value) return false
    return true
  })
)
const teacherTotalPages = computed(() => Math.max(1, Math.ceil(filteredTeachers.value.length / teacherPageSize)))
const pagedTeachers = computed(() => {
  const s = (teacherPage.value - 1) * teacherPageSize
  return filteredTeachers.value.slice(s, s + teacherPageSize)
})
const teacherRangeStart = computed(() => filteredTeachers.value.length === 0 ? 0 : (teacherPage.value - 1) * teacherPageSize + 1)
const teacherRangeEnd   = computed(() => Math.min(teacherPage.value * teacherPageSize, filteredTeachers.value.length))
watch([teacherSearch, teacherCatFilter], () => { teacherPage.value = 1 })

function openTeacherModal(t = null) {
  editingTeacher.value = t ? { ...t, _isEdit: true } : { teacherId:'', citizenId:'', fullName:'', categoryName:'', imgurl:'' }
  teacherModal.value = true
}
async function handleSaveTeacher() {
  if (!editingTeacher.value.teacherId || !editingTeacher.value.fullName) return swal.error('กรุณากรอกข้อมูล', 'teacherId และชื่อ-นามสกุล จำเป็นต้องกรอก')
  savingTeacher.value = true
  await api.saveTeacher(editingTeacher.value)
  await loadTeachers()
  savingTeacher.value = false
  teacherModal.value = false
}
async function loadTeachers() {
  teachers.value = await api.getTeachers()
}

// ── Excel Import ────────────────────────────────
const excelFileInput = ref(null)

async function handleExcelImport(e) {
  const file = e.target.files[0]
  e.target.value = ''
  if (!file) return

  // อ่านไฟล์
  const data = await file.arrayBuffer()
  const wb = XLSX.read(data)
  const ws = wb.Sheets[wb.SheetNames[0]]
  const rows = XLSX.utils.sheet_to_json(ws, { defval: '' })

  if (rows.length === 0) return swal.error('ไม่พบข้อมูล', 'ไฟล์ Excel ไม่มีข้อมูลในชีตแรก')

  // แสดงตัวอย่าง 3 แถวแรก + จำนวนทั้งหมด
  const preview = rows.slice(0, 3).map(r =>
    `${r.teacherId || r.teacher_id || ''} | ${r.fullName || r.full_name || ''} | ${r.categoryName || r.category_name || ''}`
  ).join('\n')

  const ok = await swal.confirm(
    `นำเข้าครู ${rows.length} คน?`,
    `คอลัมน์ที่ต้องมี: teacherId, fullName, citizenId, categoryName\n\nตัวอย่าง:\n${preview}\n\nข้อมูลที่มีอยู่แล้วจะถูกอัปเดต`,
    'นำเข้า'
  )
  if (!ok.isConfirmed) return

  // นำเข้าทีละคน แสดง progress
  let success = 0, failed = 0
  for (let i = 0; i < rows.length; i++) {
    const r = rows[i]
    const teacher = {
      teacherId:    String(r.teacherId    || r.teacher_id    || '').trim(),
      fullName:     String(r.fullName     || r.full_name     || '').trim(),
      citizenId:    String(r.citizenId    || r.citizen_id    || '').trim(),
      categoryName: String(r.categoryName || r.category_name || '').trim(),
      imgurl:       String(r.imgurl       || r.img_url       || '').trim(),
    }
    if (!teacher.teacherId || !teacher.fullName) { failed++; continue }
    try {
      await api.saveTeacher(teacher)
      success++
    } catch { failed++ }
    // อัปเดต progress ทุก 5 คน
    if ((i + 1) % 5 === 0 || i === rows.length - 1) {
      swal.loading(`กำลังนำเข้า... ${i + 1}/${rows.length}`)
    }
  }

  swal.close()
  await loadTeachers()
  if (failed === 0) {
    swal.success(`นำเข้าสำเร็จ ${success} คน`)
  } else {
    swal.warning('นำเข้าเสร็จสิ้น', `สำเร็จ ${success} คน / ล้มเหลว ${failed} คน (แถวที่ไม่มี teacherId หรือ fullName จะถูกข้ามไป)`)
  }
}

// ── Accounts ────────────────────────────────────
const accounts      = ref([])
const accountModal  = ref(false)
const savingAccount = ref(false)
const editingAccount = ref({})

function openAccountModal(a = null) {
  editingAccount.value = a ? { ...a, password:'' } : { full_name:'', username:'', password:'', role:'checker', is_active:true }
  accountModal.value = true
}
async function handleSaveAccount() {
  savingAccount.value = true
  await api.saveAccount(editingAccount.value)
  await loadAccounts()
  savingAccount.value = false
  accountModal.value = false
}
async function loadAccounts() {
  accounts.value = await api.getAccounts()
}

// ── Delete dialog ───────────────────────────────
const deleteDialog = ref({ show: false })  // ไม่ใช้แล้ว — ใช้ swal แทน

// ── Export ──────────────────────────────────────
async function exportAssignment(a) {
  swal.loading(`กำลังโหลดข้อมูล "${a.name}"...`)
  try {
    const { teachers } = await api.getDashboard(a.id)
    swal.close()
    exportSubmissions(teachers, a.name, data.config)
    swal.success('ส่งออกสำเร็จ', `ไฟล์ Excel "${a.name}" ถูกดาวน์โหลดแล้ว`)
  } catch (e) {
    swal.close()
    swal.error('เกิดข้อผิดพลาด', e.message)
  }
}

async function confirmDelete(type, id, name) {
  const text = type === 'assignment'
    ? `ต้องการลบงาน "${name}" ?\n\n⚠ ข้อมูลการส่งงานของครูทั้งหมดในงานนี้จะถูกลบด้วย`
    : `ต้องการลบ "${name}" ?`
  const result = await swal.confirmDanger('ยืนยันการลบ', text)
  if (!result.isConfirmed) return
  swal.loading('กำลังลบ...')
  if (type === 'assignment') {
    await api.deleteAssignment(id)
    await loadAssignments()
  } else if (type === 'teacher') {
    await api.deleteTeacher(id)
    await loadTeachers()
  }
  swal.close()
  swal.success('ลบเรียบร้อย')
}
async function executeDelete() { /* unused */ }

// ── Config ──────────────────────────────────────
const configFields = [
  { key: 'system_name',              label: 'ชื่อระบบ' },
  { key: 'school_name',              label: 'ชื่อโรงเรียน' },
  { key: 'semester',                 label: 'ภาคเรียน' },
  { key: 'academic_year',            label: 'ปีการศึกษา' },
  { key: 'banner_color',             label: 'สีแบนเนอร์', type: 'color' },
  { key: 'banner_color2',            label: 'สีแบนเนอร์ 2', type: 'color' },
  { key: 'logo_url',                 label: 'URL โลโก้โรงเรียน' },
  { key: 'academic_head_name',       label: 'ชื่อหัวหน้ากลุ่มบริหารวิชาการ' },
  { key: 'academic_head_position',   label: 'ตำแหน่งหัวหน้ากลุ่มบริหารวิชาการ' },
  { key: 'deputy_director_name',     label: 'ชื่อรองผู้อำนวยการกลุ่มบริหารวิชาการ' },
  { key: 'deputy_director_position', label: 'ตำแหน่งรองผู้อำนวยการกลุ่มบริหารวิชาการ' },
]
const configForm   = ref({})
const savingConfig = ref(false)

async function saveConfig() {
  savingConfig.value = true
  await api.updateConfig({ ...configForm.value })
  await data.loadConfig()
  savingConfig.value = false
  swal.success('บันทึกการตั้งค่าเรียบร้อย')
}

onMounted(async () => {
  await Promise.all([loadAssignments(), loadTeachers(), loadAccounts(), data.loadConfig()])
  const cfg = { ...data.config }
  // input[type=color] ต้องการค่า #rrggbb เสมอ
  if (!cfg.banner_color  || !cfg.banner_color.startsWith('#'))  cfg.banner_color  = '#1e3a5f'
  if (!cfg.banner_color2 || !cfg.banner_color2.startsWith('#')) cfg.banner_color2 = '#1e6fa8'
  configForm.value = cfg
})
</script>

<style scoped>
@reference "tailwindcss";
.input-field { @apply w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500; }
.input-sm    { @apply border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500; }
.label-sm    { @apply block text-xs font-medium text-gray-600 mb-1; }
.btn-primary   { @apply bg-blue-700 text-white text-sm px-4 py-2 rounded-lg hover:bg-blue-800 transition font-medium; }
.btn-secondary { @apply bg-white text-gray-700 text-sm px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition font-medium; }
.btn-save    { @apply w-full bg-blue-700 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-blue-800 disabled:opacity-60 transition; }
.modal-backdrop { @apply fixed inset-0 z-50 flex items-center justify-center p-4; }
.modal-box   { @apply relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 z-10 max-h-[90vh] overflow-y-auto; }
.modal-close { @apply absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-lg; }
.pag-btn     { @apply px-3 py-1 bg-white border border-gray-300 rounded-lg text-gray-600 hover:bg-blue-50 disabled:opacity-40 disabled:cursor-not-allowed text-sm; }
</style>
