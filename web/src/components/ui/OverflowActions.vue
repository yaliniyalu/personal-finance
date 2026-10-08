<script setup lang="ts">
import { ref } from 'vue';
import Button from 'primevue/button';
import Menu from 'primevue/menu';
import type { MenuItem } from 'primevue/menuitem';

defineProps<{ items: MenuItem[]; label?: string }>();
const menu = ref<InstanceType<typeof Menu> | null>(null);
</script>

<template>
  <div>
    <Button
      icon="pi pi-ellipsis-v"
      severity="secondary"
      text
      rounded
      :aria-label="label ?? 'More actions'"
      aria-haspopup="true"
      @click="menu?.toggle($event)"
    />
    <Menu ref="menu" :model="items" popup />
  </div>
</template>
