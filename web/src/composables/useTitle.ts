import { computed, onUnmounted, readonly, ref, toValue, watchEffect, type MaybeRefOrGetter } from 'vue'

const currentPageTitle = ref('')
const currentNavbarTitle = ref('')

/**
 * Sets the current page title and the title shown in the application navbar.
 * The document title follows the page title unless explicitly overridden.
 */
export function useTitle(title: MaybeRefOrGetter<string>, meta: Record<string, unknown> = {}) {
  // Reserve meta for future page metadata without changing the current API.
  void meta

  const pageTitle = computed(() => toValue(title))
  const navbarTitle = pageTitle
  const documentTitle = pageTitle

  watchEffect(() => {
    currentPageTitle.value = pageTitle.value
    currentNavbarTitle.value = navbarTitle.value

    if (typeof document !== 'undefined') {
      document.title = documentTitle.value
    }
  })

  onUnmounted(() => {
    if (currentPageTitle.value === pageTitle.value) currentPageTitle.value = ''
    if (currentNavbarTitle.value === navbarTitle.value) currentNavbarTitle.value = ''
  })

  return { pageTitle, navbarTitle, documentTitle }
}

export function useTitleState() {
  return {
    pageTitle: readonly(currentPageTitle),
    navbarTitle: readonly(currentNavbarTitle),
  }
}
