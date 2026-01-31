'use client'

import { useEffect, useRef } from 'react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n/provider'

type EnsureActiveResponse =
  | { action: 'ok' }
  | { action: 'none' }
  | { action: 'switch'; orgId: string; orgName: string }

export function AuthOrgGuard() {
  const t = useTranslations()
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { isLoaded, setActive } = useOrganizationList()
  const didRun = useRef(false)

  useEffect(() => {
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
        toast.info(
          t('common.organization.autoSwitch', { org: payload.orgName })
        )
      } catch {
        // No-op: avoid blocking auth flow on guard failure.
      }
    }

    void ensureActiveOrg()
  }, [isLoaded, isOrgLoaded, organization?.id, setActive, t])

  return null
}
