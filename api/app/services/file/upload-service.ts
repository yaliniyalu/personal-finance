import stream from 'node:stream'
import fs from 'node:fs/promises'
import { randomUUID, createHash } from 'node:crypto'
import os from 'node:os'
import { execFile } from 'node:child_process'
import { extname, join } from 'node:path'
import { promisify } from 'node:util'

import axios from 'axios'
import bytes from 'bytes'
import sharp, { Sharp } from 'sharp'
import { fileTypeFromBuffer } from 'file-type'
import mime from 'mime-types'
import { kebabCase } from 'change-case'

import File from '#models/file'
import drive from '@adonisjs/drive/services/main'
import { getStorageConfig, Storage, type StorageConfig, type WatermarkConfig } from '#config/file-storage'
import type { UploadInput, UploadOptions, NormalizedInput, VideoProbe, FfprobeOutput } from './upload-types.ts'

import FileUploadException from './file-upload-exception.ts'
import RemoteUrlGuardService from '#services/file/remote-url-guard-service'

const execFileAsync = promisify(execFile)

export default class UploadService {
  private readonly remoteUrlGuard = new RemoteUrlGuardService()

  constructor(
    private readonly tenant: string,
    private readonly user: string | null
  ) {}

  async upload(input: UploadInput, storage: Storage, options: UploadOptions = {}): Promise<File> {
    const config = getStorageConfig(storage)
    const source = await this.normalizeInput(input)

    this.validateMime(source.mimeType, config)
    this.validateSize(source.size, config)

    let buffer = source.buffer
    let mimeType = source.mimeType
    let filename = options.filename ?? source.filename

    const metadata: Record<string, any> = {}
    const uploadedKeys: string[] = []

    try {
      if (mimeType.startsWith('image/')) {
        const imageResult = await this.processImage(buffer, mimeType, config, storage, uploadedKeys)

        buffer = imageResult.buffer
        mimeType = imageResult.mimeType

        Object.assign(metadata, imageResult.metadata)
      }

      if (mimeType.startsWith('video/')) {
        const videoResult = await this.processVideo(buffer, mimeType, config, storage, uploadedKeys)

        buffer = videoResult.buffer
        mimeType = videoResult.mimeType

        Object.assign(metadata, videoResult.metadata)
      }

      const ext = mime.extension(mimeType)
      const extension =
        (typeof ext === 'string' ? ext : null) || extname(filename).replace('.', '') || 'bin'

      const key = this.generateKey(storage, extension)

      try {
        await drive.use().put(key, buffer)
        uploadedKeys.push(key)
      } catch (error) {
        throw FileUploadException.storageFailed(error)
      }

      const checksum = createHash('sha256').update(buffer).digest('hex')

      return await File.create({
        tenantId: this.tenant,
        userId: this.user,
        originalName: filename,
        mimeType,
        size: buffer.length,
        key,
        checksum,
        extension,
        metadata: {
          ...metadata,
          ...options.metadata,
        },
        genericType: this.getGenericType(mimeType),
        storage,
        expiry: options.expiry ?? null,
      })
    } catch (error) {
      // Clean up all uploaded keys if anything fails
      await Promise.all(
        uploadedKeys.map((k) =>
          drive
            .use()
            .delete(k)
            .catch(() => {})
        )
      )
      throw error
    }
  }

  private async normalizeInput(input: UploadInput): Promise<NormalizedInput> {
    switch (input.type) {
      case 'buffer': {
        const detected = await fileTypeFromBuffer(input.buffer)

        return {
          buffer: input.buffer,
          filename: input.filename ?? 'upload',
          mimeType: detected?.mime ?? input.mimeType ?? 'application/octet-stream',
          size: input.buffer.length,
        }
      }

      case 'stream': {
        const buffer = await this.streamToBuffer(input.stream)

        const detected = await fileTypeFromBuffer(buffer)

        return {
          buffer,
          filename: input.filename ?? 'upload',
          mimeType: detected?.mime ?? input.mimeType ?? 'application/octet-stream',
          size: buffer.length,
        }
      }

      case 'multipart': {
        if (!input.file.tmpPath) {
          throw new Error('Multipart file has no tmpPath')
        }

        const buffer = await fs.readFile(input.file.tmpPath)

        const detected = await fileTypeFromBuffer(buffer)

        return {
          buffer,
          filename: input.file.clientName,
          mimeType: detected?.mime ?? input.file.type ?? 'application/octet-stream',
          size: buffer.length,
        }
      }

      case 'url': {
        await this.remoteUrlGuard.validate(input.url)

        const response = await axios.get(input.url, {
          responseType: 'arraybuffer',
          maxRedirects: 5,
          timeout: 30000,
          validateStatus: (status: any) => status >= 200 && status < 300,
        })

        const buffer = Buffer.from(response.data)

        const detected = await fileTypeFromBuffer(buffer)

        const contentTypeHeader = response.headers['content-type']
        const headerMime = typeof contentTypeHeader === 'string' ? contentTypeHeader : undefined

        return {
          buffer,
          filename: input.filename ?? this.filenameFromUrl(input.url) ?? 'download',
          mimeType: detected?.mime ?? input.mimeType ?? headerMime ?? 'application/octet-stream',
          size: buffer.length,
        }
      }
    }
  }

