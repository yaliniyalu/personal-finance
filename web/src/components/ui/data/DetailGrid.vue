<script setup lang="ts">
withDefaults(defineProps<{ columns?: 1 | 2 | 3 }>(), { columns: 2 });
</script>

<template>
  <dl :class="columns === 1 ? 'br-grid' : columns === 3 ? 'br-grid-3' : 'br-detail-grid'">
    <slot />
  </dl>
</template>
