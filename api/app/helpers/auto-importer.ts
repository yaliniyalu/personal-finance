import { readdirSync, statSync } from 'node:fs'
import { join } from 'pathe'

export function getAllFiles(
  directory: string,
  options?: {
    excludePatterns?: RegExp[]
    includePatterns?: RegExp[]
    subdirectory?: boolean
  }
): string[] {
  const files = readdirSync(directory)
  const result: string[] = []

  const subdirectory = options?.subdirectory ?? true

  for (const file of files) {
    const fullPath = join(directory, file)
    const stat = statSync(fullPath)

    if (stat.isDirectory()) {
      if (subdirectory) {
        result.push(...getAllFiles(fullPath, options))
      }
    } else {
      const isTsOrJs = /\.(ts|js)$/.test(file)
      if (!isTsOrJs) {
        continue
      }

      if (options?.excludePatterns) {
        if (options.excludePatterns.some((pattern) => pattern.test(file))) {
          continue // skip if file matches any exclude pattern
        }
      }

      if (options?.includePatterns) {
        if (!options.includePatterns.some((pattern) => pattern.test(file))) {
          continue // skip if file does not match any include pattern
        }
      }

      result.push(fullPath)
    }
  }

  return result
}

export default async function importModule(folder: Folder) {
  const modules = []
  const directory = join(import.meta.dirname, './../../', folder.path)
  const files = getAllFiles(directory, {
    excludePatterns: folder.excludePatterns,
    includePatterns: folder.includePatterns,
    subdirectory: folder.subdirectory,
  })

  for (const file of files) {
    try {
      const m = await import('file://' + file)
      modules.push({
        file: file,
        module: m,
      })
    } catch (e) {
      console.error('Error loading', file, e)
    }
  }

  return modules
}

interface Folder {
  path: string
  excludePatterns?: RegExp[]
  includePatterns?: RegExp[]
  subdirectory?: boolean
}
