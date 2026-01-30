'use client'

import { useEffect, useRef } from 'react'
import { useAuth } from '@clerk/nextjs'

export function OrgRefresh() {
  const { orgId } = useAuth()
  const previousOrgId = useRef<string | null>(orgId ?? null)

  useEffect(() => {
    if (previousOrgId.current && orgId && previousOrgId.current !== orgId) {
      window.location.reload()
    }
    previousOrgId.current = orgId ?? null
  }, [orgId])

  return null
}
