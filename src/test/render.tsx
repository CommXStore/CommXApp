import type { ReactElement } from 'react'
import type { RenderOptions } from '@testing-library/react'
import { render } from '@testing-library/react'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { I18nProvider } from '@/i18n/provider'
import type { Messages } from '@/i18n/server'
import type { Locale } from '@/i18n/config'

const messagesCache = new Map<Locale, Messages>()

function loadMessages(locale: Locale = 'pt-BR'): Messages {
  const cached = messagesCache.get(locale)
  if (cached) {
    return cached
  }

  const baseDir = path.join(process.cwd(), 'languages', locale)
  const common = JSON.parse(
    readFileSync(path.join(baseDir, 'common.json'), 'utf-8')
  ) as Record<string, unknown>
  const routesDir = path.join(baseDir, 'routes')
  const routes = Object.fromEntries(
    readdirSync(routesDir)
      .filter(file => file.endsWith('.json'))
      .map(file => {
        const key = path.basename(file, '.json')
        const value = JSON.parse(
          readFileSync(path.join(routesDir, file), 'utf-8')
        ) as Record<string, unknown>
        return [key, value]
      })
  ) as Record<string, Record<string, unknown>>

  const messages: Messages = { common, routes }
  messagesCache.set(locale, messages)
  return messages
}

export function renderWithI18n(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'> & { locale?: Locale }
) {
  const { locale = 'pt-BR', ...renderOptions } = options ?? {}
  const messages = loadMessages(locale)
  return render(
    <I18nProvider locale={locale} messages={messages}>
      {ui}
    </I18nProvider>,
    renderOptions
  )
}
