import Env from '#start/env'

export function cdn(path: string) {
  let sp = Env.get('API_HOST')

  if (path.startsWith('cdn://')) {
    path = path.replace('cdn://', '')
    return `${sp}/${path}`
  } else if (path.startsWith('http://') || path.startsWith('https://')) {
    return path
  } else {
    return `${sp}/${path}`
  }
}

export function tenantUrl(tenant: string) {
  if (Env.get('NODE_ENV') === 'development' && Env.get('API_LOCAL_TUNNEL')) {
    return `${Env.get('API_LOCAL_TUNNEL')}`
  }
  return Env.get('APP_DOMAIN').replace('*', tenant)
}
