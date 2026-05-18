<template>
  <span :class="item.cls"
    class="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap border">
    <span class="text-[11px]">{{ item.icon }}</span>{{ status || 'ยังไม่ส่ง' }}
  </span>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({ status: String })

const map = {
  'ยังไม่ส่ง':   { cls: 'bg-gray-100   text-gray-500  border-gray-200',   icon: '○' },
  'รอตรวจสอบ':  { cls: 'bg-yellow-100 text-yellow-700 border-yellow-300', icon: '⏳' },
  'ส่งเรียบร้อย':{ cls: 'bg-green-100  text-green-700  border-green-300',  icon: '✓' },
  'ขอแก้ไข':    { cls: 'bg-orange-100 text-orange-700 border-orange-300', icon: '↩' },
  'ไม่ผ่าน':    { cls: 'bg-red-100    text-red-700    border-red-300',    icon: '✕' },
  // legacy
  'ส่งแล้ว':    { cls: 'bg-blue-100   text-blue-700   border-blue-300',   icon: '📄' },
  'ส่งช้า':     { cls: 'bg-amber-100  text-amber-700  border-amber-300',  icon: '⏰' },
  'ผ่าน':       { cls: 'bg-green-100  text-green-700  border-green-300',  icon: '✓' },
}

const item = computed(() => map[props.status] || map['ยังไม่ส่ง'])
</script>
