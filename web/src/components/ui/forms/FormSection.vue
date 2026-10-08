<script setup lang="ts">
import IconBadge from '../surface/IconBadge.vue';
import type { IconColor } from '../surface/iconColors.ts';

withDefaults(defineProps<{
  title: string;
  description?: string;
  icon?: string;
  iconColor?: IconColor;
  columns?: 1 | 2 | 3;
}>(), {
  description: undefined,
  icon: undefined,
  iconColor: 'primary',
  columns: 2
});
</script>

<template>
  <section class="br-section">
    <div class="flex items-start gap-3">
      <IconBadge v-if="icon" :icon="icon" :color="iconColor" size="sm" />
      <div>
        <h2 class="br-section-title">{{ title }}</h2>
        <p v-if="description" class="br-section-description">{{ description }}</p>
      </div>
    </div>
    <div :class="columns === 1 ? 'br-grid' : columns === 3 ? 'br-form-grid-3' : 'br-form-grid'">
      <slot />
    </div>
  </section>
</template>