  private validateMime(mimeType: string, config: StorageConfig) {
    if (!config.mimes.includes(mimeType)) {
      throw FileUploadException.invalidMime(mimeType, config.mimes)
    }
  }

  private validateSize(size: number, config: StorageConfig) {
    const maxSize = bytes.parse(config.maxSize)
    if (maxSize === null) {
      throw new Error('Invalid maxSize configuration')
    }

    if (size > maxSize) {
      throw FileUploadException.fileTooLarge(size, config.maxSize)
    }

    if (config.minSize) {
      const minSize = bytes.parse(config.minSize)

      if (minSize !== null && size < minSize) {
        throw FileUploadException.fileTooSmall(size, config.minSize)
      }
    }
  }

  private async processImage(
    buffer: Buffer,
    mimeType: string,
    config: StorageConfig,
    storage: Storage,
    uploadedKeys: string[]
  ) {
    const imageConfig = config.opts?.image

    if (!imageConfig) {
      return {
        buffer,
        mimeType,
        metadata: {},
      }
    }

    // Auto-rotate image to normalize orientation and remove source metadata.
    let imagePipeline = sharp(buffer).rotate()

    if (imageConfig.stripMetadata === false) {
      imagePipeline = imagePipeline.withMetadata()
    }

    if (imageConfig.maxOutputWidth || imageConfig.maxOutputHeight) {
      imagePipeline = imagePipeline.resize({
        width: imageConfig.maxOutputWidth,
        height: imageConfig.maxOutputHeight,
        fit: 'inside',
        withoutEnlargement: true,
      })
    }

    let outputBuffer: Buffer<ArrayBufferLike> = await imagePipeline.toBuffer()
    let outputMime = mimeType

    const image = sharp(outputBuffer)
    const meta = await image.metadata()

    const width = meta.width ?? 0
    const height = meta.height ?? 0

    this.validateImageDimensions(width, height, imageConfig)

    const metadata: Record<string, any> = {
      width,
      height,
      format: meta.format,
    }

    if (imageConfig.convertMimeType) {
      const targetMime = imageConfig.convertMimeType.includes('/')
        ? imageConfig.convertMimeType
        : `image/${imageConfig.convertMimeType}`

      outputBuffer = await this.convertImage(sharp(outputBuffer), targetMime, imageConfig.quality)

      outputMime = targetMime
    }

    metadata.mimeType = outputMime
    metadata.format = mime.extension(outputMime) || meta.format
    metadata.size = outputBuffer.length

    const cleanImageBuffer = outputBuffer

    if (this.hasWatermark(imageConfig.watermark)) {
      metadata.variants = {}
      await this.storeVariant(
        storage,
        'original',
        outputBuffer,
        outputMime,
        metadata.variants,
        uploadedKeys,
        { width, height }
      )
      outputBuffer = await this.applyImageWatermark(
        outputBuffer,
        width,
        height,
        imageConfig.watermark!
      )
      metadata.watermark = this.getWatermarkMetadata(imageConfig.watermark!)
      metadata.size = outputBuffer.length
    }

    if (imageConfig.resize?.length) {
      metadata.variants ??= {}

      await Promise.all(
        imageConfig.resize.map(async (variant) => {
          const createVariant = async (sourceBuffer: Buffer, suffix: string) => {
            const variantPipeline = sharp(sourceBuffer).resize({
              width: variant.width,
              height: variant.height,
              fit: variant.fit ?? 'cover',
              position: variant.position,
              withoutEnlargement: true,
            })

          const variantMime = variant.format
            ? this.normalizeImageMimeType(variant.format)
            : outputMime

            const variantBuffer = await this.convertImage(
              variantPipeline,
              variantMime,
              variant.quality ?? imageConfig.quality
            )

            await this.storeVariant(
              storage,
              suffix,
              variantBuffer,
              variantMime,
              metadata.variants,
              uploadedKeys,
              { width: variant.width, height: variant.height }
            )
          }

          await createVariant(
            cleanImageBuffer,
            this.hasWatermark(imageConfig.watermark) ? `${variant.suffix}Clean` : variant.suffix
          )

          if (this.hasWatermark(imageConfig.watermark)) {
            await createVariant(outputBuffer, variant.suffix)
          }
        })
      )
    }

    return {
      buffer: outputBuffer,
      mimeType: outputMime,
      metadata,
    }
  }

