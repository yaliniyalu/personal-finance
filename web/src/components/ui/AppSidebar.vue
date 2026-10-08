<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import Badge from 'primevue/badge'
import type { NavigationItem } from '@/types/navigation'

type SidebarState = 'open' | 'mini' | 'closed'
type MobileMode = 'overlay' | 'push'
type SidebarPosition = 'left' | 'right'

interface Props {
  items?: NavigationItem[]
  activePath?: string

  /**
   * Desktop state
   */
  modelValue?: SidebarState

  /**
   * Mobile open state
   */
  mobileOpen?: boolean

  /**
   * Mobile behavior
   */
  mobileMode?: MobileMode

  /**
   * Sidebar position
   */
  position?: SidebarPosition

  /**
   * Breakpoint where mobile mode begins.
   */
  mobileBreakpoint?: number

  /**
   * Expanded sidebar width
   */
  width?: string

  /**
   * Mini sidebar width
   */
  miniWidth?: string

  /**
   * Mobile sidebar width
   */
  mobileWidth?: string

  /**
   * Show overlay in mobile overlay mode
   */
  overlay?: boolean

  /**
   * Close mobile sidebar by clicking overlay
   */
  closeOnOverlay?: boolean

  /**
   * Close mobile sidebar with Escape
   */
  closeOnEscape?: boolean

  /**
   * Allow sidebar transitions
   */
  animated?: boolean

  /**
   * Keep sidebar fixed
   */
  fixed?: boolean

  /**
   * Sidebar z-index
   */
  zIndex?: number
}

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  activePath: '',

  modelValue: 'open',
  mobileOpen: false,
  mobileMode: 'overlay',
  position: 'left',
  mobileBreakpoint: 768,

  width: '280px',
  miniWidth: '72px',
  mobileWidth: '280px',

  overlay: true,
  closeOnOverlay: true,
  closeOnEscape: true,

  animated: true,
  fixed: true,
  zIndex: 1000,
})

const emit = defineEmits<{
  'update:modelValue': [value: SidebarState]
  'update:mobileOpen': [value: boolean]

  open: []
  close: []
  mini: []
  mobileOpen: []
  mobileClose: []
  change: [state: SidebarState]
  navigate: [item: NavigationItem]
}>()

const isMobile = ref(false)

let mediaQuery: MediaQueryList | null = null

const state = computed({
  get: () => props.modelValue,
  set: (value: SidebarState) => {
    emit('update:modelValue', value)
    emit('change', value)
  },
})

const mobileVisible = computed({
  get: () => props.mobileOpen,
  set: (value: boolean) => {
    emit('update:mobileOpen', value)
  },
})

const isOpen = computed(() => state.value === 'open')
const isMini = computed(() => state.value === 'mini')
const isClosed = computed(() => state.value === 'closed')

const effectiveWidth = computed(() => {
  if (isMobile.value) {
    return mobileVisible.value ? props.mobileWidth : '0px'
  }

  if (isOpen.value) {
    return props.width
  }

  if (isMini.value) {
    return props.miniWidth
  }

  return '0px'
})

const sidebarStyle = computed(() => ({
  '--sidebar-width': props.width,
  '--sidebar-mini-width': props.miniWidth,
  '--sidebar-mobile-width': props.mobileWidth,
  '--sidebar-current-width': effectiveWidth.value,
  '--sidebar-z-index': String(props.zIndex),
}))

const layoutClasses = computed(() => ({
  'app-sidebar-layout--mobile': isMobile.value,
  'app-sidebar-layout--desktop': !isMobile.value,

  'app-sidebar-layout--open': isOpen.value,
  'app-sidebar-layout--mini': isMini.value,
  'app-sidebar-layout--closed': isClosed.value,

  'app-sidebar-layout--mobile-open': isMobile.value && mobileVisible.value,

  'app-sidebar-layout--mobile-closed': isMobile.value && !mobileVisible.value,

  'app-sidebar-layout--overlay': isMobile.value && props.mobileMode === 'overlay',

  'app-sidebar-layout--push': isMobile.value && props.mobileMode === 'push',

  'app-sidebar-layout--left': props.position === 'left',
  'app-sidebar-layout--right': props.position === 'right',

  'app-sidebar-layout--fixed': props.fixed,
  'app-sidebar-layout--animated': props.animated,
}))

