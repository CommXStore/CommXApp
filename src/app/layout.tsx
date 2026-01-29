import type { Metadata } from 'next'
import localFont from 'next/font/local'
import { Toaster } from '@/components/ui/sonner'
import { ClerkProvider } from '@/providers/clerk-provider'
import { ThemeProvider } from '@/providers/theme-provider'
import { cn } from '@/lib/utils'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Clerk API Keys Quickstart',
    template: '%s | Clerk API Keys Quickstart',
  },
  description: 'A quickstart for using Clerk API Keys',
}

const geistSans = localFont({
  variable: '--font-geist-sans',
  display: 'swap',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <ClerkProvider>
      <html
        className={cn(geistSans.variable, jetBrainsMono.variable)}
        lang="en"
        suppressHydrationWarning
      >
        <body className="antialiased">
          <ThemeProvider>
            <Toaster position="top-right" />
            {children}
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  )
}
