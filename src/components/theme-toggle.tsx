'use client'

import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import { useTranslations } from '@/i18n/provider'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const t = useTranslations()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const isDark = mounted && resolvedTheme === 'dark'

  return (
    <Button
      aria-label={
        isDark ? t('common.theme.toggleLight') : t('common.theme.toggleDark')
      }
      className="relative"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      size="icon"
      type="button"
      variant="ghost"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  )
}