function open() {
  if (isMobile.value) {
    openMobile()
    return
  }

  state.value = 'open'
  emit('open')
}

function close() {
  if (isMobile.value) {
    closeMobile()
    return
  }

  state.value = 'closed'
  emit('close')
}

function mini() {
  if (isMobile.value) {
    closeMobile()
    return
  }

  state.value = 'mini'
  emit('mini')
}

function toggle() {
  if (isMobile.value) {
    toggleMobile()
    return
  }

  state.value = state.value === 'open' ? 'mini' : 'open'
}

function toggleFull() {
  if (isMobile.value) {
    toggleMobile()
    return
  }

  state.value = state.value === 'closed' ? 'open' : 'closed'
}

function openMobile() {
  mobileVisible.value = true
  emit('mobileOpen')
}

function closeMobile() {
  mobileVisible.value = false
  emit('mobileClose')
}

function toggleMobile() {
  mobileVisible.value ? closeMobile() : openMobile()
}

function handleOverlayClick() {
  if (!props.closeOnOverlay) return

  closeMobile()
}

function handleKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && props.closeOnEscape && isMobile.value && mobileVisible.value) {
    closeMobile()
  }
}

function updateDeviceMode(event?: MediaQueryListEvent) {
  const mobile = event ? event.matches : (mediaQuery?.matches ?? false)

  const previous = isMobile.value

  isMobile.value = mobile

  /*
   * Optional behavior:
   * automatically close mobile drawer when switching
   * from desktop -> mobile.
   */
  if (!previous && mobile) {
    mobileVisible.value = false
  }
}

function setupMediaQuery() {
  if (typeof window === 'undefined') return

  mediaQuery?.removeEventListener('change', updateDeviceMode)

  mediaQuery = window.matchMedia(`(max-width: ${props.mobileBreakpoint - 1}px)`)

  updateDeviceMode()

  mediaQuery.addEventListener('change', updateDeviceMode)
}

watch(
  () => props.mobileBreakpoint,
  async () => {
    await nextTick()
    setupMediaQuery()
  },
)

onMounted(() => {
  setupMediaQuery()

  window.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  mediaQuery?.removeEventListener('change', updateDeviceMode)

  window.removeEventListener('keydown', handleKeydown)
})

defineExpose({
  open,
  close,
  mini,
  toggle,
  toggleFull,

  openMobile,
  closeMobile,
  toggleMobile,

  isMobile,
  isOpen,
  isMini,
  isClosed,
})
</script>

