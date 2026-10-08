<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Drawer from 'primevue/drawer';
import { useBreakpoints } from '../../../composables/useBreakpoints.ts';

withDefaults(defineProps<{
  visible: boolean;
  title: string;
  width?: string;
  closeOnEscape?: boolean;
  dismissableMask?: boolean;
}>(), {
  width: '36rem',
  closeOnEscape: true,
  dismissableMask: false
});

const emit = defineEmits<{ 'update:visible': [value: boolean] }>();
const { isMd } = useBreakpoints();
</script>

<template>
  <Dialog
    v-if="isMd"
    :visible="visible"
    modal
    :header="title"
    :style="{ width, maxWidth: 'calc(100vw - 2rem)' }"
    :close-on-escape="closeOnEscape"
    :dismissable-mask="dismissableMask"
    @update:visible="emit('update:visible', $event)"
  >
    <slot />
    <template v-if="$slots.footer" #footer><slot name="footer" /></template>
  </Dialog>

  <Drawer
    v-else
    :visible="visible"
    position="bottom"
    :header="title"
    class="!h-auto !max-h-[90dvh] !rounded-t-2xl"
    :close-on-escape="closeOnEscape"
    :dismissable="dismissableMask"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="overflow-y-auto"><slot /></div>
    <div v-if="$slots.footer" class="mt-4 border-t pt-4"><slot name="footer" /></div>
  </Drawer>
</template>
