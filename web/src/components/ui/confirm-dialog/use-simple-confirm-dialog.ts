import type { DynamicDialogInstance } from 'primevue/dynamicdialogoptions'
import SimpleConfirmDialog from './SimpleConfirmDialog.vue'
import { useDialog } from 'primevue/usedialog'

export default function useSimpleConfirmDialog() {
  const dialog = useDialog()

  function confirmInternal(data: ConfirmDialogData, safe = false) {
    if (typeof data.closeOnCancel !== 'boolean') {
      data.closeOnCancel = true
    }

    if (typeof data.closeOnConfirm !== 'boolean') {
      data.closeOnConfirm = true
    }

    return new Promise<ConfirmResult>((resolve, reject) => {
      let closed = false
      const inst = openInternal({
        ...data,
        onConfirm: () => {
          closed = true
          data.onConfirm?.()

          if (data.closeOnConfirm) {
            inst.close()
          }

          resolve({ status: 'confirmed', instance: inst, confirmed: true })
        },
        onCancel: () => {
          closed = true
          data.onCancel?.()

          if (data.closeOnCancel) {
            inst.close()
          }

          if (safe) {
            resolve({ status: 'cancelled', instance: inst, confirmed: false })
          } else {
            reject(new Error('User cancelled the action'))
          }
        },
        onClose: () => {
          if (closed) {
            return
          }

          data.onClose?.()

          if (safe) {
            resolve({ status: 'closed', instance: inst, confirmed: false })
          } else {
            reject(new Error('Dialog closed without confirmation'))
          }
        },
      })
    })
  }

  function openInternal(data: ConfirmDialogData) {
    return dialog.open(SimpleConfirmDialog, {
      props: {
        header: data.header,
        style: { width: '500px', maxWidth: '90vw' },
      },
      data: {
        ...data,
        onConfirm: () => {
          data.onConfirm?.()
        },
        onCancel: () => {
          data.onCancel?.()
        },
      },
      onClose: () => {
        data.onClose?.()
      },
    })
  }

  function confirm(data: ConfirmDialogData) {
    return confirmInternal(data, false)
  }

  function safeConfirm(data: ConfirmDialogData) {
    return confirmInternal(data, true)
  }

  function open(data: ConfirmDialogData) {
    return openInternal(data)
  }

  return {
    confirm,
    safeConfirm,
    open,
  }
}

export interface ConfirmDialogData {
  header: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  cancelProps?: Record<string, any>
  confirmProps?: Record<string, any>
  confirmSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'primary'
  cancelSeverity?: 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'primary'
  closeOnCancel?: boolean
  closeOnConfirm?: boolean

  onConfirm?: () => void
  onCancel?: () => void
  onClose?: () => void
}

type ConfirmResult =
  | { status: 'confirmed'; instance: DynamicDialogInstance; confirmed: boolean }
  | { status: 'cancelled'; instance: DynamicDialogInstance; confirmed: boolean }
  | { status: 'closed'; instance: DynamicDialogInstance; confirmed: boolean }
