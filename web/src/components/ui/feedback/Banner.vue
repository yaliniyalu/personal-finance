<script setup lang="ts">
import { ref } from 'vue';

const bannerColorClasses = {
  primary: {
    surface: 'border-primary/20 bg-primary/5',
    accent: 'bg-primary',
    icon: 'bg-primary/10 text-primary',
    text: 'text-primary',
  },
  secondary: {
    surface: 'border-surface-300 bg-surface-100/70 dark:border-surface-600 dark:bg-surface-700/30',
    accent: 'bg-surface-500',
    icon: 'bg-surface-200 text-surface-700 dark:bg-surface-700 dark:text-surface-200',
    text: 'text-surface-700 dark:text-surface-200',
  },
  success: {
    surface: 'border-green-200 bg-green-50/70 dark:border-green-400/20 dark:bg-green-400/10',
    accent: 'bg-green-500',
    icon: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300',
    text: 'text-green-700 dark:text-green-300',
  },
  info: {
    surface: 'border-sky-200 bg-sky-50/70 dark:border-sky-400/20 dark:bg-sky-400/10',
    accent: 'bg-sky-500',
    icon: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300',
    text: 'text-sky-700 dark:text-sky-300',
  },
  warn: {
    surface: 'border-orange-200 bg-orange-50/70 dark:border-orange-400/20 dark:bg-orange-400/10',
    accent: 'bg-orange-500',
    icon: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300',
    text: 'text-orange-700 dark:text-orange-300',
  },
  danger: {
    surface: 'border-red-200 bg-red-50/70 dark:border-red-400/20 dark:bg-red-400/10',
    accent: 'bg-red-500',
    icon: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300',
    text: 'text-red-700 dark:text-red-300',
  },
  contrast: {
    surface: 'border-surface-700 bg-surface-950 dark:border-surface-300 dark:bg-surface-0',
    accent: 'bg-surface-0 dark:bg-surface-950',
    icon: 'bg-surface-800 text-surface-0 dark:bg-surface-100 dark:text-surface-950',
    text: 'text-surface-0 dark:text-surface-950',
  },
  slate: { surface: 'border-slate-200 bg-slate-50/70 dark:border-slate-400/20 dark:bg-slate-400/10', accent: 'bg-slate-500', icon: 'bg-slate-100 text-slate-700 dark:bg-slate-400/15 dark:text-slate-300', text: 'text-slate-700 dark:text-slate-300' },
  gray: { surface: 'border-gray-200 bg-gray-50/70 dark:border-gray-400/20 dark:bg-gray-400/10', accent: 'bg-gray-500', icon: 'bg-gray-100 text-gray-700 dark:bg-gray-400/15 dark:text-gray-300', text: 'text-gray-700 dark:text-gray-300' },
  zinc: { surface: 'border-zinc-200 bg-zinc-50/70 dark:border-zinc-400/20 dark:bg-zinc-400/10', accent: 'bg-zinc-500', icon: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-400/15 dark:text-zinc-300', text: 'text-zinc-700 dark:text-zinc-300' },
  neutral: { surface: 'border-neutral-200 bg-neutral-50/70 dark:border-neutral-400/20 dark:bg-neutral-400/10', accent: 'bg-neutral-500', icon: 'bg-neutral-100 text-neutral-700 dark:bg-neutral-400/15 dark:text-neutral-300', text: 'text-neutral-700 dark:text-neutral-300' },
  stone: { surface: 'border-stone-200 bg-stone-50/70 dark:border-stone-400/20 dark:bg-stone-400/10', accent: 'bg-stone-500', icon: 'bg-stone-100 text-stone-700 dark:bg-stone-400/15 dark:text-stone-300', text: 'text-stone-700 dark:text-stone-300' },
  red: { surface: 'border-red-200 bg-red-50/70 dark:border-red-400/20 dark:bg-red-400/10', accent: 'bg-red-500', icon: 'bg-red-100 text-red-700 dark:bg-red-400/15 dark:text-red-300', text: 'text-red-700 dark:text-red-300' },
  orange: { surface: 'border-orange-200 bg-orange-50/70 dark:border-orange-400/20 dark:bg-orange-400/10', accent: 'bg-orange-500', icon: 'bg-orange-100 text-orange-700 dark:bg-orange-400/15 dark:text-orange-300', text: 'text-orange-700 dark:text-orange-300' },
  amber: { surface: 'border-amber-200 bg-amber-50/70 dark:border-amber-400/20 dark:bg-amber-400/10', accent: 'bg-amber-500', icon: 'bg-amber-100 text-amber-700 dark:bg-amber-400/15 dark:text-amber-300', text: 'text-amber-700 dark:text-amber-300' },
  yellow: { surface: 'border-yellow-200 bg-yellow-50/70 dark:border-yellow-400/20 dark:bg-yellow-400/10', accent: 'bg-yellow-500', icon: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-400/15 dark:text-yellow-300', text: 'text-yellow-700 dark:text-yellow-300' },
  lime: { surface: 'border-lime-200 bg-lime-50/70 dark:border-lime-400/20 dark:bg-lime-400/10', accent: 'bg-lime-500', icon: 'bg-lime-100 text-lime-700 dark:bg-lime-400/15 dark:text-lime-300', text: 'text-lime-700 dark:text-lime-300' },
  green: { surface: 'border-green-200 bg-green-50/70 dark:border-green-400/20 dark:bg-green-400/10', accent: 'bg-green-500', icon: 'bg-green-100 text-green-700 dark:bg-green-400/15 dark:text-green-300', text: 'text-green-700 dark:text-green-300' },
  emerald: { surface: 'border-emerald-200 bg-emerald-50/70 dark:border-emerald-400/20 dark:bg-emerald-400/10', accent: 'bg-emerald-500', icon: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-400/15 dark:text-emerald-300', text: 'text-emerald-700 dark:text-emerald-300' },
  teal: { surface: 'border-teal-200 bg-teal-50/70 dark:border-teal-400/20 dark:bg-teal-400/10', accent: 'bg-teal-500', icon: 'bg-teal-100 text-teal-700 dark:bg-teal-400/15 dark:text-teal-300', text: 'text-teal-700 dark:text-teal-300' },
  cyan: { surface: 'border-cyan-200 bg-cyan-50/70 dark:border-cyan-400/20 dark:bg-cyan-400/10', accent: 'bg-cyan-500', icon: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-400/15 dark:text-cyan-300', text: 'text-cyan-700 dark:text-cyan-300' },
  sky: { surface: 'border-sky-200 bg-sky-50/70 dark:border-sky-400/20 dark:bg-sky-400/10', accent: 'bg-sky-500', icon: 'bg-sky-100 text-sky-700 dark:bg-sky-400/15 dark:text-sky-300', text: 'text-sky-700 dark:text-sky-300' },
  blue: { surface: 'border-blue-200 bg-blue-50/70 dark:border-blue-400/20 dark:bg-blue-400/10', accent: 'bg-blue-500', icon: 'bg-blue-100 text-blue-700 dark:bg-blue-400/15 dark:text-blue-300', text: 'text-blue-700 dark:text-blue-300' },
  indigo: { surface: 'border-indigo-200 bg-indigo-50/70 dark:border-indigo-400/20 dark:bg-indigo-400/10', accent: 'bg-indigo-500', icon: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-400/15 dark:text-indigo-300', text: 'text-indigo-700 dark:text-indigo-300' },
  violet: { surface: 'border-violet-200 bg-violet-50/70 dark:border-violet-400/20 dark:bg-violet-400/10', accent: 'bg-violet-500', icon: 'bg-violet-100 text-violet-700 dark:bg-violet-400/15 dark:text-violet-300', text: 'text-violet-700 dark:text-violet-300' },
  purple: { surface: 'border-purple-200 bg-purple-50/70 dark:border-purple-400/20 dark:bg-purple-400/10', accent: 'bg-purple-500', icon: 'bg-purple-100 text-purple-700 dark:bg-purple-400/15 dark:text-purple-300', text: 'text-purple-700 dark:text-purple-300' },
  fuchsia: { surface: 'border-fuchsia-200 bg-fuchsia-50/70 dark:border-fuchsia-400/20 dark:bg-fuchsia-400/10', accent: 'bg-fuchsia-500', icon: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-400/15 dark:text-fuchsia-300', text: 'text-fuchsia-700 dark:text-fuchsia-300' },
  pink: { surface: 'border-pink-200 bg-pink-50/70 dark:border-pink-400/20 dark:bg-pink-400/10', accent: 'bg-pink-500', icon: 'bg-pink-100 text-pink-700 dark:bg-pink-400/15 dark:text-pink-300', text: 'text-pink-700 dark:text-pink-300' },
  rose: { surface: 'border-rose-200 bg-rose-50/70 dark:border-rose-400/20 dark:bg-rose-400/10', accent: 'bg-rose-500', icon: 'bg-rose-100 text-rose-700 dark:bg-rose-400/15 dark:text-rose-300', text: 'text-rose-700 dark:text-rose-300' },
} as const;

type BannerColor = keyof typeof bannerColorClasses;

const props = withDefaults(defineProps<{
  color?: BannerColor;
  icon?: string | null;
  title?: string;
  content?: string | number;
  closable?: boolean;
}>(), {
  color: 'info',
  icon: 'i-lucide-info',
  title: undefined,
  content: undefined,
  closable: false,
});

const emit = defineEmits<{ close: [] }>();
const visible = ref(true);
</script>

<template>
  <div
    v-if="visible"
    class="br-rounded-card br-shadow relative flex items-start gap-3 overflow-hidden border px-4 py-3.5 text-sm"
    :class="bannerColorClasses[props.color].surface"
    role="status"
    aria-live="polite"
  >
    <span class="absolute inset-y-0 left-0 w-1" :class="bannerColorClasses[props.color].accent" aria-hidden="true" />

    <span
      v-if="icon || $slots.icon"
      class="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg"
      :class="bannerColorClasses[props.color].icon"
      aria-hidden="true"
    >
      <slot name="icon">
        <i v-if="icon" :class="icon" />
      </slot>
    </span>

    <div class="min-w-0 flex-1 self-center">
      <p v-if="title" class="font-semibold leading-5" :class="bannerColorClasses[props.color].text">{{ title }}</p>
      <div class="leading-5" :class="[title ? 'mt-1' : '', bannerColorClasses[props.color].text]"><slot>{{ content }}</slot></div>
    </div>

    <div v-if="$slots.actions || $slots.cta" class="flex shrink-0 items-center gap-2 self-center">
      <slot name="actions"><slot name="cta" /></slot>
    </div>

    <button
      v-if="closable"
      type="button"
      class="-mr-1 -mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg opacity-70 transition hover:bg-black/5 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-current/40 dark:hover:bg-white/10"
      aria-label="Dismiss banner"
      @click="visible = false; emit('close')"
    >
      <i class="i-lucide-x" aria-hidden="true" />
    </button>
  </div>
</template>
