<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';

withDefaults(defineProps<{ label?: string; overlay?: boolean }>(), {
  label: 'Loading…',
  overlay: false
});
</script>

<template>
  <div
    class="flex items-center justify-center gap-3"
    :class="overlay ? 'absolute inset-0 z-20 bg-surface-0/80 backdrop-blur-sm dark:bg-surface-950/80' : 'min-h-40'"
    role="status"
    aria-live="polite"
    aria-busy="true"
  >
    <ProgressSpinner
      style="width: 2rem; height: 2rem"
      :stroke-width="4"
      aria-hidden="true"
    />
    <span class="br-text-muted text-sm">{{ label }}</span>
  </div>
</template>
