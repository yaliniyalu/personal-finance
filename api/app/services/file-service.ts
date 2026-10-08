import File from '#models/file'
import drive from '@adonisjs/drive/services/main'
import { Storage } from '#config/file-storage'
import UploadService from '#services/file/upload-service'
import type { UploadInput, UploadOptions } from '#services/file/upload-types'
import { DriveDisks } from '@adonisjs/drive/types'
import publicUrlResolver from '#helpers/public-url-resolver'

export default class FileService {
  constructor(
    private readonly tenant: string,
    private readonly user: string | null
  ) {}

  /**
   * Upload a file by delegating to the UploadService
   */
  async upload(input: UploadInput, storage: Storage, options: UploadOptions = {}): Promise<File> {
    return new UploadService(this.tenant, this.user).upload(input, storage, options)
  }

  async getPublicUrlOrNull(key?: string | null, disk?: keyof DriveDisks) {
    if (!key) return null
    return publicUrlResolver(key, disk)
  }

  static async getVariantUrl(file: File, variant: string): Promise<string> {
    const metadata = typeof file.metadata === 'string' ? JSON.parse(file.metadata) : file.metadata
    const variantKey =
      metadata?.variants?.[variant]?.key ??
      (variant === 'thumbnail' && file.mimeType.startsWith('video/')
        ? metadata?.variants?.poster?.key
        : undefined)

    return publicUrlResolver(variantKey || file.key)
  }

  /** Resolve a resized clean image, falling back to the clean normalized original. */
  static async getCleanVariantUrl(file: File, variant: string): Promise<string> {
    const metadata = typeof file.metadata === 'string' ? JSON.parse(file.metadata) : file.metadata
    const cleanVariantKey = metadata?.variants?.[`${variant}Clean`]?.key
    const originalKey = metadata?.variants?.original?.key

    return publicUrlResolver(cleanVariantKey || originalKey || file.key)
  }

  /**
   * Commit a file (remove expiry)
   */
  async commit(idOrKey: string): Promise<File> {
    const file = await File.query()
      .where('tenantId', this.tenant)
      .andWhere((query: any) => {
        query.where('id', idOrKey).orWhere('key', idOrKey)
      })
      .firstOrFail()

    file.expiry = null
    await file.save()
    return file
  }

  /**
   * Get file by ID
   */
  async getById(id: string): Promise<File> {
    return File.query().where('id', id).where('tenantId', this.tenant).firstOrFail()
  }

  /**
   * Get file by URL (key)
   */
  async getByUrl(key: string): Promise<File> {
    return File.query().where('key', key).where('tenantId', this.tenant).firstOrFail()
  }

  /**
   * Delete file by ID
   */
  async deleteById(id: string): Promise<void> {
    const file = await this.getById(id)
    await this.deleteStorageFiles(file)
    await file.delete()
  }

  /**
   * Delete file by URL (key)
   */
  async deleteByUrl(key: string): Promise<void> {
    const file = await this.getByUrl(key)
    await this.deleteStorageFiles(file)
    await file.delete()
  }

  /**
   * Delete storage files including main file and any variants
   */
  private async deleteStorageFiles(file: File): Promise<void> {
    await drive.use().delete(file.key)

    if (file.metadata && typeof file.metadata === 'object' && 'variants' in file.metadata) {
      const variants = file.metadata.variants
      if (variants && typeof variants === 'object') {
        const deletePromises = Object.values(variants)
          .map((v: any) => v?.key)
          .filter((key): key is string => typeof key === 'string')
          .map((key) =>
            drive
              .use()
              .delete(key)
              .catch(() => {})
          )

        await Promise.all(deletePromises)
      }
    }
  }
}
