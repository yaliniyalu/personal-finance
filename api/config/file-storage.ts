export type StorageConfig = {
  mimes: string[]
  minSize?: string
  maxSize: string
  opts?: {
    image?: {
      maxWidth?: number
      maxHeight?: number
      minWidth?: number
      minHeight?: number
      aspectRatio?: string
      convertMimeType?: string
      quality?: number
      maxOutputWidth?: number
      maxOutputHeight?: number
      stripMetadata?: boolean
      resize?: {
        suffix: string
        width: number
        height: number
        fit?: 'cover' | 'contain' | 'inside' | 'fill'
        position?: string
        format?: string
        quality?: number
      }[]
      watermark?: WatermarkConfig
    }
    video?: {
      /** Binaries may be absolute paths when they are not on PATH. */
      ffmpegPath?: string
      ffprobePath?: string
      maxDurationSeconds?: number
      maxWidth?: number
      maxHeight?: number
      maxInputWidth?: number
      maxInputHeight?: number
      allowedContainers?: string[]
      allowedVideoCodecs?: string[]
      videoBitrate?: string
      audioBitrate?: string
      crf?: number
      preset?: string
      stripMetadata?: boolean
      watermark?: WatermarkConfig
      poster?: {
        width?: number
        quality?: number
        candidates?: number
      }
    }
  }
}

export type WatermarkType = 'text' | 'image'

export type WatermarkPosition = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'auto'

export type WatermarkContrastMode = 'none' | 'asset-switch' | 'shadow' | 'background'

export type WatermarkCorner = 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'

export interface WatermarkConfig {
  /**
   * Watermark content type.
   */
  type: WatermarkType

  /**
   * Fixed corner or automatically selected best corner.
   *
   * @default 'bottom-right'
   */
  position?: WatermarkPosition

  /**
   * Opacity from 0 to 1.
   *
   * @default 0.65
   */
  opacity?: number

  /**
   * Margin relative to output image dimensions.
   *
   * Example: 2 = 2%
   */
  marginPercent?: number

  /**
   * Optional fixed pixel margin.
   *
   * Can be kept for backwards compatibility.
   */
  margin?: number

  /**
   * Corners that automatic positioning should never use.
   */
  avoidPositions?: WatermarkCorner[]

  /**
   * Automatically evaluate candidate corners and choose
   * the clearest / least visually busy area.
   *
   * Typically enabled when position === 'auto'.
   */
  intelligentPositioning?: boolean

  /**
   * Automatically improve watermark contrast against
   * the underlying image.
   */
  adaptiveContrast?: boolean

  /**
   * How contrast should be improved when needed.
   *
   * @default 'asset-switch'
   */
  contrastMode?: WatermarkContrastMode

  // ---------------------------------------------------------------------------
  // Image watermark
  // ---------------------------------------------------------------------------

  /**
   * Default image watermark.
   */
  imagePath?: string

  /**
   * Light watermark, normally white.
   * Used over dark backgrounds.
   */
  imagePathLight?: string

  /**
   * Dark watermark, normally black/navy.
   * Used over light backgrounds.
   */
  imagePathDark?: string

  /**
   * Watermark width as percentage of output image width.
   *
   * Example: 14 = 14%
   */
  widthPercent?: number

  /**
   * Minimum rendered watermark width in pixels.
   */
  minWidth?: number

  /**
   * Maximum rendered watermark width in pixels.
   */
  maxWidth?: number

  // ---------------------------------------------------------------------------
  // Text watermark
  // ---------------------------------------------------------------------------

  /**
   * Text used when type === 'text'.
   */
  text?: string

  /**
   * Text size relative to output image dimensions.
   */
  fontSizePercent?: number

  /**
   * Static text color when adaptive contrast is disabled.
   */
  color?: string

  /**
   * Light text color for dark backgrounds.
   *
   * @default '#ffffff'
   */
  lightColor?: string

  /**
   * Dark text color for light backgrounds.
   *
   * @default '#0f172a'
   */
  darkColor?: string

  // ---------------------------------------------------------------------------
  // Contrast helpers
  // ---------------------------------------------------------------------------

  /**
   * Optional shadow behind the watermark.
   */
  shadow?: {
    enabled?: boolean
    opacity?: number
    blur?: number
    offsetX?: number
    offsetY?: number
  }

  /**
   * Optional translucent background behind watermark.
   */
  background?: {
    enabled?: boolean
    color?: string
    opacity?: number
    paddingPercent?: number
    borderRadius?: number
  }
}

export enum Storage {
  ProfilePicture = 'ProfilePicture',
  RfqAttachment = 'RfqAttachment',
  CategoryMaster = 'CategoryMaster',
  ItemMaster = 'ItemMaster',
  BrandMaster = 'BrandMaster',
  GoodsReceiptAttachment = 'GoodsReceiptAttachment',
  Uploads = 'Uploads',
  PropertyMedia = 'PropertyMedia',
}

const standardImageMimes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']

const standardDocumentMimes = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
  'text/plain',
]

const standardAttachmentMimes = [...standardImageMimes, ...standardDocumentMimes]

const storageConfigs: Record<string, StorageConfig> = {
  profile: {
    mimes: standardImageMimes,
    minSize: '1kb',
    maxSize: '5mb',
    opts: {
      image: {
        aspectRatio: '1:1',
        convertMimeType: 'webp',
        resize: [
          {
            suffix: '28x28',
            width: 28,
            height: 28,
          },
          {
            suffix: '100x100',
            width: 100,
            height: 100,
          },
          {
            suffix: '256x256',
            width: 256,
            height: 256,
          },
          {
            suffix: '512x512',
            width: 512,
            height: 512,
          },
        ],
      },
    },
  },
  Uploads: {
    maxSize: '50mb',
    mimes: standardAttachmentMimes,
  },
  default: {
    maxSize: '10mb',
    mimes: standardAttachmentMimes,
  },
}

export function getStorageConfig(storage: Storage): StorageConfig {
  return storageConfigs[storage] || storageConfigs['default']
}

export default storageConfigs
