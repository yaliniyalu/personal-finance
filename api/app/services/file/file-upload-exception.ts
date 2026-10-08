import { Exception } from '@adonisjs/core/exceptions'

export enum FileUploadErrorCode {
  INVALID_MIME = 'INVALID_MIME',
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  FILE_TOO_SMALL = 'FILE_TOO_SMALL',
  INVALID_DIMENSIONS = 'INVALID_DIMENSIONS',
  INVALID_ASPECT_RATIO = 'INVALID_ASPECT_RATIO',
  INVALID_IMAGE = 'INVALID_IMAGE',
  INVALID_VIDEO = 'INVALID_VIDEO',
  INVALID_URL = 'INVALID_URL',
  DOWNLOAD_FAILED = 'DOWNLOAD_FAILED',
  STORAGE_FAILED = 'STORAGE_FAILED',
}

export default class FileUploadException extends Exception {
  static status = 422

  declare code: FileUploadErrorCode

  constructor(
    message: string,
    code: FileUploadErrorCode,
    status: number = 422,
    public details?: Record<string, any>
  ) {
    super(message, { status, code })
    this.code = code
  }

  static invalidMime(received: string, allowed: string[]) {
    return new FileUploadException(
      `File type "${received}" is not allowed`,
      FileUploadErrorCode.INVALID_MIME,
      422,
      {
        received,
        allowed,
      }
    )
  }

  static fileTooLarge(size: number, maxSize: string) {
    return new FileUploadException(
      `File exceeds maximum size of ${maxSize}`,
      FileUploadErrorCode.FILE_TOO_LARGE,
      422,
      {
        size,
        maxSize,
      }
    )
  }

  static fileTooSmall(size: number, minSize: string) {
    return new FileUploadException(
      `File is smaller than minimum size of ${minSize}`,
      FileUploadErrorCode.FILE_TOO_SMALL,
      422,
      {
        size,
        minSize,
      }
    )
  }

  static invalidDimensions(width: number, height: number, constraints: Record<string, any>) {
    return new FileUploadException(
      'Image dimensions are invalid',
      FileUploadErrorCode.INVALID_DIMENSIONS,
      422,
      {
        width,
        height,
        ...constraints,
      }
    )
  }

  static invalidAspectRatio(received: number, expected: string) {
    return new FileUploadException(
      'Image aspect ratio is invalid',
      FileUploadErrorCode.INVALID_ASPECT_RATIO,
      422,
      {
        received,
        expected,
      }
    )
  }

  static invalidImage() {
    return new FileUploadException('File is not a valid image', FileUploadErrorCode.INVALID_IMAGE)
  }

  static invalidVideo(cause?: unknown) {
    return new FileUploadException(
      'File is not a valid or supported video',
      FileUploadErrorCode.INVALID_VIDEO,
      422,
      {
        cause: cause instanceof Error ? cause.message : String(cause ?? ''),
      }
    )
  }

  static invalidUrl(url: string) {
    return new FileUploadException('Invalid upload URL', FileUploadErrorCode.INVALID_URL, 422, {
      url,
    })
  }

  static downloadFailed(url: string) {
    return new FileUploadException(
      'Failed to download file',
      FileUploadErrorCode.DOWNLOAD_FAILED,
      422,
      { url }
    )
  }

  static storageFailed(cause?: unknown) {
    return new FileUploadException(
      'Failed to store file',
      FileUploadErrorCode.STORAGE_FAILED,
      500,
      {
        cause: cause instanceof Error ? cause.message : String(cause),
      }
    )
  }
}
