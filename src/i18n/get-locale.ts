import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from './config'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const headerStore = await headers()
  const cookieLocale = cookieStore.get(localeCookieName)?.value
  if (isLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = headerStore.get('accept-language')
  if (acceptLanguage) {
    const languages = acceptLanguage
      .split(',')
      .map(value => value.split(';')[0]?.trim())
    for (const language of languages) {
      if (isLocale(language)) {
        return language
      }
    }
  }

  return defaultLocale
}
