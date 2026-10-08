<script setup lang="ts">
import IconBadge from '../surface/IconBadge.vue';
import type { IconColor } from '../surface/iconColors.ts';

withDefaults(defineProps<{
  title: string;
  description?: string;
  icon?: string;
  iconColor?: IconColor;
}>(), {
  description: undefined,
  icon: undefined,
  iconColor: 'primary'
});
</script>

<template>
  <header class="br-section-header">
    <div class="flex min-w-0 items-start gap-3">
      <IconBadge v-if="icon" :icon="icon" :color="iconColor" size="sm" />
      <div class="min-w-0">
        <h2 class="br-section-title">{{ title }}</h2>
        <p v-if="description" class="br-section-description">{{ description }}</p>
      </div>
    </div>
    <div v-if="$slots.actions" class="br-section-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
