<script setup lang="ts">
import ProgressSpinner from 'primevue/progressspinner';

withDefaults(defineProps<{
  label?: string;
  size?: string;
  strokeWidth?: number;
}>(), {
  label: 'Loading…',
  size: '2rem',
  strokeWidth: 4
});
</script>

<template>
  <div
    class="absolute inset-0 z-20 flex items-center justify-center gap-3 bg-surface-0/80 backdrop-blur-sm dark:bg-surface-950/80"
    role="status"
    :aria-label="label || 'Loading'"
    aria-live="polite"
    aria-busy="true"
  >
    <ProgressSpinner
      :style="{ width: size, height: size }"
      :stroke-width="strokeWidth"
      aria-hidden="true"
    />
    <span v-if="label" class="br-text-muted text-sm">{{ label }}</span>
  </div>
</template>
