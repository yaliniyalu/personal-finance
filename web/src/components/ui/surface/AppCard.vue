<script setup lang="ts">
import IconBadge from './IconBadge.vue';
import type { IconColor } from './iconColors.ts';

withDefaults(defineProps<{
  title?: string;
  subtitle?: string;
  icon?: string;
  iconColor?: IconColor;
  padded?: boolean;
}>(), {
  title: undefined,
  subtitle: undefined,
  icon: undefined,
  iconColor: 'primary',
  padded: true
});
</script>

<template>
  <section class="br-card">
    <header v-if="title || subtitle || $slots.header || $slots.actions" class="br-card-header flex items-start justify-between gap-3">
      <slot name="header">
        <div class="flex min-w-0 items-center gap-3">
          <IconBadge v-if="icon" :icon="icon" :color="iconColor" />
          <div class="min-w-0">
            <h2 v-if="title" class="br-card-title truncate whitespace-nowrap">{{ title }}</h2>
            <p v-if="subtitle" class="truncate whitespace-nowrap text-sm br-muted">{{ subtitle }}</p>
          </div>
        </div>
      </slot>
      <div v-if="$slots.actions" class="flex shrink-0 items-center gap-2">
        <slot name="actions" />
      </div>
    </header>
    <div :class="{ 'br-card-body': padded }"><slot /></div>
    <footer v-if="$slots.footer" class="br-card-footer"><slot name="footer" /></footer>
  </section>
</template>