  private validateImageDimensions(
    width: number,
    height: number,
    config: NonNullable<StorageConfig['opts']>['image']
  ) {
    if (!config) return

    if (config.minWidth && width < config.minWidth) {
      throw FileUploadException.invalidDimensions(width, height, {
        minWidth: config.minWidth,
      })
    }

    if (config.minHeight && height < config.minHeight) {
      throw FileUploadException.invalidDimensions(width, height, {
        minHeight: config.minHeight,
      })
    }

    if (config.maxWidth && width > config.maxWidth) {
      throw FileUploadException.invalidDimensions(width, height, {
        maxWidth: config.maxWidth,
      })
    }

    if (config.maxHeight && height > config.maxHeight) {
      throw FileUploadException.invalidDimensions(width, height, {
        maxHeight: config.maxHeight,
      })
    }

    if (config.aspectRatio) {
      const [w, h] = config.aspectRatio.split(':').map(Number)

      const expected = w / h
      const actual = width / height

      if (Math.abs(expected - actual) > 0.01) {
        throw FileUploadException.invalidAspectRatio(actual, config.aspectRatio)
      }
    }
  }

  private async processVideo(
    buffer: Buffer,
    mimeType: string,
    config: StorageConfig,
    storage: Storage,
    uploadedKeys: string[]
  ) {
    const videoConfig = config.opts?.video
    if (!videoConfig) return { buffer, mimeType, metadata: {} }

    const directory = await fs.mkdtemp(join(os.tmpdir(), 'real-estate-video-'))
    const inputPath = join(directory, 'source')
    const outputPath = join(directory, 'public.mp4')
    const cleanPath = join(directory, 'original.mp4')

    try {
      await fs.writeFile(inputPath, buffer)
      const probe = await this.probeVideo(inputPath, videoConfig.ffprobePath)
      this.validateVideoProbe(probe, mimeType, videoConfig)
      await this.verifyVideoDecodes(inputPath, videoConfig.ffmpegPath)

      const watermark = videoConfig.watermark
      if (this.hasWatermark(watermark)) {
        await this.transcodeVideo(inputPath, cleanPath, probe, videoConfig)
        await this.transcodeVideo(inputPath, outputPath, probe, videoConfig, watermark)
      } else {
        await this.transcodeVideo(inputPath, outputPath, probe, videoConfig)
      }

      const publicBuffer = await fs.readFile(outputPath)
      const outputProbe = await this.probeVideo(outputPath, videoConfig.ffprobePath)
      const metadata: Record<string, any> = {
        durationSeconds: outputProbe.duration,
        width: outputProbe.width,
        height: outputProbe.height,
        inputContainer: probe.container,
        inputVideoCodec: probe.videoCodec,
        mimeType: 'video/mp4',
        format: 'mp4',
        size: publicBuffer.length,
        variants: {},
      }

      if (this.hasWatermark(watermark)) {
        await this.storeVariant(
          storage,
          'original',
          await fs.readFile(cleanPath),
          'video/mp4',
          metadata.variants,
          uploadedKeys
        )
        metadata.watermark = this.getWatermarkMetadata(watermark!)
      }

      await this.createVideoPosters(
        outputPath,
        probe.duration,
        storage,
        videoConfig,
        metadata.variants,
        uploadedKeys,
        directory
      )

      return { buffer: publicBuffer, mimeType: 'video/mp4', metadata }
    } catch (error) {
      if (error instanceof FileUploadException) throw error
      throw FileUploadException.invalidVideo(error)
    } finally {
      await fs.rm(directory, { recursive: true, force: true })
    }
  }

