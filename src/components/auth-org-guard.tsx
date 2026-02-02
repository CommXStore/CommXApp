'use client'

import { useEffect, useRef } from 'react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'

type EnsureActiveResponse =
  | { action: 'ok' }
  | { action: 'none' }
  | { action: 'switch'; orgId: string; orgName: string }

export function AuthOrgGuard() {
  const { organization, isLoaded: isOrgLoaded } = useOrganization()
  const { isLoaded, setActive } = useOrganizationList()
  const didRun = useRef(false)

  useEffect(() => {
    if (!(isLoaded && isOrgLoaded) || didRun.current) {
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

    ensureActiveOrg().catch(() => null)
  }, [isLoaded, isOrgLoaded, organization?.id, setActive])

  return null
}
