<script setup lang="ts">
import { computed, inject, type PropType } from 'vue'

const props = defineProps({
  src: {
    type: String,
    default: undefined,
  },
  name: {
    type: String,
    default: undefined,
  },
  shape: {
    type: String as PropType<'circle' | 'square'>,
    default: 'square',
  },
  size: {
    type: String as PropType<'normal' | 'large' | 'xlarge'>,
    default: 'normal',
  },
  width: {
    type: String,
    default: undefined,
  },
  height: {
    type: String,
    default: undefined,
  },
  initialCount: {
    type: Number,
    default: 2,
  },
  fontSize: {
    type: String,
    default: undefined,
  },
})

const initial = computed(() =>
  (props.name ?? '')
    .split(' ')
    .map((n) => n[0])
    .slice(0, props.initialCount)
    .join('')
    .toUpperCase(),
)

const themeMode = inject(
  'themeMode',
  computed(() => 'light'),
)
const isDarkMode = computed(() => themeMode.value === 'dark')

const color = computed(() => {
  const sumChars = (props.name ?? '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const hue = sumChars % 360
  const saturation = 90
  const lightness = isDarkMode.value ? 30 : 70
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`
})
</script>

<template>
  <Avatar
    v-bind="$attrs"
    :image="src"
    :label="src ? undefined : initial"
    :style="{
      backgroundColor: color,
      width: width ?? undefined,
      height: height ?? undefined,
      fontSize: fontSize ?? undefined,
    }"
    :shape="shape"
    :size="size"

    :pt="{
      image: {
        class: 'rounded'
      }
    }"
  />
</template>

<style scoped></style>
