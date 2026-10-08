<script setup lang="ts">
import { computed, ref } from 'vue'
import { useTitle } from '@/composables/useTitle'
import useSnackBar from '@/composables/use-snack-bar'
import DarkModeToggle from '../components/DarkModeToggle.vue'
import OverflowActions from '../components/ui/OverflowActions.vue'
import AppCard from '@/components/ui/surface/AppCard.vue'
import AppBox from '@/components/ui/surface/AppBox.vue'
import StatCard from '@/components/ui/surface/StatCard.vue'
import DetailGrid from '@/components/ui/data/DetailGrid.vue'
import DetailItem from '@/components/ui/data/DetailItem.vue'
import AppState from '@/components/ui/feedback/AppState.vue'
import Banner from '@/components/ui/feedback/Banner.vue'
import BannerButton from '@/components/ui/feedback/BannerButton.vue'
import FullScreenSpinner from '@/components/ui/feedback/FullScreenSpinner.vue'
import LoadingBlock from '@/components/ui/feedback/LoadingBlock.vue'
import OverlaySpinner from '@/components/ui/feedback/OverlaySpinner.vue'
import FormActions from '@/components/ui/forms/FormActions.vue'
import FormField from '@/components/ui/forms/FormField.vue'
import FormSection from '@/components/ui/forms/FormSection.vue'
import BlockCheck from '@/components/ui/forms/BlockCheck.vue'
import BlockRadio from '@/components/ui/forms/BlockRadio.vue'
import BlockToggle from '@/components/ui/forms/BlockToggle.vue'
import SelectableList from '@/components/ui/forms/SelectableList.vue'
import PageHeader from '@/components/ui/layout/PageHeader.vue'
import SectionHeader from '@/components/ui/layout/SectionHeader.vue'
import ConfirmActionDialog from '@/components/ui/overlay/ConfirmActionDialog.vue'
import ResponsiveDialog from '@/components/ui/overlay/ResponsiveDialog.vue'
import MobileBottomNav from '@/components/ui/layout/MobileBottomNav.vue'
import AvatarCustom from '@/components/ui/AvatarCustom.vue'
import CopyText from '@/components/ui/CopyText.vue'
import ConfirmDialog from '@/components/ui/confirm-dialog/ConfirmDialog.vue'
import useSimpleConfirmDialog from '@/components/ui/confirm-dialog/use-simple-confirm-dialog'
import type { NavigationItem } from '@/types/navigation'

const { pageTitle } = useTitle('UI component showcase')
const snackBar = useSnackBar()

type DemoRecord = {
  id: number
  name: string
  owner: string
  status: 'Active' | 'Pending' | 'Archived'
  updated: string
}

const search = ref('')
const activeMobileNavPath = ref('/')
const mobileNavItems: NavigationItem[] = [
  { label: 'Home', icon: 'pi pi-home', to: '/' },
  { label: 'Projects', icon: 'pi pi-folder', to: '/projects' },
  { label: 'Activity', icon: 'pi pi-bell', to: '/activity' },
  { label: 'Profile', icon: 'pi pi-user', to: '/profile' },
]
const notificationsEnabled = ref(true)
const weeklyDigestEnabled = ref(false)
const selectedBox = ref(false)
const isOverlaySpinnerVisible = ref(false)
const isFullScreenSpinnerVisible = ref(false)
const isResponsiveDialogVisible = ref(false)
const isConfirmDialogVisible = ref(false)
const isSimpleConfirmDialogVisible = ref(false)
const simpleConfirmDialog = useSimpleConfirmDialog()
const defaultWorkspace = ref<string | null>('operations')
const notificationChannels = ref<Array<string | number>>(['email'])
const records: DemoRecord[] = [
  { id: 1, name: 'Website redesign', owner: 'Alex Morgan', status: 'Active', updated: 'Today, 10:24 AM' },
  { id: 2, name: 'Mobile app launch', owner: 'Jamie Lee', status: 'Pending', updated: 'Yesterday, 4:10 PM' },
  { id: 3, name: 'Q3 campaign', owner: 'Taylor Kim', status: 'Archived', updated: 'Sep 18, 2026' },
]

