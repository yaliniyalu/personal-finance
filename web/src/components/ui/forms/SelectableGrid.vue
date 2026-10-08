<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';
import type { SelectableListOption } from './SelectableList.vue';

const props = withDefaults(defineProps<{
  modelValue?: string | number | null | Array<string | number>;
  options: SelectableListOption[];
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  cardClickable?: boolean;
  columns?: 1 | 2 | 3 | 4;
}>(), {
  modelValue: null,
  multiple: false,
  disabled: false,
  name: undefined,
  cardClickable: true,
  columns: 3,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | Array<string | number>];
}>();

const gridClasses = {
  1: 'grid-cols-1',
  2: 'grid-cols-1 sm:grid-cols-2',
  3: 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3',
  4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4',
} as const;

const isSelected = (value: string | number) => {
  if (props.multiple) {
    return Array.isArray(props.modelValue) && props.modelValue.includes(value);
  }

  return props.modelValue === value;
};

const updateSelection = (value: string | number, checked: boolean) => {
  if (!props.multiple) {
    emit('update:modelValue', value);
    return;
  }

  const selected = Array.isArray(props.modelValue) ? [...props.modelValue] : [];
  const index = selected.indexOf(value);

  if (checked && index === -1) selected.push(value);
  if (!checked && index !== -1) selected.splice(index, 1);

  emit('update:modelValue', selected);
};

const optionLabel = (option: SelectableListOption) => option.label ?? option.title ?? '';
</script>

<template>
  <div class="grid gap-3" :class="gridClasses[columns]" role="group">
    <component
      :is="cardClickable ? 'label' : 'div'"
      v-for="option in options"
      :key="option.value"
      class="br-border-interactive br-rounded-card br-surface flex min-h-32 cursor-pointer flex-col justify-between gap-5 p-4"
      :class="{ 'cursor-default': !cardClickable }"
    >
      <div class="flex min-w-0 items-start justify-between gap-3">
        <span
          v-if="option.icon"
          class="br-rounded br-surface-subtle br-text-muted flex size-9 shrink-0 items-center justify-center"
          aria-hidden="true"
        >
          <i :class="option.icon" />
        </span>
        <span class="min-w-0 flex-1">
          <span class="br-text block text-sm font-medium">{{ optionLabel(option) }}</span>
          <span v-if="option.subtitle" class="br-text-muted mt-1 block text-xs">{{ option.subtitle }}</span>
        </span>
        <span class="flex shrink-0 items-center">
          <Checkbox
            v-if="multiple"
            binary
            :model-value="isSelected(option.value)"
            :disabled="disabled || option.disabled"
            :name="name"
            :aria-label="optionLabel(option)"
            @update:model-value="updateSelection(option.value, $event)"
          />
          <RadioButton
            v-else
            :model-value="modelValue"
            :value="option.value"
            :disabled="disabled || option.disabled"
            :name="name"
            :aria-label="optionLabel(option)"
            @update:model-value="updateSelection(option.value, true)"
          />
        </span>
      </div>
    </component>
  </div>
</template>