<template>
  <div class="app-sidebar-layout" :class="layoutClasses" :style="sidebarStyle">
    <!--
      MOBILE OVERLAY
    -->
    <Transition name="sidebar-overlay">
      <div
        v-if="isMobile && mobileVisible && mobileMode === 'overlay' && overlay"
        class="app-sidebar-overlay"
        aria-hidden="true"
        @click="handleOverlayClick"
      />
    </Transition>

    <!--
      SIDEBAR
    -->
    <aside
      class="app-sidebar"
      :class="{
        'app-sidebar--mini': !isMobile && isMini,
        'app-sidebar--open': (!isMobile && isOpen) || (isMobile && mobileVisible),
        'app-sidebar--closed': (!isMobile && isClosed) || (isMobile && !mobileVisible),
      }"
    >
      <!-- Header -->
      <div class="app-sidebar__header">
        <slot
          name="header"
          :open="open"
          :close="close"
          :mini="mini"
          :toggle="toggle"
          :is-mini="isMini"
          :is-mobile="isMobile"
        >
          <div class="app-sidebar__brand">
            <span v-if="!isMini || isMobile" class="app-sidebar__brand-text"> Application </span>

            <button
              type="button"
              class="app-sidebar__toggle"
              aria-label="Toggle sidebar"
              @click="toggle"
            >
              ☰
            </button>
          </div>
        </slot>
      </div>

      <!-- Main sidebar content -->
      <div class="app-sidebar__body">
        <!--
          Optional dedicated mini slot.

          If mini slot is not supplied, your normal
          sidebar content is displayed and CSS can hide
          text using the `isMini` slot property.
        -->
        <slot v-if="isMini && !isMobile && !props.items.length" name="mini" :open="open" :close="close" :toggle="toggle">
          <slot :mini="true" :mobile="false" :close="close" />
        </slot>

        <template v-else-if="props.items.length">
          <nav class="space-y-1" aria-label="Primary navigation">
            <template v-for="item in props.items" :key="item.label">
              <p
                v-if="item.children?.length && !isMini"
                class="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wide br-muted"
              >
                {{ item.label }}
              </p>
              <template v-if="item.children?.length">
                <button
                  v-for="child in item.children"
                  :key="child.label"
                  type="button"
                  class="br-nav-link"
                  :class="{ 'br-nav-link-active': child.to === props.activePath }"
                  :disabled="child.disabled"
                  :title="isMini ? child.label : undefined"
                  @click="emit('navigate', child)"
                >
                  <i v-if="child.icon" :class="child.icon" class="shrink-0" />
                  <span v-if="!isMini" class="min-w-0 flex-1 truncate text-left">{{ child.label }}</span>
                  <Badge v-if="child.badge && !isMini" :value="child.badge" />
                </button>
              </template>
              <button
                v-else
                type="button"
                class="br-nav-link"
                :class="{ 'br-nav-link-active': item.to === props.activePath }"
                :disabled="item.disabled"
                :title="isMini ? item.label : undefined"
                @click="emit('navigate', item)"
              >
                <i v-if="item.icon" :class="item.icon" class="shrink-0" />
                <span v-if="!isMini" class="min-w-0 flex-1 truncate text-left">{{ item.label }}</span>
                <Badge v-if="item.badge && !isMini" :value="item.badge" />
              </button>
            </template>
          </nav>
        </template>
        <slot v-else :mini="false" :mobile="isMobile" :close="close" />
      </div>

      <!-- Footer -->
      <div v-if="$slots.footer" class="app-sidebar__footer">
        <slot name="footer" :mini="isMini && !isMobile" :mobile="isMobile" />
      </div>
    </aside>

    <!--
      PAGE CONTENT

      Putting the content inside the component allows
      mobile push mode and desktop sidebar layouts to
      work automatically.
    -->
    <main class="app-sidebar-content">
      <slot
        name="content"
        :open="open"
        :close="close"
        :mini="mini"
        :toggle="toggle"
        :toggle-mobile="toggleMobile"
        :is-mobile="isMobile"
      />
    </main>
  </div>
</template>

<style scoped>
/*
|--------------------------------------------------------------------------
| BASE / CUSTOMIZATION
|--------------------------------------------------------------------------
|
| Override any of these variables from the parent:
|
| .my-layout {
|   --sidebar-bg: #111827;
|   --sidebar-text: #f9fafb;
|   --sidebar-border: #374151;
| }
|
*/

.app-sidebar-layout {
  --sidebar-bg: var(--br-surface);
  --sidebar-text: var(--br-text);
  --sidebar-border: var(--br-border-color);

  --sidebar-content-bg: var(--br-page-bg);

  --sidebar-overlay-bg: color-mix(in srgb, var(--br-text) 45%, transparent);

  --sidebar-transition-duration: 250ms;
  --sidebar-transition-timing: cubic-bezier(0.4, 0, 0.2, 1);

  --sidebar-shadow: var(--br-shadow-popup);

  --sidebar-header-height: 64px;

  --sidebar-padding-x: 12px;
  --sidebar-padding-y: 12px;

  --sidebar-border-width: 1px;

  position: relative;

  display: flex;

  width: 100%;
  min-height: 100dvh;
  max-width: 100%;

  background: var(--sidebar-content-bg);

  overflow-x: hidden;
}

