<script setup lang="ts">
withDefaults(defineProps<{
  icon?: string;
  title: string;
  description?: string;
  tone?: 'neutral' | 'danger' | 'success';
}>(), {
  icon: 'pi pi-info-circle',
  description: undefined,
  tone: 'neutral'
});
</script>

<template>
  <div class="br-state" role="status">
    <i
      :class="[icon, { 'text-red-500!': tone === 'danger', 'text-green-500!': tone === 'success' }]"
      class="br-state-icon"
      aria-hidden="true"
    />
    <h3 class="br-state-title">{{ title }}</h3>
    <p v-if="description" class="br-state-description">{{ description }}</p>
    <div v-if="$slots.actions" class="br-state-actions"><slot name="actions" /></div>
  </div>
</template>
