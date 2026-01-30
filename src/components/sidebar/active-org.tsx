'use client'

import { OrgSwitcher } from '@/components/org-switcher'

export function ActiveOrg() {
  return (
    <div className="flex w-full items-center">
      <OrgSwitcher />
    </div>
  )
}
