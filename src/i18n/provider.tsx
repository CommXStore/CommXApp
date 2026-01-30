'use client'

import { createContext, useContext, useMemo } from 'react'
import type { Locale } from '@/i18n/config'
import type { Messages } from '@/i18n/server'
import { formatMessage, resolveMessage, type TranslationParams } from '@/i18n/utils'

type I18nContextValue = {
  locale: Locale
  messages: Messages
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({
  locale,
  messages,
  children,
}: {
  locale: Locale
  messages: Messages
  children: React.ReactNode
}) {
  const value = useMemo(() => ({ locale, messages }), [locale, messages])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslations() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useTranslations must be used within I18nProvider')
  }
  return (key: string, params?: TranslationParams) => {
    const value = resolveMessage(context.messages as unknown as Record<string, unknown>, key)
    if (!value) {
      return key
    }
    return formatMessage(value, params)
  }
}
