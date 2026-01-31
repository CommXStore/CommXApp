'use client'

import { useEffect, useRef } from 'react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n/provider'

type EnsureActiveResponse =
  | { action: 'ok' }
  | { action: 'none' }
  | { action: 'switch'; orgId: string; orgName: string }

type AuthOrgGuardProps = {
  initialNotice?: { orgId: string; orgName: string } | null
}

export function AuthOrgGuard({ initialNotice }: AuthOrgGuardProps) {
  const t = useTranslations()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { isLoaded, setActive } = useOrganizationList()
  const didRun = useRef(false)
  const didNotify = useRef(false)

  useEffect(() => {
    if (initialNotice && !didNotify.current) {
      didNotify.current = true
      toast.info(
        t('common.organization.autoSwitch', { org: initialNotice.orgName })
      )
      return
    }

    if (!isLoaded || !isOrgLoaded || didRun.current) {
      return
    }
    didRun.current = true

    async function ensureActiveOrg() {
      try {
        const response = await fetch('/api/organizations/ensure-active', {
          method: 'POST',
        })
        if (!response.ok) {
          return
        }
        const payload = (await response.json()) as EnsureActiveResponse
        if (payload.action !== 'switch') {
          return
        }
        if (!setActive || payload.orgId === organization?.id) {
          return
        }
        await setActive({ organization: payload.orgId })
        const noticeUrl = new URL(window.location.href)
        noticeUrl.searchParams.set('orgNotice', payload.orgId)
        noticeUrl.searchParams.set('orgNoticeName', payload.orgName)
        window.location.replace(noticeUrl.toString())
      } catch {
        // No-op: avoid blocking auth flow on guard failure.
      }
    }

    void ensureActiveOrg()
  }, [
    initialNotice,
    isLoaded,
    isOrgLoaded,
    organization?.id,
    setActive,
    t,
  ])

  return null
}
