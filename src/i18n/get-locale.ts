import { cookies, headers } from 'next/headers'
import {
  defaultLocale,
  isLocale,
  localeCookieName,
  type Locale,
} from './config'

export function getLocale(): Locale {
  const cookieLocale = cookies().get(localeCookieName)?.value
  if (isLocale(cookieLocale)) {
    return cookieLocale
  }

  const acceptLanguage = headers().get('accept-language')
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
