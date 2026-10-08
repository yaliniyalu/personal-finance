import { DriveDisks } from '@adonisjs/drive/types'
import Env from '#start/env'
import drive from '@adonisjs/drive/services/main'

export async function resolvePublicUrl(key: string, disk?: keyof DriveDisks) {
  if (key.startsWith('http://') || key.startsWith('https://') || key.startsWith('//')) {
    return key
  }

  const appUrl = Env.get('APP_URL').replace(/\/+$/, '')

  if (key.startsWith('/')) {
    return appUrl + key
  }

  const path = await drive.use(disk).getUrl(key)

  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path
  }

  const pathClean = path.startsWith('/') ? path : '/' + path
  return appUrl + pathClean
}

export default resolvePublicUrl