/*
|--------------------------------------------------------------------------
| SIDEBAR
|--------------------------------------------------------------------------
*/

.app-sidebar {
  position: relative;

  display: flex;
  flex-direction: column;

  width: var(--sidebar-current-width);
  min-width: var(--sidebar-current-width);

  height: 100dvh;

  overflow: hidden;

  color: var(--sidebar-text);
  background: var(--sidebar-bg);

  z-index: var(--sidebar-z-index);
}

.app-sidebar-layout--left .app-sidebar {
  border-right: var(--sidebar-border-width) solid var(--sidebar-border);
}

.app-sidebar-layout--right {
  flex-direction: row-reverse;
}

.app-sidebar-layout--right .app-sidebar {
  border-left: var(--sidebar-border-width) solid var(--sidebar-border);

  border-right: none;
}

/*
|--------------------------------------------------------------------------
| FIXED DESKTOP SIDEBAR
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--fixed .app-sidebar {
  position: fixed;

  top: 0;
  bottom: 0;
}

.app-sidebar-layout--fixed.app-sidebar-layout--left .app-sidebar {
  left: 0;
}

.app-sidebar-layout--fixed.app-sidebar-layout--right .app-sidebar {
  right: 0;
}

/*
|--------------------------------------------------------------------------
| DESKTOP CONTENT OFFSET
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--desktop.app-sidebar-layout--fixed .app-sidebar-content {
  transition-property: margin;
}

.app-sidebar-layout--desktop.app-sidebar-layout--fixed.app-sidebar-layout--left
  .app-sidebar-content {
  margin-left: var(--sidebar-current-width);
}

.app-sidebar-layout--desktop.app-sidebar-layout--fixed.app-sidebar-layout--right
  .app-sidebar-content {
  margin-right: var(--sidebar-current-width);
}

/*
|--------------------------------------------------------------------------
| SIDEBAR HEADER
|--------------------------------------------------------------------------
*/

.app-sidebar__header {
  flex-shrink: 0;

  min-height: var(--sidebar-header-height);

  display: flex;
  align-items: center;

  padding: var(--sidebar-padding-y) var(--sidebar-padding-x);

  border-bottom: var(--sidebar-border-width) solid var(--sidebar-border);
}

.app-sidebar__brand {
  display: flex;
  align-items: center;
  justify-content: space-between;

  gap: 12px;

  width: 100%;
}

.app-sidebar__brand-text {
  overflow: hidden;

  white-space: nowrap;

  font-size: 18px;
  font-weight: 600;
}

/*
|--------------------------------------------------------------------------
| TOGGLE
|--------------------------------------------------------------------------
*/

.app-sidebar__toggle {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  width: 40px;
  height: 40px;

  flex-shrink: 0;

  border: 0;
  border-radius: 8px;

  cursor: pointer;

  color: inherit;

  background: transparent;
}

.app-sidebar__toggle:hover {
  background: var(--br-surface-hover);
}

/*
|--------------------------------------------------------------------------
| BODY
|--------------------------------------------------------------------------
*/

.app-sidebar__body {
  flex: 1;

  min-height: 0;

  overflow-x: hidden;
  overflow-y: auto;

  padding: var(--sidebar-padding-y) var(--sidebar-padding-x);
}

/*
|--------------------------------------------------------------------------
| FOOTER
|--------------------------------------------------------------------------
*/

