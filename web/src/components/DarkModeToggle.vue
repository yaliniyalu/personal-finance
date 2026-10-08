<script setup lang="ts">
import Button from 'primevue/button';
import { onMounted } from 'vue';
import { useTheme } from '@/composables/useTheme.ts';

const { isDark, initialize, toggle } = useTheme();
onMounted(initialize);
</script>

<template>
  <Button
    :icon="isDark ? 'i-lucide-sun' : 'i-lucide-moon'"
    severity="secondary"
    text
    rounded
    :aria-label="isDark ? 'Use light mode' : 'Use dark mode'"
    @click="toggle"
  />
</template>
