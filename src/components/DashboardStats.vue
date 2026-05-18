<template>
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div v-for="card in cards" :key="card.label"
      :class="card.gradient"
      class="rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-md hover:shadow-lg transition min-h-[120px]">
      <div class="text-4xl mb-2 leading-none">{{ card.icon }}</div>
      <div class="text-4xl font-extrabold text-white tracking-tight">{{ card.value }}</div>
      <div class="text-white/80 text-sm font-medium mt-1">{{ card.label }}</div>
      <div class="mt-2 text-white/60 text-xs font-medium">{{ pct(card.value) }}%</div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  rows: { type: Array, default: null },   // ถ้าส่ง rows มา คำนวณเอง
  stats: { type: Object, default: () => ({}) },  // fallback
})

// คำนวณจาก rows ถ้ามี มิฉะนั้นใช้ stats จาก GAS
const computed_stats = computed(() => {
  if (props.rows !== null) {
    const rows = props.rows
    return {
      total:    rows.length,
      approved: rows.filter(r => r.status === 'ส่งเรียบร้อย').length,
      pending:  rows.filter(r => r.status === 'รอตรวจสอบ').length,
      notYet:   rows.filter(r => r.status === 'ยังไม่ส่ง').length,
    }
  }
  return props.stats
})

const pct = (val) => computed_stats.value.total
  ? Math.round((val / computed_stats.value.total) * 100)
  : 0

const cards = computed(() => [
  {
    icon: '👨‍🏫',
    label: 'ครูทั้งหมด',
    value: computed_stats.value.total || 0,
    gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
  },
  {
    icon: '✓',
    label: 'ส่งเรียบร้อย',
    value: computed_stats.value.approved || 0,
    gradient: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
  },
  {
    icon: '⏳',
    label: 'รอตรวจสอบ',
    value: computed_stats.value.pending || 0,
    gradient: 'bg-gradient-to-br from-yellow-400 to-amber-500',
  },
  {
    icon: '○',
    label: 'ยังไม่ส่ง',
    value: computed_stats.value.notYet || 0,
    gradient: 'bg-gradient-to-br from-slate-400 to-slate-600',
  },
])
</script>