  private async probeVideo(inputPath: string, ffprobePath = 'ffprobe'): Promise<VideoProbe> {
    try {
      const { stdout } = await execFileAsync(ffprobePath, [
        '-v',
        'error',
        '-show_format',
        '-show_streams',
        '-of',
        'json',
        inputPath,
      ])
      const parsed = JSON.parse(stdout) as FfprobeOutput
      const video = parsed.streams?.find((stream) => stream.codec_type === 'video')
      const duration = Number(parsed.format?.duration ?? video?.duration)
      const width = Number(video?.width)
      const height = Number(video?.height)

      if (!video || !Number.isFinite(duration) || duration <= 0 || !width || !height) {
        throw new Error('Missing a playable video stream')
      }

      return {
        container: parsed.format?.format_name ?? '',
        videoCodec: video.codec_name ?? '',
        duration,
        width,
        height,
      }
    } catch (error) {
      throw FileUploadException.invalidVideo(error)
    }
  }

  private validateVideoProbe(
    probe: VideoProbe,
    mimeType: string,
    config: NonNullable<NonNullable<StorageConfig['opts']>['video']>
  ) {
    const allowedForMime: Record<string, string[]> = {
      'video/mp4': ['mov', 'mp4', 'm4a', '3gp', '3g2', 'mj2'],
      'video/quicktime': ['mov', 'mp4', 'm4a', '3gp', '3g2', 'mj2'],
      'video/webm': ['matroska', 'webm'],
      'video/ogg': ['ogg'],
    }
    const containers = probe.container.split(',')
    const expectedContainers = allowedForMime[mimeType] ?? []

    if (!expectedContainers.some((container) => containers.includes(container))) {
      throw FileUploadException.invalidVideo('MIME type does not match the video container')
    }
    if (
      config.allowedContainers?.length &&
      !config.allowedContainers.some((container) => probe.container.includes(container))
    ) {
      throw FileUploadException.invalidVideo('Video container is not allowed')
    }
    if (
      config.allowedVideoCodecs?.length &&
      !config.allowedVideoCodecs.includes(probe.videoCodec)
    ) {
      throw FileUploadException.invalidVideo(`Video codec ${probe.videoCodec} is not allowed`)
    }
    if (config.maxDurationSeconds && probe.duration > config.maxDurationSeconds) {
      throw FileUploadException.invalidVideo(
        `Video duration exceeds ${config.maxDurationSeconds} seconds`
      )
    }
    if (config.maxInputWidth && probe.width > config.maxInputWidth) {
      throw FileUploadException.invalidVideo(`Video width exceeds ${config.maxInputWidth}px`)
    }
    if (config.maxInputHeight && probe.height > config.maxInputHeight) {
      throw FileUploadException.invalidVideo(`Video height exceeds ${config.maxInputHeight}px`)
    }
  }

  private async verifyVideoDecodes(inputPath: string, ffmpegPath = 'ffmpeg') {
    try {
      await execFileAsync(ffmpegPath, [
        '-v',
        'error',
        '-xerror',
        '-i',
        inputPath,
        '-map',
        '0:v:0',
        '-f',
        'null',
        '-',
      ])
    } catch (error) {
      throw FileUploadException.invalidVideo(error)
    }
  }