.app-sidebar__footer {
  flex-shrink: 0;

  padding: var(--sidebar-padding-y) var(--sidebar-padding-x);

  border-top: var(--sidebar-border-width) solid color-mix(in srgb, var(--sidebar-text) 12%, transparent);
}

/*
|--------------------------------------------------------------------------
| MINI MODE
|--------------------------------------------------------------------------
*/

.app-sidebar--mini .app-sidebar__header {
  justify-content: center;
}

.app-sidebar--mini .app-sidebar__brand {
  justify-content: center;
}

/*
|--------------------------------------------------------------------------
| PAGE CONTENT
|--------------------------------------------------------------------------
*/

.app-sidebar-content {
  position: relative;

  flex: 1;

  width: 100%;
  min-width: 0;
  min-height: 100dvh;

  background: var(--sidebar-content-bg);
}

/*
|--------------------------------------------------------------------------
| MOBILE
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--mobile .app-sidebar {
  position: fixed;

  top: 0;
  bottom: 0;

  width: var(--sidebar-mobile-width);
  min-width: var(--sidebar-mobile-width);

  box-shadow: var(--sidebar-shadow);
}

/*
|--------------------------------------------------------------------------
| MOBILE LEFT
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--mobile.app-sidebar-layout--left .app-sidebar {
  left: 0;
}

.app-sidebar-layout--mobile.app-sidebar-layout--left.app-sidebar-layout--mobile-closed
  .app-sidebar {
  transform: translateX(-100%);
}

/*
|--------------------------------------------------------------------------
| MOBILE RIGHT
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--mobile.app-sidebar-layout--right .app-sidebar {
  right: 0;
}

.app-sidebar-layout--mobile.app-sidebar-layout--right.app-sidebar-layout--mobile-closed
  .app-sidebar {
  transform: translateX(100%);
}

/*
|--------------------------------------------------------------------------
| MOBILE OPEN
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--mobile.app-sidebar-layout--mobile-open .app-sidebar {
  transform: translateX(0);
}

/*
|--------------------------------------------------------------------------
| MOBILE PUSH MODE
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--mobile.app-sidebar-layout--push.app-sidebar-layout--left.app-sidebar-layout--mobile-open
  .app-sidebar-content {
  transform: translateX(var(--sidebar-mobile-width));
}

.app-sidebar-layout--mobile.app-sidebar-layout--push.app-sidebar-layout--right.app-sidebar-layout--mobile-open
  .app-sidebar-content {
  transform: translateX(calc(var(--sidebar-mobile-width) * -1));
}

/*
|--------------------------------------------------------------------------
| MOBILE OVERLAY
|--------------------------------------------------------------------------
*/

.app-sidebar-overlay {
  position: fixed;

  inset: 0;

  z-index: calc(var(--sidebar-z-index) - 1);

  background: var(--sidebar-overlay-bg);
}

/*
|--------------------------------------------------------------------------
| ANIMATIONS
|--------------------------------------------------------------------------
*/

.app-sidebar-layout--animated .app-sidebar,
.app-sidebar-layout--animated .app-sidebar-content {
  transition-duration: var(--sidebar-transition-duration);

  transition-timing-function: var(--sidebar-transition-timing);
}

.app-sidebar-layout--animated .app-sidebar {
  transition-property: width, min-width, transform;
}

.app-sidebar-layout--animated .app-sidebar-content {
  transition-property: margin, transform;
}

.sidebar-overlay-enter-active,
.sidebar-overlay-leave-active {
  transition: opacity var(--sidebar-transition-duration) var(--sidebar-transition-timing);
}

.sidebar-overlay-enter-from,
.sidebar-overlay-leave-to {
  opacity: 0;
}

/*
|--------------------------------------------------------------------------
| REDUCED MOTION
|--------------------------------------------------------------------------
*/

@media (prefers-reduced-motion: reduce) {
  .app-sidebar,
  .app-sidebar-content,
  .app-sidebar-overlay {
    transition: none !important;
  }
}
</style>
