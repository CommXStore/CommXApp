'use client'

import { ShoppingBag } from 'lucide-react'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import { useTranslations } from '@/i18n/provider'

export function ActiveOrg() {
  const t = useTranslations()

  return (
    <SidebarMenuButton className="pl-0" size="lg">
      <ShoppingBag className="size-7!" />
      <div className="grid flex-1 text-left text-sm leading-tight">
        <span className="truncate font-medium">{t('common.app.name')}</span>
      </div>
    </SidebarMenuButton>
  )
}