  private async transcodeVideo(
    inputPath: string,
    outputPath: string,
    probe: VideoProbe,
    config: NonNullable<NonNullable<StorageConfig['opts']>['video']>,
    watermark?: WatermarkConfig
  ) {
    const maxWidth = config.maxWidth ?? 1920
    const maxHeight = config.maxHeight ?? 1080
    const scale = `scale=w='trunc(min(${maxWidth},iw)/2)*2':h='trunc(min(${maxHeight},ih)/2)*2':force_original_aspect_ratio=decrease`
    const args = ['-y', '-i', inputPath]
    let filter = `[0:v]${scale}[processed]`

    if (this.hasWatermark(watermark)) {
      if (watermark!.imagePath) {
        args.push('-i', watermark!.imagePath)
        const watermarkWidth = Math.max(
          1,
          Math.round(probe.width * ((watermark!.widthPercent ?? 5) / 100))
        )
        const position = this.ffmpegOverlayPosition(watermark!, 0)
        filter = `[0:v]${scale}[base];[1:v]scale=${watermarkWidth}:-1,colorchannelmixer=aa=${watermark!.opacity ?? 0.6}[mark];[base][mark]overlay=${position.x}:${position.y}[processed]`
      } else if (watermark!.text) {
        const position = this.ffmpegOverlayPosition(
          watermark!,
          Math.round(probe.width * ((watermark!.fontSizePercent ?? 3) / 100))
        )
        const escaped = this.escapeFfmpegText(watermark!.text)
        const fontSize = Math.max(
          12,
          Math.round(probe.width * ((watermark!.fontSizePercent ?? 3) / 100))
        )
        const color = `${watermark!.color ?? '#ffffff'}@${watermark!.opacity ?? 0.6}`
        filter = `[0:v]${scale},drawtext=text='${escaped}':fontsize=${fontSize}:fontcolor=${color}:x=${position.x}:y=${position.y}[processed]`
      }
    }

    args.push('-filter_complex', filter, '-map', '[processed]', '-map', '0:a?')

    if (config.stripMetadata !== false) {
      args.push('-map_metadata', '-1', '-map_chapters', '-1')
    }

    args.push(
      '-c:v',
      'libx264',
      '-pix_fmt',
      'yuv420p',
      '-preset',
      config.preset ?? 'medium',
      '-crf',
      String(config.crf ?? 23),
      '-maxrate',
      config.videoBitrate ?? '4M',
      '-bufsize',
      this.doubleBitrate(config.videoBitrate ?? '4M'),
      '-c:a',
      'aac',
      '-b:a',
      config.audioBitrate ?? '128k',
      '-metadata:s:v:0',
      'rotate=0',
      '-movflags',
      '+faststart',
      outputPath
    )

    try {
      await execFileAsync(config.ffmpegPath ?? 'ffmpeg', args, { maxBuffer: 10 * 1024 * 1024 })
    } catch (error) {
      throw FileUploadException.invalidVideo(error)
    }
  }

  private async createVideoPosters(
    videoPath: string,
    duration: number,
    storage: Storage,
    config: NonNullable<NonNullable<StorageConfig['opts']>['video']>,
    variants: Record<string, any>,
    uploadedKeys: string[],
    directory: string
  ) {
    const poster = config.poster ?? {}
    const candidates = Math.min(Math.max(poster.candidates ?? 1, 1), 5)
    for (let index = 0; index < candidates; index++) {
      const suffix = index === 0 ? 'poster' : `poster-${index + 1}`
      const outputPath = join(directory, `${suffix}.webp`)
      const timestamp = Math.max(
        0,
        Math.min(duration - 0.1, (duration * (index + 1)) / (candidates + 1))
      )
      try {
        await execFileAsync(config.ffmpegPath ?? 'ffmpeg', [
          '-y',
          '-ss',
          String(timestamp),
          '-i',
          videoPath,
          '-frames:v',
          '1',
          '-vf',
          `scale=${poster.width ?? 1280}:-2:force_original_aspect_ratio=decrease`,
          '-map_metadata',
          '-1',
          '-c:v',
          'libwebp',
          '-q:v',
          String(poster.quality ?? 82),
          outputPath,
        ])
        const output = await fs.readFile(outputPath)
        await this.storeVariant(storage, suffix, output, 'image/webp', variants, uploadedKeys, {
          timestamp,
        })
      } catch (error) {
        throw FileUploadException.invalidVideo(
          `Could not generate ${suffix}: ${error instanceof Error ? error.message : String(error)}`
        )
      }
    }
  }

  private async applyImageWatermark(
    buffer: Buffer,
    width: number,
    height: number,
    watermark: WatermarkConfig
  ): Promise<Buffer> {
    const mark = await this.createImageWatermark(width, height, watermark, buffer)
    const position = this.watermarkPosition(width, height, mark.width, mark.height, watermark)
    return sharp(buffer)
      .composite([
        {
          input: await this.applyImageOpacity(mark.buffer, watermark.opacity ?? 0.6),
          left: position.left,
          top: position.top,
        },
      ])
      .toBuffer()
  }

