export function getAvatar(name: string) {
  return `https://ui-avatars.com/api/?name=${name}&background=random`
}

type DotObject = { [key: string]: unknown }

export function dotToObj(obj: DotObject, path: string | string[], value: unknown): DotObject {
  const segments = typeof path === 'string' ? path.split('.') : path

  if (segments.length === 0) {
    return obj
  }

  const [key, ...remaining] = segments
  if (key === undefined) {
    return obj
  }

  if (remaining.length === 0) {
    if (value !== undefined) {
      obj[key] = value
    }
    return obj
  }

  const child = obj[key]
  if (typeof child !== 'object' || child === null || Array.isArray(child)) {
    obj[key] = {}
  }

  return dotToObj(obj[key] as DotObject, remaining, value)
}

export function downloadFile(url: string, name?: string) {
  const link = document.createElement('a')
  link.href = url
  link.download = name ?? url.split('/').pop() ?? ''
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}
