import { computed, readonly, ref } from 'vue';

export type ThemeMode = 'light' | 'dark' | 'system';

const STORAGE_KEY = 'br-theme';
const mode = ref<ThemeMode>('system');
let initialized = false;
let systemQuery: MediaQueryList | undefined;

function resolveDark(value: ThemeMode) {
  return value === 'dark' || (value === 'system' && systemQuery?.matches === true);
}

function applyTheme() {
  if (typeof document === 'undefined') return;
  document.documentElement.classList.toggle('dark', resolveDark(mode.value));
  document.documentElement.dataset.theme = mode.value;
}

export function useTheme() {
  const initialize = () => {
    if (initialized || typeof window === 'undefined') return;
    initialized = true;
    systemQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = localStorage.getItem(STORAGE_KEY);
    mode.value = saved === 'light' || saved === 'dark' || saved === 'system' ? saved : 'system';
    systemQuery.addEventListener('change', applyTheme);
    applyTheme();
  };

  const setMode = (value: ThemeMode) => {
    mode.value = value;
    if (typeof localStorage !== 'undefined') localStorage.setItem(STORAGE_KEY, value);
    applyTheme();
  };

  const toggle = () => setMode(resolveDark(mode.value) ? 'light' : 'dark');

  return {
    mode: readonly(mode),
    isDark: computed(() => resolveDark(mode.value)),
    initialize,
    setMode,
    toggle
  };
}
