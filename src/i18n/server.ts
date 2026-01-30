import { cache } from 'react'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import { defaultLocale, isLocale, type Locale } from './config'
import { formatMessage, resolveMessage, type TranslationParams } from './utils'
import { getLocale } from './get-locale'

type RouteMessages = Record<string, Record<string, unknown>>

type Messages = {
  common: Record<string, unknown>
  routes: RouteMessages
}

async function readJson(
  filePath: string
): Promise<Record<string, unknown> | null> {
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return JSON.parse(content) as Record<string, unknown>
  } catch {
    return null
  }
}

async function loadRouteMessages(locale: Locale): Promise<RouteMessages> {
  const baseDir = process.cwd()
  const defaultRoutesDir = path.join(
    baseDir,
    'languages',
    defaultLocale,
    'routes'
  )
  const localeRoutesDir = path.join(baseDir, 'languages', locale, 'routes')
  const files = await fs.readdir(defaultRoutesDir)

  const entries = await Promise.all(
    files
      .filter(file => file.endsWith('.json'))
      .map(async file => {
        const key = path.basename(file, '.json')
        const localized = await readJson(path.join(localeRoutesDir, file))
        const fallback = await readJson(path.join(defaultRoutesDir, file))
        return [key, localized ?? fallback ?? {}] as const
      })
  )

  return Object.fromEntries(entries)
}

export const getMessages = cache(async (locale?: Locale): Promise<Messages> => {
  const resolvedLocale = isLocale(locale) ? locale : defaultLocale
  const baseDir = process.cwd()
  const localeCommonPath = path.join(
    baseDir,
    'languages',
    resolvedLocale,
    'common.json'
  )
  const fallbackCommonPath = path.join(
    baseDir,
    'languages',
    defaultLocale,
    'common.json'
  )

  const [common, routes] = await Promise.all([
    readJson(localeCommonPath),
    loadRouteMessages(resolvedLocale),
  ])

  const fallbackCommon = common ? null : await readJson(fallbackCommonPath)

  return {
    common: common ?? fallbackCommon ?? {},
    routes,
  }
})

export async function getTranslations(locale?: Locale) {
  const resolvedLocale = locale ?? getLocale()
  const messages = await getMessages(resolvedLocale)

  return (key: string, params?: TranslationParams) => {
    const value = resolveMessage(messages as Record<string, unknown>, key)
    if (!value) {
      return key
    }
    return formatMessage(value, params)
  }
}

export type { Messages }
