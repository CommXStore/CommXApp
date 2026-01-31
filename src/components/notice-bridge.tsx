'use client'

import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n/provider'

export function NoticeBridge() {
  const t = useTranslations()
  const searchParams = useSearchParams()

  useEffect(() => {
    const orgName = searchParams.get('orgNoticeName')
    if (!orgName) {
      return
    }
    toast.info(t('common.organization.autoSwitch', { org: orgName }))
    const next = new URL(window.location.href)
    next.searchParams.delete('orgNotice')
    next.searchParams.delete('orgNoticeName')
    window.history.replaceState({}, '', next.toString())
  }, [searchParams, t])

  return null
}
