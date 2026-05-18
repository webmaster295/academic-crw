<template>
  <div>
    <!-- Toolbar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-4 no-print">
      <input v-model="search" type="text" placeholder="ค้นหาชื่อครู..."
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm w-full sm:w-56 focus:outline-none focus:ring-2 focus:ring-blue-500" />
      <select v-model="filterCategory"
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">— ทุกกลุ่มสาระ —</option>
        <option v-for="c in categories" :key="c" :value="c">{{ c }}</option>
      </select>
      <select v-model="filterStatus"
        class="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
        <option value="">— ทุกสถานะ —</option>
        <option v-for="s in statusList" :key="s" :value="s">{{ s }}</option>
      </select>
      <!-- per page -->
      <div class="flex items-center gap-2 ml-auto shrink-0">
        <span class="text-sm text-gray-500 whitespace-nowrap">แสดง</span>
        <select v-model="pageSize"
          class="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option :value="5">5</option>
          <option :value="10">10</option>
          <option :value="20">20</option>
          <option :value="50">50</option>
          <option :value="0">ทั้งหมด</option>
        </select>
        <span class="text-sm text-gray-500 whitespace-nowrap">รายการ</span>
      </div>
    </div>

    <!-- Table -->
    <div class="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
      <table class="min-w-full text-sm">
        <thead class="bg-blue-700 text-white">
          <tr>
            <th class="px-4 py-3 text-left font-semibold w-12">#</th>
            <th class="px-4 py-3 text-left font-semibold">ครู</th>
            <th class="px-4 py-3 text-left font-semibold hidden md:table-cell">กลุ่มสาระ</th>
            <th class="px-4 py-3 text-center font-semibold">สถานะ</th>
            <th v-if="showNote" class="px-4 py-3 text-left font-semibold hidden lg:table-cell">หมายเหตุ</th>
            <th v-if="showActions" class="px-4 py-3 text-center font-semibold no-print">จัดการ</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="paged.length === 0">
            <td :colspan="6" class="text-center py-10 text-gray-400">ไม่พบข้อมูล</td>
          </tr>
          <tr v-for="(row, i) in paged" :key="row.teacherId"
            class="border-t border-gray-100 hover:bg-blue-50/50 transition">
            <td class="px-4 py-3 text-gray-400">{{ (currentPage - 1) * (pageSize || filtered.length) + i + 1 }}</td>
            <td class="px-4 py-3">
              <div class="flex items-center gap-3">
                <img :src="row.imgurl" :alt="row.fullName"
                  class="w-9 h-9 rounded-full object-cover border border-gray-200 shrink-0"
                  @error="e => e.target.src='https://ui-avatars.com/api/?name='+encodeURIComponent(row.fullName)+'&background=1e3a5f&color=fff'" />
                <div class="min-w-0">
                  <div class="font-medium text-gray-800">{{ row.fullName }}</div>
                  <div class="text-xs text-gray-400 md:hidden">{{ row.categoryName }}</div>
                  <a v-if="row.linkUrl" :href="row.linkUrl" target="_blank" rel="noopener"
                    class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-0.5 lg:hidden">
                    📎 {{ row.linkTitle || 'ดูไฟล์' }}
                  </a>
                </div>
              </div>
            </td>
            <td class="px-4 py-3 text-gray-600 hidden md:table-cell">
              <span class="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">{{ row.categoryName }}</span>
            </td>
            <td class="px-4 py-3 text-center">
              <StatusBadge :status="row.status" />
            </td>
            <td v-if="showNote" class="px-4 py-3 hidden lg:table-cell">
              <div class="text-xs text-gray-500 max-w-[180px] truncate">{{ row.note || '—' }}</div>
              <a v-if="row.linkUrl" :href="row.linkUrl" target="_blank" rel="noopener"
                class="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline mt-0.5">
                📎 {{ row.linkTitle || 'ดูไฟล์' }}
              </a>
            </td>
            <td v-if="showActions" class="px-4 py-3 text-center no-print">
              <button @click="$emit('edit', row)"
                class="bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs px-3 py-1.5 rounded-lg font-medium transition">
                บันทึก
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Pagination -->
    <div class="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 no-print">
      <p class="text-sm text-gray-500">
        แสดง {{ rangeStart }}–{{ rangeEnd }} จาก <span class="font-semibold text-gray-700">{{ filtered.length }}</span> รายการ
        <span v-if="filtered.length !== rows.length" class="text-gray-400">(กรองจาก {{ rows.length }})</span>
      </p>

      <div v-if="totalPages > 1" class="flex items-center gap-1">
        <!-- First -->
        <PagBtn :disabled="currentPage === 1" @click="currentPage = 1" title="หน้าแรก">
          «
        </PagBtn>
        <!-- Prev -->
        <PagBtn :disabled="currentPage === 1" @click="currentPage--" title="ก่อนหน้า">
          ‹
        </PagBtn>

        <!-- page numbers -->
        <template v-for="p in pageButtons" :key="p">
          <span v-if="p === '...'" class="px-2 text-gray-400 select-none">…</span>
          <button v-else @click="currentPage = p"
            :class="p === currentPage
              ? 'bg-blue-700 text-white border-blue-700'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-400'"
            class="w-9 h-9 rounded-lg border text-sm font-medium transition">
            {{ p }}
          </button>
        </template>

        <!-- Next -->
        <PagBtn :disabled="currentPage === totalPages" @click="currentPage++" title="ถัดไป">
          ›
        </PagBtn>
        <!-- Last -->
        <PagBtn :disabled="currentPage === totalPages" @click="currentPage = totalPages" title="หน้าสุดท้าย">
          »
        </PagBtn>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import StatusBadge from './StatusBadge.vue'

