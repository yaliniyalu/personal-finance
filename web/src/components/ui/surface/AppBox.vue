<script setup lang="ts">
import { computed } from 'vue'

type Padding = 'none' | 'sm' | 'md' | 'lg'
type Rounded = 'none' | 'default' | 'card' | 'section' | 'pill'
type Border = 'none' | 'default' | 'strong' | 'interactive'
type Background = 'none' | 'surface' | 'muted' | 'subtle'
type Shadow = 'none' | 'default' | 'popup'

const props = withDefaults(defineProps<{
  padding?: Padding
  rounded?: Rounded
  border?: Border
  background?: Background
  hoverable?: boolean
  selectable?: boolean
  modelValue?: boolean
  disabled?: boolean
  clickable?: boolean
  shadow?: Shadow
}>(), {
  padding: 'md',
  rounded: 'default',
  border: 'default',
  background: 'surface',
  hoverable: false,
  selectable: false,
  modelValue: false,
  disabled: false,
  clickable: false,
  shadow: 'none',
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  click: [event: MouseEvent | KeyboardEvent]
}>()

const classes = computed(() => [
  {
    none: 'p-0', sm: 'p-3', md: 'p-4', lg: 'p-6',
  }[props.padding],
  {
    none: 'rounded-none', default: 'br-rounded', card: 'br-rounded-card', section: 'br-rounded-section', pill: 'br-rounded-pill',
  }[props.rounded],
  {
    none: 'border-0', default: 'br-border', strong: 'br-border-strong', interactive: 'br-border-interactive',
  }[props.border],
  {
    none: '', surface: 'br-surface', muted: 'br-surface-muted', subtle: 'br-surface-subtle',
  }[props.background],
  {
    none: '', default: 'br-shadow', popup: 'br-shadow-popup',
  }[props.shadow],
  {
    'br-interactive': props.hoverable,
    'cursor-pointer': isInteractive.value,
    'cursor-not-allowed opacity-60': props.disabled && isInteractive.value,
    'border-primary bg-primary/5': props.selectable && props.modelValue,
    'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary': isInteractive.value,
  },
])

const isInteractive = computed(() => (props.selectable || props.clickable) && !props.disabled)

function activate(event: MouseEvent | KeyboardEvent) {
  if (!isInteractive.value) return
  if (props.selectable) emit('update:modelValue', !props.modelValue)
  emit('click', event)
}

function onKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter' && event.key !== ' ') return
  event.preventDefault()
  activate(event)
}
</script>

<template>
  <div
    :class="classes"
    :role="selectable ? 'checkbox' : clickable ? 'button' : undefined"
    :aria-checked="selectable ? modelValue : undefined"
    :aria-disabled="isInteractive ? undefined : (selectable || clickable) ? true : undefined"
    :tabindex="isInteractive ? 0 : undefined"
    @click="activate"
    @keydown="onKeydown"
  >
    <slot />
  </div>
</template>
