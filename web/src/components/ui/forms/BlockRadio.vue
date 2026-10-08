<script setup lang="ts">
import RadioButton from 'primevue/radiobutton';

const props = withDefaults(defineProps<{
  modelValue?: string | number | boolean | null;
  value?: string | number | boolean;
  label: string;
  subtext?: string;
  disabled?: boolean;
  name?: string;
  cardClickable?: boolean;
}>(), {
  modelValue: null,
  value: true,
  subtext: undefined,
  disabled: false,
  name: undefined,
  cardClickable: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | boolean];
}>();
</script>

<template>
  <component
    :is="cardClickable ? 'label' : 'div'"
    class="br-border-interactive br-rounded-card br-surface flex min-h-16 cursor-pointer items-center justify-between gap-4 px-4 py-3"
    :class="{ 'cursor-default': !cardClickable }"
  >
    <span class="min-w-0">
      <span class="br-text block text-sm font-medium">{{ label }}</span>
      <span v-if="subtext" class="br-text-muted mt-0.5 block text-xs">{{ subtext }}</span>
    </span>
    <RadioButton
      :model-value="modelValue"
      :value="value"
      :disabled="disabled"
      :name="name"
      :aria-label="label"
      @update:model-value="emit('update:modelValue', $event)"
    />
  </component>
</template>
