<template>
  <div class="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 flex items-center justify-center p-4">
    <div class="bg-white rounded-3xl shadow-2xl w-full max-w-lg p-8">

      <!-- Logo / Icon -->
      <div class="text-center mb-6">
        <div class="w-20 h-20 bg-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
        </div>
        <h1 class="text-2xl font-bold text-gray-800">ตั้งค่าระบบครั้งแรก</h1>
        <p class="text-sm text-gray-500 mt-1">ระบบบันทึกการตรวจสอบงานวิชาการ</p>
      </div>

      <!-- Steps -->
      <div class="bg-blue-50 rounded-2xl p-4 mb-6 space-y-2 text-sm text-gray-600">
        <p class="font-semibold text-blue-800 mb-2">ขั้นตอนก่อนใช้งาน:</p>
        <div class="flex gap-2">
          <span class="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">1</span>
          <span>คัดลอก Google Sheets template ไปยัง Google Drive ของคุณ</span>
        </div>
        <div class="flex gap-2">
          <span class="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">2</span>
          <span>เปิด Apps Script ใน Sheets → วาง Code.gs → Deploy เป็น Web App</span>
        </div>
        <div class="flex gap-2">
          <span class="bg-blue-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs shrink-0 mt-0.5">3</span>
          <span>คัดลอก URL ที่ได้จาก Deploy มาวางด้านล่าง</span>
        </div>
      </div>

      <!-- Input -->
      <div class="space-y-3">
        <label class="block text-sm font-semibold text-gray-700">
          Google Apps Script URL <span class="text-red-500">*</span>
        </label>
        <input v-model="gasUrl" type="url"
          placeholder="https://script.google.com/macros/s/.../exec"
          class="w-full border-2 rounded-xl px-4 py-3 text-sm focus:outline-none transition"
          :class="error ? 'border-red-400 focus:border-red-500' : 'border-gray-200 focus:border-blue-500'"
          @keyup.enter="handleSave" />
        <p v-if="error" class="text-xs text-red-500">{{ error }}</p>
        <p class="text-xs text-gray-400">URL จะถูกเก็บในเบราว์เซอร์นี้เท่านั้น ไม่ได้ส่งไปที่ใด</p>
      </div>

      <!-- Test + Save -->
      <div class="mt-5 space-y-2">
        <button @click="handleSave" :disabled="loading"
          class="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-60 text-white py-3 rounded-xl font-semibold text-sm transition flex items-center justify-center gap-2">
          <svg v-if="loading" class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          {{ loading ? 'กำลังทดสอบการเชื่อมต่อ...' : '🔗 บันทึกและเริ่มใช้งาน' }}
        </button>
      </div>

      <!-- Success -->
      <div v-if="success" class="mt-4 bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-sm text-green-700 flex items-center gap-2">
        <span>✓</span>
        <span>เชื่อมต่อสำเร็จ! กำลังเข้าสู่ระบบ...</span>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const emit = defineEmits(['done'])

const gasUrl = ref('')
const loading = ref(false)
const error   = ref('')
const success = ref(false)

async function handleSave() {
  error.value = ''

  const url = gasUrl.value.trim()
  if (!url) {
    error.value = 'กรุณาใส่ URL'
    return
  }
  if (!url.startsWith('https://script.google.com/macros/s/')) {
    error.value = 'URL ไม่ถูกต้อง ต้องขึ้นต้นด้วย https://script.google.com/macros/s/'
    return
  }
  if (!url.endsWith('/exec')) {
    error.value = 'URL ต้องลงท้ายด้วย /exec'
    return
  }

  loading.value = true
  try {
    // ทดสอบเชื่อมต่อ GAS
    const testUrl = new URL(url)
    testUrl.searchParams.set('action', 'getConfig')
    const res = await fetch(testUrl.toString())
    if (!res.ok) throw new Error('HTTP ' + res.status)
    await res.json()

    // บันทึก
    localStorage.setItem('gas_url', url)
    success.value = true
    setTimeout(() => emit('done'), 1000)
  } catch (e) {
    error.value = 'เชื่อมต่อไม่ได้ ตรวจสอบ URL และการ Deploy อีกครั้ง'
  } finally {
    loading.value = false
  }
}
</script>
