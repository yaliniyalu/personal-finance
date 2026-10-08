<script setup lang="ts">
import { iconColorClasses, type IconColor } from './iconColors.ts';

withDefaults(defineProps<{
  icon: string;
  color?: IconColor;
  size?: 'sm' | 'md';
  round?: boolean;
}>(), {
  color: 'primary',
  size: 'md',
  round: false,
});

const sizeClasses = {
  sm: 'size-8 text-sm',
  md: 'size-10',
} as const;
</script>

<template>
  <span
    class="flex shrink-0 items-center justify-center"
    :class="[sizeClasses[size], iconColorClasses[color], round ? 'br-rounded-pill' : 'br-rounded']"
    aria-hidden="true"
  >
    <i :class="icon" />
  </span>
</template>