  private async applyImageOpacity(buffer: Buffer, opacity: number): Promise<Buffer> {
    const image = sharp(buffer).ensureAlpha()
    const { data, info } = await image.raw().toBuffer({ resolveWithObject: true })
    const boundedOpacity = Math.min(Math.max(opacity, 0), 1)
    for (let index = 3; index < data.length; index += info.channels) {
      data[index] = Math.round(data[index] * boundedOpacity)
    }
    return sharp(data, { raw: info }).png().toBuffer()
  }

  private async createImageWatermark(
    width: number,
    height: number,
    watermark: WatermarkConfig,
    sourceBuffer?: Buffer
  ) {
    const imagePath = await this.selectWatermarkImagePath(watermark, sourceBuffer, width, height)
    if (imagePath) {
      const imageWidth = Math.max(1, Math.round(width * ((watermark.widthPercent ?? 5) / 100)))
      const buffer = await sharp(imagePath)
        .resize({ width: imageWidth, withoutEnlargement: true })
        .png()
        .toBuffer()
      const meta = await sharp(buffer).metadata()
      return { buffer, width: meta.width ?? imageWidth, height: meta.height ?? imageWidth }
    }

    const fontSize = Math.max(12, Math.round(width * ((watermark.fontSizePercent ?? 3) / 100)))
    const text = this.escapeXml(watermark.text ?? '')
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${Math.max(fontSize, text.length * fontSize)}" height="${Math.ceil(fontSize * 1.4)}"><text x="0" y="${fontSize}" font-family="Arial, sans-serif" font-size="${fontSize}" fill="${watermark.color ?? '#ffffff'}">${text}</text></svg>`
    const buffer = await sharp(Buffer.from(svg)).png().toBuffer()
    const meta = await sharp(buffer).metadata()
    return { buffer, width: meta.width ?? fontSize, height: meta.height ?? fontSize }
  }

  private async selectWatermarkImagePath(
    watermark: WatermarkConfig,
    sourceBuffer: Buffer | undefined,
    width: number,
    height: number
  ) {
    if (
      watermark.adaptiveContrast &&
      sourceBuffer &&
      (watermark.imagePathLight || watermark.imagePathDark)
    ) {
      const sampleWidth = Math.min(
        width,
        Math.max(
          Math.round(width * 0.3),
          Math.round(width * ((watermark.widthPercent ?? 5) / 100) * 2)
        )
      )
      const sampleHeight = Math.min(height, Math.max(Math.round(height * 0.25), 1))
      const samplePosition = this.watermarkSamplePosition(
        width,
        height,
        sampleWidth,
        sampleHeight,
        watermark
      )
      const stats = await sharp(sourceBuffer)
        .extract({ ...samplePosition, width: sampleWidth, height: sampleHeight })
        .stats()
      const channels = stats.channels.slice(0, 3)
      const luminance =
        channels.length === 1
          ? channels[0].mean
          : channels[0].mean * 0.2126 +
            channels[1].mean * 0.7152 +
            channels[2].mean * 0.0722
      return luminance < 128
        ? watermark.imagePathLight ?? watermark.imagePathDark
        : watermark.imagePathDark ?? watermark.imagePathLight
    }

    return watermark.imagePath ?? watermark.imagePathLight ?? watermark.imagePathDark
  }

  private watermarkSamplePosition(
    width: number,
    height: number,
    sampleWidth: number,
    sampleHeight: number,
    watermark: WatermarkConfig
  ) {
    const margin = watermark.margin ?? 24
    const right = Math.max(0, width - sampleWidth - margin)
    const bottom = Math.max(0, height - sampleHeight - margin)

    switch (watermark.position ?? 'bottom-right') {
      case 'top-left':
        return {
          left: Math.min(margin, width - sampleWidth),
          top: Math.min(margin, height - sampleHeight),
        }
      case 'top-right':
        return { left: right, top: Math.min(margin, height - sampleHeight) }
      case 'bottom-left':
        return { left: Math.min(margin, width - sampleWidth), top: bottom }
      default:
        return { left: right, top: bottom }
    }
  }

  private watermarkPosition(
    width: number,
    height: number,
    watermarkWidth: number,
    watermarkHeight: number,
    watermark: WatermarkConfig
  ) {
    const margin = watermark.margin ?? 24
    const right = Math.max(0, width - watermarkWidth - margin)
    const bottom = Math.max(0, height - watermarkHeight - margin)
    switch (watermark.position ?? 'bottom-right') {
      case 'top-left':
        return { left: margin, top: margin }
      case 'top-right':
        return { left: right, top: margin }
      case 'bottom-left':
        return { left: margin, top: bottom }
      default:
        return { left: right, top: bottom }
    }
  }

