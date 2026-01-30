export const locales = ['pt-BR', 'en-US'] as const

export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'pt-BR'

export const localeCookieName = 'commx-locale'

export function isLocale(value: string | undefined | null): value is Locale {
  if (!value) {
    return false
  }
  return (locales as readonly string[]).includes(value)
}
