<template>
  <table class="w-full text-sm border-collapse mb-4">
    <thead>
      <tr class="bg-gray-100">
        <th class="border border-gray-300 px-3 py-2 text-center font-semibold w-10">#</th>
        <th class="border border-gray-300 px-3 py-2 text-left font-semibold">ชื่อ-สกุล</th>
        <th class="border border-gray-300 px-3 py-2 text-left font-semibold">กลุ่มสาระ</th>
        <th class="border border-gray-300 px-3 py-2 text-center font-semibold">สถานะ</th>
        <th class="border border-gray-300 px-3 py-2 text-left font-semibold">รายละเอียดการส่งงาน</th>
      </tr>
    </thead>
    <tbody>
      <tr v-if="rows.length === 0">
        <td colspan="5" class="text-center py-4 text-gray-400 border border-gray-200">ไม่มีข้อมูล</td>
      </tr>
      <tr v-for="(r, i) in rows" :key="r.teacherId" :class="i % 2 === 0 ? 'bg-white' : 'bg-gray-50'">
        <td class="border border-gray-200 px-3 py-1.5 text-gray-400 text-center">{{ i + 1 }}</td>
        <td class="border border-gray-200 px-3 py-1.5 font-medium">{{ r.fullName }}</td>
        <td class="border border-gray-200 px-3 py-1.5 text-gray-600 text-xs">{{ r.categoryName }}</td>
        <td class="border border-gray-200 px-3 py-1.5 text-center">
          <StatusBadge :status="r.status" />
        </td>
        <td class="border border-gray-200 px-3 py-1.5 text-gray-500 text-xs">{{ r.note || '—' }}</td>
      </tr>
    </tbody>
  </table>
</template>

<script setup>
import StatusBadge from './StatusBadge.vue'
defineProps({ rows: { type: Array, default: () => [] } })
</script>
