import { onBeforeUnmount, onMounted, readonly, ref, type Ref } from 'vue';

export function useMediaQuery(query: string): Readonly<Ref<boolean>> {
  const matches = ref(false);
  let mediaQuery: MediaQueryList | undefined;

  const update = (event?: MediaQueryListEvent) => {
    matches.value = event?.matches ?? mediaQuery?.matches ?? false;
  };

  onMounted(() => {
    mediaQuery = window.matchMedia(query);
    update();
    mediaQuery.addEventListener('change', update);
  });

  onBeforeUnmount(() => mediaQuery?.removeEventListener('change', update));

  return readonly(matches);
}

export function useBreakpoints() {
  return {
    isSm: useMediaQuery('(min-width: 640px)'),
    isMd: useMediaQuery('(min-width: 768px)'),
    isLg: useMediaQuery('(min-width: 1024px)'),
    isXl: useMediaQuery('(min-width: 1280px)')
  };
}
