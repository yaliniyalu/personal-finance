<script setup lang="ts">
withDefaults(defineProps<{ sticky?: boolean }>(), { sticky: false });
</script>

<template>
  <div :class="sticky ? 'br-mobile-actions' : 'br-actions'">
    <slot />
  </div>
</template>
