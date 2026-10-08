<script setup lang="ts">
import { computed, useId } from 'vue';
import { iconTextColorClasses, type IconColor } from '../surface/iconColors.ts';

const props = withDefaults(defineProps<{
  label: string;
  icon?: string;
  iconColor?: IconColor;
  name?: string;
  help?: string;
  error?: string;
  required?: boolean;
  full?: boolean;
}>(), {
  icon: undefined,
  iconColor: 'primary',
  name: undefined,
  help: undefined,
  error: undefined,
  required: false,
  full: false,
});

const generatedId = useId();
const inputId = computed(() => props.name ?? generatedId);
const messageId = computed(() => `${inputId.value}-${props.error ? 'error' : 'help'}`);
</script>

<template>
  <div class="br-field" :class="{ 'br-field-full': full }">
    <label class="br-label" :for="inputId">
      <i v-if="icon" :class="[icon, 'mr-1', iconTextColorClasses[iconColor]]" aria-hidden="true" />
      {{ label }} <span v-if="required" class="br-required" aria-hidden="true">*</span>
    </label>
    <slot :id="inputId" :invalid="Boolean(error)" :describedby="help || error ? messageId : undefined" />
    <small v-if="error" :id="messageId" class="br-error" role="alert">{{ error }}</small>
    <small v-else-if="help" :id="messageId" class="br-help">{{ help }}</small>
  </div>
</template>
