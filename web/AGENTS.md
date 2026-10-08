# AGENTS.md

Before adding styles, inspect `src/assets/main.css` and reuse its `br-*` classes and `--br-*` tokens when they fit. Avoid duplicating shared colors, surfaces, borders, radii, text colors, or light/dark pairs.

Useful classes include `br-surface`, `br-surface-muted`, `br-surface-subtle`, `br-border`, `br-border-interactive`, `br-rounded-card`, `br-text`, `br-text-muted`, and `br-text-subtle`.

Use PrimeVue/Tailwind PrimeUI semantic utilities such as `text-primary`, `bg-primary`, `border-primary`, and their `*-emphasis` variants for primary states.

Do not force an existing class when it does not fit the component’s semantics or visual intent. Add new local styles for genuinely unique behavior, and promote recurring patterns to `main.css`.

1. Use primevue components wherever possible. No need to import. Auto import enabled.
2. Use tailwind for styling.
3. Some primevue components support fluid instead of claass="w-full"
4. Prefer function name() for component script functions instead of const func = () => {}
5. use useSimpleConfirmDialog for confirmation dialogs.
6. Use components/ui folder only for reusable components across different projects
7. Must be mobile first responsive. Must feel like mobile app for mobile user and Web app for Desktop user.

## Shared UI components

Before creating a component, inspect `src/components/ui` and reuse the component below when it already provides the needed functionality. Prefer its props, slots, and built-in class/style variants (for example size, color, padding, severity, and layout options) even when a small visual difference is needed. Use a local class/style only when the existing variants cannot express the required design; extend a shared component with a reusable variant when the need recurs. Create a new UI component only for reusable functionality that is not covered here. Keep project-specific components outside `src/components/ui`.

### General

- `AppButton.vue` — PrimeVue Button wrapper that forwards props and attributes.
- `AppSidebar.vue` — responsive navigation sidebar with open/mini/closed desktop states, mobile overlay/push modes, and navigation items or slots.
- `AvatarCustom.vue` — reusable avatar display with fallback handling and configurable appearance.
- `CopyText.vue` — displays text with a copy-to-clipboard action.
- `LocationPicker.vue` — location selection input/picker.
- `OverflowActions.vue` — compact overflow menu for contextual actions.

### Confirm dialogs

- `confirm-dialog/ConfirmDialog.vue` — shared confirmation dialog integration.
- `confirm-dialog/SimpleConfirmDialog.vue` — simple reusable confirmation dialog UI.
- `confirm-dialog/use-simple-confirm-dialog.ts` — composable to open and handle the simple confirmation dialog.

### Data display

- `data/DetailGrid.vue` — grid layout for a collection of detail items.
- `data/DetailItem.vue` — label/value detail pair for read-only data.

### Feedback and loading

- `feedback/AppState.vue` — standard empty, error, or other page state presentation.
- `feedback/Banner.vue` — inline status or notice banner with severity styling.
- `feedback/BannerButton.vue` — button/action presentation for a banner.
- `feedback/FullScreenSpinner.vue` — full viewport loading indicator.
- `feedback/LoadingBlock.vue` — loading placeholder for a content region.
- `feedback/OverlaySpinner.vue` — loading indicator over existing content.

### Forms and selection

- `forms/BlockCheck.vue` — block-style checkbox choice.
- `forms/BlockRadio.vue` — block-style radio choice.
- `forms/BlockToggle.vue` — block-style toggle choice.
- `forms/FormActions.vue` — consistent form action button layout.
- `forms/FormField.vue` — form field wrapper for label, help, error, and control content.
- `forms/FormSection.vue` — grouped form section with heading/description layout.
- `forms/SelectableGrid.vue` — selectable options arranged in a grid.
- `forms/SelectableList.vue` — selectable options arranged in a list.

### Layout and navigation

- `layout/AppShell.vue` — application shell combining sidebar, topbar, and page content slots.
- `layout/AppTopbar.vue` — top navigation bar with menu event and start/actions slots.
- `layout/MobileBottomNav.vue` — fixed mobile navigation bar with active item state.
- `layout/PageHeader.vue` — page title, subtitle, breadcrumbs/back action, and action slot.
- `layout/SectionHeader.vue` — section title, description, optional icon, and action slot.

### Overlays

- `overlay/ConfirmActionDialog.vue` — confirmation dialog with severity, loading, and confirm/cancel actions.
- `overlay/ResponsiveDialog.vue` — responsive modal on larger screens and bottom drawer on smaller screens.

### Surfaces and styling helpers

- `surface/AppBox.vue` — configurable surface/container with padding, radius, border, background, shadow, hover, and selectable/clickable variants.
- `surface/AppCard.vue` — card with optional title, subtitle, icon, header/actions, body, and footer slots.
- `surface/IconBadge.vue` — icon container with size, color, and shape variants.
- `surface/StatCard.vue` — metric card with label, value, optional icon, change, and trend.
- `surface/iconColors.ts` — shared icon color and text color class maps/types; use these when adding icon color variants.
