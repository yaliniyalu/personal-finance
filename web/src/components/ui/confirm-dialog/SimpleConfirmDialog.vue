<script setup lang="ts">
import { computed, inject } from 'vue'
import type { ConfirmDialogData } from './use-simple-confirm-dialog'

const dialogRef = inject('dialogRef') as any
const data = computed(() => dialogRef.value.data as ConfirmDialogData)

const emits = defineEmits<{
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div>
    <div v-html="data?.message"></div>

    <div class="flex justify-end items-center gap-2 pt-5">
      <Button
        :label="data?.cancelLabel || 'No'"
        :severity="data?.cancelSeverity || 'secondary'"
        v-bind="data?.cancelProps"
        @click="() => data?.onCancel?.()"
      />

      <Button
        :label="data?.confirmLabel || 'Yes'"
        :severity="data?.confirmSeverity || 'primary'"
        v-bind="data?.confirmProps"
        @click="() => data?.onConfirm?.()"
      />
    </div>
  </div>
</template>

<style scoped></style>