const filteredRecords = computed(() => {
  const query = search.value.trim().toLowerCase()
  if (!query) return records
  return records.filter((record) => `${record.name} ${record.owner} ${record.status}`.toLowerCase().includes(query))
})

const recordActions = [{ label: 'View details' }, { label: 'Edit record' }, { label: 'Archive' }]

function statusSeverity(status: DemoRecord['status']) {
  return status === 'Active' ? 'success' : status === 'Pending' ? 'warn' : 'secondary'
}

function showOverlaySpinner() {
  isOverlaySpinnerVisible.value = true
  window.setTimeout(() => {
    isOverlaySpinnerVisible.value = false
  }, 1500)
}

function showFullScreenSpinner() {
  isFullScreenSpinnerVisible.value = true
  window.setTimeout(() => {
    isFullScreenSpinnerVisible.value = false
  }, 1500)
}

function selectMobileNavItem(item: NavigationItem) {
  if (item.to) activeMobileNavPath.value = item.to
}

function showPromiseSnackBar() {
  const notification = snackBar.promise({ title: 'Saving changes', message: 'Please wait…' })
  window.setTimeout(() => {
    notification.success({ title: 'Changes saved', message: 'Your workspace settings are up to date.' })
  }, 1200)
}

function showPromiseError() {
  const notification = snackBar.promise({ title: 'Processing request', message: 'Please wait…' })
  window.setTimeout(() => {
    notification.error(new Error('The server could not complete the request.'), 'Request failed')
  }, 1200)
}

async function showPromiseConfirm() {
  try {
    const result = await simpleConfirmDialog.safeConfirm({
      header: 'Remove team member?',
      message: 'They will lose access to this workspace immediately.',
      confirmLabel: 'Remove member',
      confirmSeverity: 'danger',
    })
    if (result.confirmed) {
      snackBar.success({ title: 'Member removed', message: 'The confirmation action was accepted.' })
    }
  } catch (error) {
    snackBar.error(error, 'Could not open confirmation')
  }
}
</script>

