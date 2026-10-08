<script setup lang="ts">
import useSnackBar from '@/composables/use-snack-bar'

const props = defineProps<{
  text: string
  copyText?: string
  title?: string | null
}>()

const snack = useSnackBar()
function copyToClipboard() {
  navigator.clipboard.writeText(props.copyText ?? props.text)
  snack.success({
    message: 'Copied to clipboard',
    duration: 2000,
  })
}

defineOptions({ inheritAttrs: false })
</script>

<template>
  <span class="flex items-center gap-1">
    <span :class="$attrs.class">
      {{ text }}
    </span>

    <i
      class="pi pi-copy text-xs! cursor-pointer"
      :title="title ?? 'Copy'"
      @click="copyToClipboard"
    ></i>
  </span>
</template>

<style scoped></style>
