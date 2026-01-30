'use client'

import { OrganizationSwitcher } from '@clerk/nextjs'

export function ActiveOrg() {
  return (
    <div className="flex w-full items-center">
      <OrganizationSwitcher />
    </div>
  )
}
