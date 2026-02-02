'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { localeCookieName, locales, type Locale } from '@/i18n/config'
import { useLocale, useTranslations } from '@/i18n/provider'

const LOCALE_LABELS: Record<Locale, string> = {
  'pt-BR': 'common.language.options.ptBR',
  'en-US': 'common.language.options.enUS',
  'es-ES': 'common.language.options.esES',
}

export function LanguageSwitcher() {
  const router = useRouter()
  const t = useTranslations()
  const locale = useLocale()

  const handleChange = useCallback(
    async (nextLocale: string) => {
      if (!locales.includes(nextLocale as Locale)) {
        return
      }
      if ('cookieStore' in window) {
        await window.cookieStore.set({
          name: localeCookieName,
          value: nextLocale,
          path: '/',
          expires: Date.now() + 31_536_000 * 1000,
        })
      } else {
        // biome-ignore lint/suspicious/noDocumentCookie: fallback for browsers without Cookie Store API.
        document.cookie = `${localeCookieName}=${nextLocale}; path=/; max-age=31536000`
      }
      router.refresh()
    },
    [router]
  )

  return (
    <Select onValueChange={handleChange} value={locale}>
      <SelectTrigger aria-label={t('common.language.label')} className="w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {locales.map(option => (
          <SelectItem key={option} value={option}>
            {t(LOCALE_LABELS[option])}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
