<script setup lang="ts">
import Button from 'primevue/button';
import ResponsiveDialog from './ResponsiveDialog.vue';

withDefaults(defineProps<{
  visible: boolean;
  title?: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  severity?: 'danger' | 'warn' | 'success' | 'info';
  loading?: boolean;
}>(), {
  title: 'Confirm action',
  confirmLabel: 'Confirm',
  cancelLabel: 'Cancel',
  severity: 'danger',
  loading: false
});

const emit = defineEmits<{
  'update:visible': [value: boolean];
  confirm: [];
  cancel: [];
}>();

const cancel = () => {
  emit('update:visible', false);
  emit('cancel');
};
</script>

<template>
  <ResponsiveDialog
    :visible="visible"
    :title="title"
    width="28rem"
    @update:visible="emit('update:visible', $event)"
  >
    <div class="flex items-start gap-3">
      <i class="pi pi-exclamation-triangle mt-0.5 text-xl text-orange-500" />
      <p class="text-sm leading-6">{{ message }}</p>
    </div>
    <template #footer>
      <div class="br-actions">
        <Button :label="cancelLabel" severity="secondary" outlined :disabled="loading" @click="cancel" />
        <Button :label="confirmLabel" :severity="severity" :loading="loading" @click="emit('confirm')" />
      </div>
    </template>
  </ResponsiveDialog>
</template>
