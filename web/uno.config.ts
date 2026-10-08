import { defineConfig, presetIcons } from 'unocss'

export default defineConfig({
  // Tailwind owns layout utilities; UnoCSS only generates Lucide icons.
  presets: [
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle',
      },
    }),
  ],
  safelist: [
    'i-lucide-house',
    'i-lucide-layout-grid',
    'i-lucide-square-pen',
    'i-lucide-share-2',
    'i-lucide-copy',
    'i-lucide-trash-2',
    'i-lucide-search',
    'i-lucide-sliders-horizontal',
    'i-lucide-x',
    'i-lucide-chevron-up',
    'i-lucide-chevron-down',
    'i-lucide-loader-circle',
    'i-lucide-inbox',
    'i-lucide-circle-alert',
    'i-lucide-circle-check',
    'i-lucide-ellipsis',
    'i-lucide-layout-dashboard',
    'i-lucide-folder-kanban',
    'i-lucide-boxes',
    'i-lucide-zap',
    'i-lucide-list-checks',
    'i-lucide-chart-no-axes-combined',
    'i-lucide-bell',
    'i-lucide-plus',
    'i-lucide-sparkles',
    'i-lucide-arrow-up-right',
    'i-lucide-arrow-right',
    'i-lucide-folder',
    'i-lucide-check',
    'i-lucide-chevrons-up-down',
  ],
})
