<script setup lang="ts">
import IconBadge from '@/components/ui/surface/IconBadge.vue';
import type { IconColor } from '@/components/ui/surface/iconColors.ts';

withDefaults(defineProps<{
  label: string;
  value?: string | number | null;
  emptyText?: string;
  icon?: string;
  iconColor?: IconColor;
}>(), {
  value: null,
  emptyText: '—',
  icon: undefined,
  iconColor: 'primary',
});
</script>

<template>
  <div class="flex min-w-0 items-start gap-3">
    <IconBadge v-if="icon" :icon="icon" :color="iconColor" size="sm" />
    <div class="br-info-row min-w-0">
      <dt class="br-info-label truncate">{{ label }}</dt>
      <dd class="br-info-value truncate"><slot>{{ value ?? emptyText }}</slot></dd>
    </div>
  </div>
</template>
