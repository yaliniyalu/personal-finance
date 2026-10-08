import type stream from 'node:stream'
import type { DateTime } from 'luxon'
import type { MultipartFile } from '@adonisjs/core/bodyparser'

export interface UploadOptions {
  expiry?: DateTime | null
  metadata?: Record<string, any>
  filename?: string
}

export interface NormalizedInput {
  buffer: Buffer
  filename: string
  mimeType: string
  size: number
}

export interface VideoProbe {
  container: string
  videoCodec: string
  duration: number
  width: number
  height: number
}

export interface FfprobeOutput {
  format?: { duration?: string; format_name?: string }
  streams?: Array<{
    codec_type?: string
    codec_name?: string
    width?: number
    height?: number
    duration?: string
  }>
}

export type MultipartInput = {
  type: 'multipart'
  file: MultipartFile
}

export type URLInput = {
  type: 'url'
  url: string
  filename?: string
  mimeType?: string
}

export type BufferInput = {
  type: 'buffer'
  buffer: Buffer
  filename?: string
  mimeType?: string
}

export type StreamInput = {
  type: 'stream'
  stream: stream.Readable
  filename?: string
  mimeType?: string
}

export type UploadInput = MultipartInput | URLInput | BufferInput | StreamInput
