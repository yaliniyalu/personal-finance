<script setup lang="ts">
import { ref, watch } from 'vue'
import type { NavigationItem } from '@/types/navigation.ts'
import AppSidebar from '@/components/ui/AppSidebar.vue'
import AppTopbar from './AppTopbar.vue'

withDefaults(defineProps<{
  items: NavigationItem[];
  activePath?: string;
  appTitle?: string;
  sidebarCollapsed?: boolean;
}>(), {
  activePath: '',
  appTitle: 'Admin',
  sidebarCollapsed: false
})

const emit = defineEmits<{
  navigate: [item: NavigationItem]
  toggleSidebar: []
}>()
const mobileMenuOpen = ref(false)

const navigate = (item: NavigationItem) => {
  mobileMenuOpen.value = false
  emit('navigate', item)
}

const toggleNavigation = () => {
  if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) {
    mobileMenuOpen.value = true
    return
  }

  emit('toggleSidebar')
}

watch(mobileMenuOpen, (open) => {
  if (typeof document !== 'undefined') document.body.style.overflow = open ? 'hidden' : ''
})
</script>

<template>
  <AppSidebar
    :items="items"
    :active-path="activePath"
    :model-value="sidebarCollapsed ? 'mini' : 'open'"
    v-model:mobile-open="mobileMenuOpen"
    class="br-page"
    @navigate="navigate"
  >
    <template #header="slotProps">
      <slot
        name="brand"
        :collapsed="slotProps.isMini && !slotProps.isMobile"
        :toggle="slotProps.toggle"
      />
    </template>

    <template #footer="{ mini }">
      <slot name="sidebar-footer" :collapsed="mini" />
    </template>

    <template #content>
      <AppTopbar :title="appTitle" @menu="toggleNavigation">
        <template #start><slot name="topbar-start">{{ appTitle }}</slot></template>
        <template #actions><slot name="topbar-actions" /></template>
      </AppTopbar>
      <main class="br-page-container">
        <slot />
      </main>
    </template>
  </AppSidebar>
</template>
