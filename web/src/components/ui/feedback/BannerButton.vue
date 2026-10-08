<script setup lang="ts">
type BannerButtonVariant = 'primary' | 'secondary';

withDefaults(defineProps<{
  variant?: BannerButtonVariant;
  label?: string;
  icon?: string;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}>(), {
  variant: 'primary',
  label: undefined,
  icon: undefined,
  disabled: false,
  type: 'button',
});
</script>

<template>
  <button
    v-bind="$attrs"
    :type="type"
    :disabled="disabled"
    class="br-rounded inline-flex min-h-8 cursor-pointer items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold transition focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:cursor-not-allowed disabled:opacity-50"
    :class="variant === 'primary'
      ? 'bg-primary text-primary-contrast hover:bg-primary-emphasis'
      : 'br-border border-primary/30 bg-transparent text-primary hover:bg-primary/10'"
  >
    <i v-if="icon" :class="icon" aria-hidden="true" />
    <span v-if="label || $slots.default"><slot>{{ label }}</slot></span>
  </button>
</template>
