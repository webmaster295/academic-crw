<template>
  <div class="min-h-screen bg-gray-50 flex flex-col">
    <Navbar @openLogin="showLogin = true" />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <LoginModal :show="showLogin" @close="showLogin = false" />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { RouterView } from 'vue-router'
import Navbar    from './components/Navbar.vue'
import AppFooter from './components/AppFooter.vue'
import LoginModal from './components/LoginModal.vue'
import { useDataStore } from './stores/data'

const showLogin = ref(false)
const data = useDataStore()
const config = computed(() => data.config)

// อัปเดต title bar
watch(() => config.value.system_name, (name) => {
  if (name) document.title = name
}, { immediate: true })

// อัปเดต favicon ตาม logo_url
watch(() => config.value.logo_url, (url) => {
  if (!url) return
  let link = document.querySelector("link[rel~='icon']")
  if (!link) {
    link = document.createElement('link')
    link.rel = 'icon'
    document.head.appendChild(link)
  }
  link.href = url
}, { immediate: true })
</script>
