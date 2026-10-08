<script setup lang="ts">
import PrimeButton, { type ButtonProps } from 'primevue/button';

defineOptions({ inheritAttrs: false });

const props = defineProps<ButtonProps>();
</script>

<template>
  <PrimeButton v-bind="{ ...props, ...$attrs }">
    <slot />
  </PrimeButton>
</template>
