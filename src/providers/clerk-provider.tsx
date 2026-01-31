import { ClerkProvider as ClerkNextJSProvider } from '@clerk/nextjs'
import type { LocalizationResource } from '@clerk/types'
import { enUS, esES, ptBR } from '@clerk/localizations'
import { shadcn } from '@clerk/themes'
import { defaultLocale, type Locale } from '@/i18n/config'

type ClerkProviderProps = React.ComponentProps<typeof ClerkNextJSProvider>

const clerkLocalizations: Record<Locale, LocalizationResource> = {
  'pt-BR': ptBR,
  'en-US': enUS,
  'es-ES': esES,
}

export function ClerkProvider({
  children,
  appearance = {},
  localization,
  locale = defaultLocale,
  ...props
}: ClerkProviderProps & { locale?: Locale }) {
  const resolvedLocalization = localization ?? clerkLocalizations[locale]
  return (
    <ClerkNextJSProvider
      {...props}
      appearance={{
        theme: shadcn,
        ...appearance,
        layout: {
          ...appearance.layout,
          helpPageUrl: 'https://clerk.com/docs',
          privacyPageUrl: 'https://clerk.com/legal/privacy',
          termsPageUrl: 'https://clerk.com/legal/terms',
          logoImageUrl: '/clerk-light.png',
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      localization={resolvedLocalization}
      supportEmail="support@clerk.dev"
    >
      {children}
    </ClerkNextJSProvider>
  )
}