// ── mini pagination button component ──────────────
const PagBtn = {
  props: ['disabled', 'title'],
  emits: ['click'],
  template: `
    <button @click="$emit('click')" :disabled="disabled" :title="title"
      class="w-9 h-9 rounded-lg border text-sm font-medium transition"
      :class="disabled
        ? 'bg-gray-50 text-gray-300 border-gray-200 cursor-not-allowed'
        : 'bg-white text-gray-600 border-gray-300 hover:bg-blue-50 hover:border-blue-400'">
      <slot/>
    </button>`
}

const props = defineProps({
  rows:        { type: Array, default: () => [] },
  showNote:    { type: Boolean, default: true },
  showActions: { type: Boolean, default: false },
})
const emit = defineEmits(['edit', 'filtered'])

const search         = ref('')
const filterCategory = ref('')
const filterStatus   = ref('')
const pageSize       = ref(10)
const currentPage    = ref(1)

const statusList = ['ยังไม่ส่ง', 'รอตรวจสอบ', 'ส่งเรียบร้อย', 'ขอแก้ไข', 'ไม่ผ่าน']

const categories = computed(() =>
  [...new Set(props.rows.map(r => r.categoryName).filter(Boolean))].sort()
)

const filtered = computed(() =>
  props.rows.filter(r => {
    if (search.value         && !r.fullName?.includes(search.value))     return false
    if (filterCategory.value && r.categoryName !== filterCategory.value) return false
    if (filterStatus.value   && r.status       !== filterStatus.value)   return false
    return true
  })
)

// reset to page 1 when filter changes + emit filtered rows ให้ parent
watch(filtered, rows => emit('filtered', rows), { immediate: true })
watch([search, filterCategory, filterStatus, pageSize], () => { currentPage.value = 1 })

const effectivePageSize = computed(() => pageSize.value || filtered.value.length || 1)
const totalPages        = computed(() => Math.max(1, Math.ceil(filtered.value.length / effectivePageSize.value)))

const paged = computed(() => {
  if (!pageSize.value) return filtered.value   // show all
  const start = (currentPage.value - 1) * pageSize.value
  return filtered.value.slice(start, start + pageSize.value)
})

const rangeStart = computed(() => filtered.value.length === 0 ? 0 : (currentPage.value - 1) * effectivePageSize.value + 1)
const rangeEnd   = computed(() => Math.min(currentPage.value * effectivePageSize.value, filtered.value.length))

// smart page buttons: 1 ... 4 5 6 ... 10
const pageButtons = computed(() => {
  const total = totalPages.value
  const cur   = currentPage.value
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages = new Set([1, total, cur - 1, cur, cur + 1].filter(p => p >= 1 && p <= total))
  const sorted = [...pages].sort((a, b) => a - b)
  const result = []
  sorted.forEach((p, i) => {
    if (i > 0 && p - sorted[i - 1] > 1) result.push('...')
    result.push(p)
  })
  return result
})
</script>
