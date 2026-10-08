<script setup lang="ts">
import type { NavigationItem } from '@/types/navigation'

withDefaults(defineProps<{
  items: NavigationItem[]
  activePath?: string
}>(), {
  activePath: '',
})

const emit = defineEmits<{
  navigate: [item: NavigationItem]
}>()
</script>

<template>
  <div class="mobile-bottom-nav-space" aria-hidden="true" />
  <nav class="mobile-bottom-nav br-surface br-border" aria-label="Mobile navigation">
    <button
      v-for="item in items"
      :key="item.to ?? item.label"
      type="button"
      class="mobile-bottom-nav__item"
      :class="{ 'mobile-bottom-nav__item--active': item.to && item.to === activePath }"
      :disabled="item.disabled"
      :aria-current="item.to && item.to === activePath ? 'page' : undefined"
      @click="emit('navigate', item)"
    >
      <i v-if="item.icon" :class="item.icon" aria-hidden="true" />
      <span>{{ item.label }}</span>
    </button>
  </nav>
</template>

<style scoped>
.mobile-bottom-nav-space {
  height: calc(4.25rem + env(safe-area-inset-bottom));
}

.mobile-bottom-nav {
  position: fixed;
  z-index: 30;
  right: 0;
  bottom: 0;
  left: 0;
  display: grid;
  grid-auto-columns: minmax(0, 1fr);
  grid-auto-flow: column;
  padding: 0.375rem max(0.375rem, env(safe-area-inset-right)) max(0.375rem, env(safe-area-inset-bottom)) max(0.375rem, env(safe-area-inset-left));
  border-width: 1px 0 0;
  box-shadow: var(--br-shadow-popup);
}

.mobile-bottom-nav__item {
  display: flex;
  min-width: 0;
  min-height: 3.25rem;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  border: 0;
  border-radius: var(--br-radius);
  background: transparent;
  color: var(--br-text-muted);
  font-size: 0.6875rem;
  line-height: 1rem;
  cursor: pointer;
}

.mobile-bottom-nav__item i {
  font-size: 1.125rem;
  line-height: 1.25rem;
}

.mobile-bottom-nav__item span {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.mobile-bottom-nav__item--active {
  color: var(--p-primary-color);
  background: color-mix(in srgb, var(--p-primary-color) 10%, var(--br-surface));
}

.mobile-bottom-nav__item:focus-visible {
  outline: 2px solid var(--p-primary-color);
  outline-offset: -2px;
}

.mobile-bottom-nav__item:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

@media (min-width: 768px) {
  .mobile-bottom-nav,
  .mobile-bottom-nav-space {
    display: none;
  }
}
</style>
