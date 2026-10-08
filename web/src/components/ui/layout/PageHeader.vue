<script setup lang="ts">
import Button from 'primevue/button';

withDefaults(defineProps<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  backLabel?: string;
}>(), {
  subtitle: undefined,
  eyebrow: undefined,
  breadcrumbs: undefined,
  backLabel: undefined
});

const emit = defineEmits<{ back: [] }>();
</script>

<template>
  <header class="br-page-header">
    <div class="min-w-0">
      <div v-if="$slots.eyebrow || breadcrumbs?.length || backLabel || eyebrow" class="mb-1">
        <slot name="eyebrow">
          <nav v-if="breadcrumbs?.length" aria-label="Breadcrumb" class="flex items-center gap-2 text-sm br-text-muted">
            <template v-for="(item, index) in breadcrumbs" :key="`${item.label}-${index}`">
              <a v-if="item.href && index < breadcrumbs.length - 1" :href="item.href" class="hover:text-primary">{{ item.label }}</a>
              <span v-else :aria-current="index === breadcrumbs.length - 1 ? 'page' : undefined">{{ item.label }}</span>
              <i v-if="index < breadcrumbs.length - 1" class="pi pi-chevron-right text-xs" aria-hidden="true" />
            </template>
          </nav>
          <Button
            v-else-if="backLabel"
            :label="backLabel"
            icon="pi pi-arrow-left"
            severity="secondary"
            text
            size="small"
            class="!px-0"
            @click="emit('back')"
          />
          <span v-else class="text-xs font-semibold uppercase tracking-wide text-primary">{{ eyebrow }}</span>
        </slot>
      </div>
      <h1 class="br-page-title">{{ title }}</h1>
      <p v-if="subtitle" class="br-page-description">{{ subtitle }}</p>
    </div>
    <div v-if="$slots.actions" class="br-page-actions">
      <slot name="actions" />
    </div>
  </header>
</template>
