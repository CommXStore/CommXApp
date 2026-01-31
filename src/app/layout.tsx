import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@/providers/clerk-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'
import { I18nProvider } from '@/i18n/provider'
import { getLocale } from '@/i18n/get-locale'
import { getMessages, getTranslations } from '@/i18n/server'
import './globals.css'

export async function generateMetadata() {
  const t = await getTranslations()
  const appName = t('common.app.name')
  return {
    title: {
      default: appName,
      template: `%s | ${appName}`,
    },
    description: t('common.app.description'),
  }
}

const geistSans = localFont({
  variable: '--font-geist-sans',
  display: 'swap',
  preload: false,
  src: [
    { path: '../assets/fonts/geist/geist-100.ttf', weight: '100' },
    { path: '../assets/fonts/geist/geist-200.ttf', weight: '200' },
    { path: '../assets/fonts/geist/geist-300.ttf', weight: '300' },
    { path: '../assets/fonts/geist/geist-400.ttf', weight: '400' },
    { path: '../assets/fonts/geist/geist-500.ttf', weight: '500' },
    { path: '../assets/fonts/geist/geist-600.ttf', weight: '600' },
    { path: '../assets/fonts/geist/geist-700.ttf', weight: '700' },
    { path: '../assets/fonts/geist/geist-800.ttf', weight: '800' },
    { path: '../assets/fonts/geist/geist-900.ttf', weight: '900' },
  ],
})

const jetBrainsMono = localFont({
  variable: '--font-jetbrains-mono',
  display: 'swap',
  preload: false,
  src: [
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-100.ttf',
      weight: '100',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-200.ttf',
      weight: '200',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-300.ttf',
      weight: '300',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-400.ttf',
      weight: '400',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-500.ttf',
      weight: '500',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-600.ttf',
      weight: '600',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-700.ttf',
      weight: '700',
    },
    {
      path: '../assets/fonts/jetbrains-mono/jetbrains-mono-800.ttf',
      weight: '800',
    },
  ],
})

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const locale = await getLocale()
  const messages = await getMessages(locale)

  return (
    <ClerkProvider locale={locale}>
      <html
        className={cn(geistSans.variable, jetBrainsMono.variable)}
        lang={locale}
        suppressHydrationWarning
      >
        <body className="antialiased">
          <I18nProvider locale={locale} messages={messages}>
            <ThemeProvider>
              <Toaster position="top-right" />
              {children}
            </ThemeProvider>
          </I18nProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
