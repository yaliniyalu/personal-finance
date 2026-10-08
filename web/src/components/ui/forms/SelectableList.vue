<script setup lang="ts">
import Checkbox from 'primevue/checkbox';
import RadioButton from 'primevue/radiobutton';

export interface SelectableListOption {
  label?: string;
  title?: string;
  value: string | number;
  subtitle?: string;
  icon?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<{
  modelValue?: string | number | null | Array<string | number>;
  options: SelectableListOption[];
  multiple?: boolean;
  disabled?: boolean;
  name?: string;
  cardClickable?: boolean;
}>(), {
  modelValue: null,
  multiple: false,
  disabled: false,
  name: undefined,
  cardClickable: true,
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null | Array<string | number>];
}>();

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
  <div class="flex flex-col gap-2" role="group">
    <component
      :is="cardClickable ? 'label' : 'div'"
      v-for="option in options"
      :key="option.value"
      class="br-border-interactive br-rounded-card br-surface flex cursor-pointer items-center gap-3 px-4 py-3"
      :class="{ 'cursor-default': !cardClickable }"
    >
      <i v-if="option.icon" :class="option.icon" class="br-text-muted shrink-0" aria-hidden="true" />
      <span class="min-w-0 flex-1">
        <span class="br-text block text-sm font-medium">{{ optionLabel(option) }}</span>
        <span v-if="option.subtitle" class="br-text-muted mt-0.5 block text-xs">{{ option.subtitle }}</span>
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
    </component>
  </div>
</template>
