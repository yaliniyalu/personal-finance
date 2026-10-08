<script setup lang="ts">
import { ref } from 'vue'
import { useTitleState } from '@/composables/useTitle'
import AppShell from '@/components/ui/layout/AppShell.vue'
import DarkModeToggle from '@/components/DarkModeToggle.vue'
import type { NavigationItem } from '@/types/navigation'

const sidebarCollapsed = ref(false)
const { navbarTitle } = useTitleState()

const navigationItems: NavigationItem[] = [
  { label: 'Dashboard', icon: 'pi pi-home', to: '/' },
  {
    label: 'Workspace',
    children: [
      { label: 'Projects', icon: 'pi pi-folder', to: '/projects', badge: 3 },
      { label: 'Team', icon: 'pi pi-users', to: '/team' },
    ],
  },
  { label: 'Settings', icon: 'pi pi-cog', to: '/settings' },
]

function handleNavigate(item: NavigationItem) {
  if (item.to === '/') return
  // These are component demos, so keep the sample navigation on this page.
}
</script>

<template>
  <AppShell
    :items="navigationItems"
    active-path="/"
    :app-title="navbarTitle || 'Admin'"
    :sidebar-collapsed="sidebarCollapsed"
    @toggle-sidebar="sidebarCollapsed = !sidebarCollapsed"
    @navigate="handleNavigate"
  >
    <template #brand="{ collapsed }">
      <div class="flex items-center gap-2">
        <span class="grid size-8 shrink-0 place-items-center br-rounded bg-primary font-bold text-white">B</span>
        <span v-if="!collapsed" class="font-semibold">BrightPanel</span>
      </div>
    </template>

    <template #sidebar-footer="{ collapsed }">
      <button
        type="button"
        class="br-nav-link w-full"
        :title="collapsed ? 'Toggle sidebar' : undefined"
        @click="sidebarCollapsed = !sidebarCollapsed"
      >
        <i class="pi" :class="collapsed ? 'pi-angle-double-right' : 'pi-angle-double-left'" />
        <span v-if="!collapsed" class="text-left">Collapse sidebar</span>
      </button>
    </template>

    <template #topbar-actions>
      <DarkModeToggle />
    </template>

    <RouterView />
  </AppShell>
</template>
