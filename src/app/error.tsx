'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <h1 className="font-semibold text-2xl">Algo deu errado</h1>
      <p className="max-w-md text-muted-foreground text-sm">
        Ocorreu um erro inesperado. Tente novamente ou volte mais tarde.
      </p>
      <Button onClick={() => reset()} type="button">
        Tentar novamente
      </Button>
    </div>
  )
}