<template>
  <main class="br-page">
    <div class="br-section">
      <PageHeader
        :title="pageTitle"
        subtitle="Explore the building blocks behind BrightPanel, from everyday surfaces to responsive forms and feedback."
      >
        <template #eyebrow><span class="text-xs font-semibold uppercase tracking-wide text-primary">BrightPanel · Design system</span></template>
        <template #actions><DarkModeToggle /></template>
      </PageHeader>

      <AppCard
        title="Page header eyebrows"
        subtitle="Use a text label, breadcrumb trail, back action, or custom eyebrow slot above the page title."
        icon="i-lucide-panel-top"
        icon-color="info"
      >
        <div class="grid gap-6 md:grid-cols-2">
          <PageHeader title="Text eyebrow" eyebrow="Projects" />
          <PageHeader
            title="Breadcrumb eyebrow"
            :breadcrumbs="[
              { label: 'Home', href: '/' },
              { label: 'Projects', href: '/projects' },
              { label: 'Website redesign' },
            ]"
          />
          <PageHeader title="Back button eyebrow" back-label="Back to projects" @back="snackBar.info({ title: 'Back action', message: 'The back action was clicked.' })" />
          <PageHeader title="Custom slot eyebrow">
            <template #eyebrow>
              <span class="text-xs font-semibold uppercase tracking-wide text-primary">BrightPanel · Design system</span>
            </template>
          </PageHeader>
        </div>
      </AppCard>

      <AppCard title="Layout and overlay components" icon="i-lucide-panels-top-left" icon-color="info">
        <SectionHeader
          title="Responsive patterns"
          description="The shell provides navigation and topbar structure; these controls demonstrate the shared headers and dialogs."
          icon="i-lucide-panels-top-left"
          icon-color="info"
        >
          <template #actions>
            <Button label="Open dialog" size="small" outlined @click="isResponsiveDialogVisible = true" />
          </template>
        </SectionHeader>
        <div class="br-row">
          <Button label="Open confirmation" icon="pi pi-trash" severity="danger" size="small" outlined @click="isConfirmDialogVisible = true" />
          <Button label="Open responsive dialog" icon="pi pi-window-maximize" size="small" @click="isResponsiveDialogVisible = true" />
        </div>
      </AppCard>

      <AppCard
        title="Avatars, copy, and confirmations"
        subtitle="Custom initials, copyable values, and both controlled and promise-based confirmation dialogs."
        icon="i-lucide-user-round"
        icon-color="violet"
      >
        <div class="grid gap-6 lg:grid-cols-2">
          <div class="br-stack">
            <p class="text-sm font-medium">AvatarCustom</p>
            <div class="flex flex-wrap items-end gap-4">
              <div class="br-stack-sm items-center">
                <AvatarCustom name="Alex Morgan" shape="circle" />
                <span class="text-xs br-muted">Circle initials</span>
              </div>
              <div class="br-stack-sm items-center">
                <AvatarCustom name="Jamie Lee" shape="square" size="large" />
                <span class="text-xs br-muted">Large square</span>
              </div>
              <div class="br-stack-sm items-center">
                <AvatarCustom name="Taylor Kim" width="3.5rem" height="3.5rem" font-size="1.125rem" />
                <span class="text-xs br-muted">Custom dimensions</span>
              </div>
            </div>
            <div class="br-rounded-card br-border p-4">
              <p class="text-sm font-medium">CopyText</p>
              <p class="mt-2 text-sm br-muted">Workspace ID: <CopyText text="ws_7f3a92" class="font-mono text-primary" /></p>
              <p class="mt-2 text-sm br-muted">Display label with a separate copied value: <CopyText text="Acme Operations" copy-text="acme-operations" title="Copy workspace slug" class="font-medium" /></p>
            </div>
          </div>

          <div class="br-stack">
            <p class="text-sm font-medium">Confirm dialogs</p>
            <div class="br-row">
              <Button label="Controlled dialog" size="small" outlined @click="isSimpleConfirmDialogVisible = true" />
              <Button label="Promise confirmation" size="small" severity="danger" @click="showPromiseConfirm" />
            </div>
            <p class="text-xs br-muted">The promise example uses safeConfirm, so canceling resolves with a cancelled result.</p>
          </div>
        </div>
      </AppCard>

      <AppCard
        title="Snack bar notifications"
        subtitle="Trigger each severity, pass an error, or preview a notification that updates when an async task finishes."
        icon="i-lucide-bell"
        icon-color="info"
      >
        <div class="br-row">
          <Button label="Success" severity="success" size="small" @click="snackBar.success({ title: 'Saved', message: 'Your changes were saved.' })" />
          <Button label="Info" severity="info" size="small" @click="snackBar.info({ title: 'New activity', message: 'Your workspace has 3 updates.' })" />
          <Button label="Warning" severity="warn" size="small" @click="snackBar.warn({ title: 'Storage almost full', message: 'You have used 90% of your storage.' })" />
          <Button label="Error" severity="danger" size="small" @click="snackBar.danger({ title: 'Could not save', message: 'Check your connection and try again.' })" />
          <Button label="Handle error" severity="danger" outlined size="small" @click="snackBar.error(new Error('The server could not complete the request.'), 'Request failed')" />
          <Button label="Promise success" severity="secondary" outlined size="small" @click="showPromiseSnackBar" />
          <Button label="Promise error" severity="secondary" outlined size="small" @click="showPromiseError" />
          <Button label="Clear all" severity="secondary" text size="small" @click="snackBar.clearAll" />
        </div>
      </AppCard>

      <AppCard
        title="Mobile bottom navigation"
        subtitle="A fixed navigation bar with safe-area spacing. It appears below 768px; tap an item to preview its active state."
        icon="i-lucide-panel-bottom"
        icon-color="info"
      >
        <p class="text-sm br-text-muted">Resize the window to a mobile width to see the bar at the bottom of the screen.</p>
      </AppCard>

      <div class="br-grid-4">
        <StatCard
          label="Total revenue"
          value="$24,780"
          icon="i-lucide-dollar-sign"
          icon-color="green"
          change="+12.5% from last month"
          trend="up"
        />
        <StatCard
          label="Active users"
          value="8,492"
          icon="i-lucide-users"
          icon-color="indigo"
          change="+8.2% from last month"
          trend="up"
        />
        <StatCard
          label="Orders"
          value="1,284"
          icon="i-lucide-shopping-bag"
          icon-color="amber"
          change="-2.4% from last month"
          trend="down"
        />
        <StatCard
          label="Conversion rate"
          value="6.8%"
          icon="i-lucide-chart-no-axes-combined"
          icon-color="pink"
          change="No change from last month"
          trend="neutral"
        />
      </div>

      <AppCard title="AppBox variants" subtitle="Composable surfaces with shared borders, backgrounds, and interaction states.">
        <div class="br-auto-grid">
          <AppBox padding="md" rounded="card" border="default" background="surface">
            <p class="text-sm font-medium">Default surface</p>
            <p class="mt-1 text-xs br-text-muted">Card radius and standard border.</p>
          </AppBox>
          <AppBox padding="md" rounded="section" border="strong" background="muted">
            <p class="text-sm font-medium">Muted surface</p>
            <p class="mt-1 text-xs br-text-muted">Strong border with a muted background.</p>
          </AppBox>
          <AppBox padding="md" rounded="default" border="interactive" background="subtle" hoverable>
            <p class="text-sm font-medium">Hover treatment</p>
            <p class="mt-1 text-xs br-text-muted">Uses the shared interactive border and hover surface.</p>
          </AppBox>
          <AppBox v-model="selectedBox" padding="md" rounded="card" border="interactive" selectable>
            <p class="text-sm font-medium">Selectable box</p>
            <p class="mt-1 text-xs br-text-muted">Click or press Enter/Space to toggle. {{ selectedBox ? 'Selected' : 'Not selected' }}</p>
          </AppBox>
          <AppBox padding="lg" rounded="section" border="none" background="subtle" shadow="default">
            <p class="text-sm font-medium">Borderless with shadow</p>
            <p class="mt-1 text-xs br-text-muted">Roomier padding and subtle elevation.</p>
          </AppBox>
        </div>
      </AppCard>

      <div class="grid grid-cols-1 lg:grid-cols-2 br-content-gap">
        <AppCard
          title="Recent activity"
          subtitle="A quick overview of the latest workspace updates."
          icon="i-lucide-activity"
          icon-color="info"
        >
          <div class="br-stack">
            <div class="flex items-center justify-between br-row">
              <div>
                <p class="text-sm font-medium">New team member added</p>
                <p class="mt-1 text-xs br-muted">Alex Morgan joined the workspace</p>
              </div>
              <span class="text-xs br-muted">2m ago</span>
            </div>
            <div class="flex items-center justify-between br-row">
              <div>
                <p class="text-sm font-medium">Monthly report generated</p>
                <p class="mt-1 text-xs br-muted">September performance report is ready</p>
              </div>
              <span class="text-xs br-muted">1h ago</span>
            </div>
          </div>
        </AppCard>
      </div>

      <div class="grid grid-cols-1 xl:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)] br-content-gap">
        <AppCard
          title="Projects"
          subtitle="A searchable list of recent workspace projects."
          icon="i-lucide-folder-kanban"
          icon-color="violet"
        >
          <div class="br-toolbar">
            <InputText
              v-model="search"
              class="br-search w-full"
              placeholder="Search projects..."
              aria-label="Search projects"
            />
            <span class="text-sm br-muted">{{ filteredRecords.length }} results</span>
          </div>

          <div v-if="filteredRecords.length" class="br-list">
            <div
              v-for="record in filteredRecords"
              :key="record.id"
              class="flex flex-wrap items-center justify-between br-row py-4"
            >
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium">{{ record.name }}</p>
                <p class="mt-1 truncate text-xs br-muted">{{ record.owner }} · {{ record.updated }}</p>
              </div>
              <div class="br-row-sm">
                <Tag :value="record.status" :severity="statusSeverity(record.status)" />
                <OverflowActions :items="recordActions" :label="`Actions for ${record.name}`" />
              </div>
            </div>
          </div>
          <div v-else class="br-state">
            <p class="br-state-title">No projects found</p>
            <p class="br-state-description">Try a different search term.</p>
          </div>
        </AppCard>

        <AppCard
          title="Workspace details"
          subtitle="A compact detail grid for read-only information."
          icon="i-lucide-info"
          icon-color="secondary"
        >
          <DetailGrid :columns="2">
            <DetailItem label="Workspace" value="Acme Operations" icon="i-lucide-building-2" icon-color="blue" />
            <DetailItem label="Plan" value="Business" icon="i-lucide-badge-check" icon-color="success" />
            <DetailItem label="Members" value="24" icon="i-lucide-users" icon-color="violet" />
            <DetailItem label="Renewal date" value="October 12, 2026" icon="i-lucide-calendar-days" icon-color="amber" />
          </DetailGrid>
        </AppCard>
      </div>

      <AppCard
        title="Forms and feedback"
        subtitle="Reusable form actions, messages, loading, and empty states."
        icon="i-lucide-panels-top-left"
        icon-color="success"
      >
        <div class="grid grid-cols-1 xl:grid-cols-2 br-content-gap">
          <div class="br-stack-lg">
            <FormSection
              title="Profile settings"
              description="A compact form layout with shared form actions."
              icon="i-lucide-user-round"
              icon-color="blue"
              :columns="1"
            >
              <FormField
                label="Display name"
                icon="i-lucide-badge-check"
                icon-color="success"
                required
                help="This name will be visible to your team."
              >
                <template #default="{ id, describedby }">
                  <InputText
                    :id="id"
                    class="w-full"
                    value="Samar Ashni"
                    :aria-describedby="describedby"
                  />
                </template>
              </FormField>
              <FormActions>
                <Button type="button" label="Cancel" severity="secondary" outlined />
                <Button type="button" label="Save changes" />
              </FormActions>
            </FormSection>

            <FormSection
              title="Block controls"
              description="Bordered controls with supporting text and a right-aligned input."
              icon="i-lucide-sliders-horizontal"
              icon-color="violet"
              :columns="1"
            >
              <BlockToggle
                v-model="notificationsEnabled"
                label="Desktop notifications"
                subtext="Show alerts for workspace activity."
                name="desktop-notifications"
              />
              <BlockCheck
                v-model="weeklyDigestEnabled"
                label="Weekly digest"
                subtext="Receive a summary every Monday morning."
                name="weekly-digest"
                :card-clickable="false"
              />
              <div class="br-stack-sm">
                <p class="text-sm font-medium">Default workspace</p>
                <BlockRadio
                  v-model="defaultWorkspace"
                  value="operations"
                  label="Operations"
                  subtext="Acme Operations workspace"
                  name="default-workspace"
                />
                <BlockRadio
                  v-model="defaultWorkspace"
                  value="marketing"
                  label="Marketing"
                  subtext="Campaigns and brand projects"
                  name="default-workspace"
                />
              </div>
            </FormSection>

            <FormSection
              title="Notification channels"
              description="Use multiple selection when more than one option is allowed."
              icon="i-lucide-list-checks"
              icon-color="amber"
              :columns="1"
            >
              <SelectableList
                v-model="notificationChannels"
                multiple
                name="notification-channels"
                :options="[
                  { title: 'Email', subtitle: 'Send updates to your inbox.', value: 'email', icon: 'i-lucide-mail' },
                  { title: 'In-app', subtitle: 'Show alerts inside the workspace.', value: 'in-app', icon: 'i-lucide-panels-top-left' },
                  { title: 'SMS', subtitle: 'Unavailable for this workspace.', value: 'sms', disabled: true, icon: 'i-lucide-message-square' },
                ]"
              />
            </FormSection>

            <div class="br-rounded-card br-border p-4">
              <p class="text-sm font-medium text-primary">Primary utility classes</p>
              <p class="br-muted mt-1 text-xs">Examples of text-primary, bg-primary, and border-primary.</p>
              <div class="grid grid-cols-1 sm:grid-cols-3 br-content-gap">
                <div class="br-rounded br-border border-primary px-3 py-2 text-center text-xs text-primary">
                  text-primary
                </div>
                <div class="br-rounded bg-primary px-3 py-2 text-center text-xs text-white">
                  bg-primary
                </div>
                <div class="br-rounded br-border border-primary/50 px-3 py-2 text-center text-xs">
                  border-primary
                </div>
              </div>
            </div>
          </div>

          <div class="br-stack">
            <Banner
              color="success"
              title="Profile updated"
              content="Your profile was updated successfully."
              icon="i-lucide-circle-check"
            />
            <Banner color="orange" title="Review workspace settings" closable>
              <template #icon>
                <i class="i-lucide-shield-alert mt-0.5 shrink-0" aria-hidden="true" />
              </template>
              <span>Review your workspace settings before inviting new members.</span>
              <template #actions>
                <BannerButton label="Review" icon="i-lucide-arrow-up-right" />
                <BannerButton label="Later" variant="secondary" />
              </template>
            </Banner>
            <div class="overflow-hidden rounded-lg border border-surface-200 dark:border-surface-700">
              <LoadingBlock label="Loading workspace data..." />
            </div>
            <div class="br-rounded-card br-border p-4">
              <p class="text-sm font-medium">Spinner demos</p>
              <p class="br-muted mt-1 text-xs">Use an overlay for a panel or block the whole page for global work.</p>
              <div class="br-row">
                <Button
                  type="button"
                  label="Show overlay"
                  size="small"
                  outlined
                  @click="showOverlaySpinner"
                />
                <Button
                  type="button"
                  label="Show full screen"
                  size="small"
                  @click="showFullScreenSpinner"
                />
              </div>
              <div class="relative mt-4 min-h-24 overflow-hidden br-rounded br-surface-muted p-4">
                <p class="text-sm font-medium">Workspace panel</p>
                <p class="br-muted mt-1 text-xs">The overlay is positioned relative to this panel.</p>
                <OverlaySpinner v-if="isOverlaySpinnerVisible" label="Refreshing panel..." />
              </div>
            </div>
            <div class="rounded-lg border border-surface-200 dark:border-surface-700">
              <AppState
                icon="i-lucide-inbox"
                title="No notifications"
                description="You are all caught up for now."
                tone="neutral"
              >
                <template #actions>
                  <Button type="button" label="View activity" text size="small" />
                </template>
              </AppState>
            </div>
          </div>
        </div>
      </AppCard>
    </div>
    <FullScreenSpinner v-if="isFullScreenSpinnerVisible" label="Refreshing workspace..." />

    <ResponsiveDialog
      v-model:visible="isResponsiveDialogVisible"
      title="Responsive dialog"
      dismissable-mask
    >
      <p class="text-sm leading-6 br-muted">On medium screens this renders as a modal dialog. On smaller screens it becomes a bottom drawer.</p>
      <template #footer>
        <Button label="Close" severity="secondary" outlined @click="isResponsiveDialogVisible = false" />
      </template>
    </ResponsiveDialog>

    <ConfirmActionDialog
      v-model:visible="isConfirmDialogVisible"
      title="Archive project?"
      message="This sample confirmation demonstrates the shared destructive-action dialog."
      confirm-label="Archive"
      @confirm="isConfirmDialogVisible = false"
    />
    <ConfirmDialog
      v-model:visible="isSimpleConfirmDialogVisible"
      header="Discard draft?"
      :modal="true"
      width="450px"
      content="Your unsaved changes will be lost."
      confirm-button-label="Discard"
      @confirm="isSimpleConfirmDialogVisible = false"
    />
    <MobileBottomNav
      :items="mobileNavItems"
      :active-path="activeMobileNavPath"
      @navigate="selectMobileNavItem"
    />
  </main>
</template>
