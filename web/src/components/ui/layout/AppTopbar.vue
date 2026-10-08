<script setup lang="ts">
import Button from 'primevue/button';

defineProps<{ title?: string }>();
const emit = defineEmits<{ menu: [] }>();
</script>

<template>
  <header class="br-surface br-divider sticky top-0 z-30 flex h-16 items-center gap-3 border-b px-4 lg:px-6">
    <Button
      icon="pi pi-bars"
      severity="secondary"
      text
      rounded
      aria-label="Toggle navigation"
      @click="emit('menu')"
    />
    <div class="min-w-0 flex-1">
      <slot name="start">
        <span v-if="title" class="truncate font-semibold">{{ title }}</span>
      </slot>
    </div>
    <div class="flex shrink-0 items-center gap-2">
      <slot name="actions" />
    </div>
  </header>
</template>
