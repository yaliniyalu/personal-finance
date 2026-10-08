import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

import { setApiAccessToken, setUnauthorizedHandler } from '../api'

type Theme = 'light' | 'dark'

const STORAGE_KEY = 'bp.preferences'

interface StoredState {
  accessToken: string | null
  refreshToken: string | null
  theme: Theme
}

function loadState(): StoredState {
  const defaults: StoredState = { accessToken: null, refreshToken: null, theme: 'light' }

  try {
    const value = localStorage.getItem(STORAGE_KEY)
    if (!value) return defaults

    const stored: unknown = JSON.parse(value)
    if (typeof stored !== 'object' || stored === null) return defaults

    const data = stored as Record<string, unknown>
    return {
      accessToken: typeof data.accessToken === 'string' ? data.accessToken : null,
      refreshToken: typeof data.refreshToken === 'string' ? data.refreshToken : null,
      theme: data.theme === 'dark' ? 'dark' : 'light',
    }
  } catch {
    return defaults
  }
}

function saveState(state: StoredState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}

export const useAuthStore = defineStore('auth', () => {
  const stored = loadState()
  const accessToken = ref(stored.accessToken)
  const refreshToken = ref(stored.refreshToken)
  const theme = ref<Theme>(stored.theme)
  const isAuthenticated = computed(() => Boolean(accessToken.value))

  function persist() {
    saveState({
      accessToken: accessToken.value,
      refreshToken: refreshToken.value,
      theme: theme.value,
    })
  }

  function setTokens(nextAccessToken: string, nextRefreshToken: string | null = null) {
    accessToken.value = nextAccessToken
    refreshToken.value = nextRefreshToken
    setApiAccessToken(nextAccessToken)
    persist()
  }

  function clearTokens() {
    accessToken.value = null
    refreshToken.value = null
    setApiAccessToken(null)
    persist()
  }

  function applyTheme() {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', theme.value === 'dark')
      document.documentElement.style.colorScheme = theme.value
    }
  }

  function setTheme(nextTheme: Theme) {
    theme.value = nextTheme
    applyTheme()
    persist()
  }

  function initialize() {
    setApiAccessToken(accessToken.value)
    setUnauthorizedHandler((rejectedToken) => {
      if (accessToken.value === rejectedToken) clearTokens()
    })
    applyTheme()
  }

  return {
    accessToken,
    refreshToken,
    theme,
    isAuthenticated,
    setTokens,
    clearTokens,
    setTheme,
    initialize,
  }
})
