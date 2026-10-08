<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    header: string
    modal: boolean
    width: string
    content?: string
    closeOnCancel?: boolean
    cancelButtonLabel?: string
    confirmButtonLabel?: string
    cancelButtonLoading?: boolean
    confirmButtonLoading?: boolean
  }>(),
  {
    modal: true,
    width: '450px',
    closeOnCancel: true,
    cancelButtonLabel: 'No',
    confirmButtonLabel: 'Yes',
    cancelButtonLoading: false,
    confirmButtonLoading: false,
  },
)

const visible = defineModel<boolean>('visible')

const emits = defineEmits<{
  (e: 'cancel'): void
  (e: 'confirm'): void
  (e: 'hide'): void
  (e: 'show'): void
}>()

function onCancel() {
  if (props.closeOnCancel) {
    visible.value = false
  }

  emits('cancel')
}
</script>

<template>
  <Dialog v-model:visible="visible" :header="header" :modal="modal" :style="{ width: width }">
    <slot name="content">
      <p>{{ content }}</p>
    </slot>
    <template #footer>
      <slot name="footer">
        <Button
          :label="cancelButtonLabel"
          severity="secondary"
          :loading="cancelButtonLoading"
          @click="onCancel"
        />
        <Button
          :label="confirmButtonLabel"
          severity="primary"
          :loading="confirmButtonLoading"
          @click="$emit('confirm')"
        />
      </slot>
    </template>
  </Dialog>
</template>

<style scoped></style>
