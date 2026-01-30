'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { useTranslations } from '@/i18n/provider'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  const t = useTranslations()

  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-semibold text-2xl">{t('routes.error.title')}</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        {t('routes.error.description')}
      </p>
      <Button onClick={() => reset()} type="button">
        {t('routes.error.retry')}
      </Button>
    </div>
  )
}
