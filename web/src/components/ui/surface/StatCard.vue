<script setup lang="ts">
import IconBadge from './IconBadge.vue';
import type { IconColor } from './iconColors.ts';

defineProps<{
  label: string;
  value: string | number;
  icon?: string;
  iconColor?: IconColor;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
}>();
</script>

<template>
  <article class="br-card p-4 sm:p-5">
    <div class="flex items-start justify-between gap-3">
      <div class="min-w-0">
        <p class="text-sm br-muted">{{ label }}</p>
        <p class="mt-1 truncate text-2xl font-semibold tracking-tight">{{ value }}</p>
      </div>
      <IconBadge v-if="icon" :icon="icon" :color="iconColor" />
    </div>
    <p
      v-if="change"
      class="mt-2 text-xs"
      :class="{ 'text-green-600 dark:text-green-400': trend === 'up', 'text-red-600 dark:text-red-400': trend === 'down', 'br-muted': !trend || trend === 'neutral' }"
    >
      {{ change }}
    </p>
    <slot />
  </article>
</template>