  private ffmpegOverlayPosition(watermark: WatermarkConfig, textHeight: number) {
    const margin = watermark.margin ?? 24
    const isText = textHeight > 0
    const right = isText ? `w-text_w-${margin}` : `main_w-overlay_w-${margin}`
    const bottom = isText ? `h-text_h-${margin}` : `main_h-overlay_h-${margin}`
    switch (watermark.position ?? 'bottom-right') {
      case 'top-left':
        return { x: String(margin), y: String(margin) }
      case 'top-right':
        return { x: right, y: String(margin) }
      case 'bottom-left':
        return { x: String(margin), y: bottom }
      default:
        return { x: right, y: bottom }
    }
  }

  private async storeVariant(
    storage: Storage,
    suffix: string,
    buffer: Buffer,
    mimeType: string,
    variants: Record<string, any>,
    uploadedKeys: string[],
    extra: Record<string, any> = {}
  ) {
    const extension = mime.extension(mimeType) || 'bin'
    const key = this.generateVariantKey(storage, suffix, extension)
    await drive.use().put(key, buffer)
    uploadedKeys.push(key)
    variants[suffix] = { key, mimeType, format: extension, size: buffer.length, ...extra }
  }

  private hasWatermark(watermark?: WatermarkConfig): watermark is WatermarkConfig {
    return Boolean(
      watermark?.text ||
        watermark?.imagePath ||
        watermark?.imagePathLight ||
        watermark?.imagePathDark
    )
  }

  private getWatermarkMetadata(watermark: WatermarkConfig) {
    const { imagePath, imagePathLight, imagePathDark, ...publicSettings } = watermark
    return {
      ...publicSettings,
      type: imagePath || imagePathLight || imagePathDark ? 'image' : 'text',
    }
  }

  private doubleBitrate(bitrate: string) {
    const match = /^(\d+(?:\.\d+)?)([kKmM])$/.exec(bitrate)
    return match ? `${Number(match[1]) * 2}${match[2]}` : bitrate
  }

  private escapeFfmpegText(value: string) {
    return value.replace(/\\/g, '\\\\').replace(/:/g, '\\:').replace(/'/g, "\\\\'")
  }

  private escapeXml(value: string) {
    return value.replace(
      /[<>&'\"]/g,
      (character) =>
        ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[character]!
    )
  }

  private async convertImage(image: Sharp, mimeType: string, quality?: number): Promise<Buffer> {
    switch (mimeType) {
      case 'image/webp':
        return image.webp(quality ? { quality } : undefined).toBuffer()

      case 'image/png':
        return image.png().toBuffer()

      case 'image/jpeg':
        return image.jpeg(quality ? { quality } : undefined).toBuffer()

      case 'image/avif':
        return image.avif(quality ? { quality } : undefined).toBuffer()

      default:
        return image.toBuffer()
    }
  }

  private normalizeImageMimeType(format: string): string {
    return format.includes('/') ? format : `image/${format}`
  }

  private generateKey(storage: Storage, extension: string) {
    return ['uploads', this.tenant, kebabCase(storage), `${randomUUID()}.${extension}`].join('/')
  }

  private generateVariantKey(storage: Storage, suffix: string, extension: string) {
    return [
      'uploads',
      this.tenant,
      kebabCase(storage),
      `${randomUUID()}-${suffix}.${extension}`,
    ].join('/')
  }

  private getGenericType(mimeType: string): string {
    if (mimeType.startsWith('image/')) return 'image'

    if (mimeType.startsWith('video/')) return 'video'

    if (mimeType.startsWith('audio/')) return 'audio'

    if (mimeType === 'application/pdf' || mimeType.includes('document')) {
      return 'document'
    }

    if (mimeType.includes('zip') || mimeType.includes('archive')) {
      return 'archive'
    }

    return 'other'
  }

  private async streamToBuffer(readable: stream.Readable): Promise<Buffer> {
    const chunks: Buffer[] = []

    for await (const chunk of readable) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
    }

    return Buffer.concat(chunks)
  }

  private filenameFromUrl(url: string): string | undefined {
    try {
      const pathname = new URL(url).pathname
      const filename = pathname.split('/').pop()

      return filename || undefined
    } catch {
      return undefined
    }
  }
}
