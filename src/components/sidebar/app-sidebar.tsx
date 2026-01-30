'use client'

import type * as React from 'react'
import {
  Home,
  FileText,
  Layers,
  Settings2,
  SlidersHorizontal,
  SquareTerminal,
  TicketCheck,
} from 'lucide-react'
import { ActiveOrg } from '@/components/sidebar/active-org'
import { NavMain } from '@/components/sidebar/nav-main'
import { NavSecondary } from '@/components/sidebar/nav-secondary'
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import { useAuth } from '@clerk/nextjs'
import { useTranslations } from '@/i18n/provider'

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const t = useTranslations()
  const { orgRole } = useAuth()
  const isAdmin = orgRole === 'org:admin'
  const navMain = [
    {
      title: t('common.nav.dashboard'),
      url: '/dashboard',
      icon: Home,
      items: [],
    },
    {
      title: t('common.nav.agents'),
      url: '/agents',
      icon: SquareTerminal,
      items: [],
    },
    {
      title: t('common.nav.content'),
      url: '/content',
      icon: FileText,
      items: [],
    },
    ...(isAdmin
      ? [
          {
            title: t('common.nav.contentTypes'),
            url: '/content-types',
            icon: Layers,
            items: [],
          },
          {
            title: t('common.nav.customFields'),
            url: '/custom-fields',
            icon: SlidersHorizontal,
            items: [],
          },
        ]
      : []),
    {
      title: t('common.nav.billing'),
      url: '/billing/upgrade',
      icon: TicketCheck,
      items: [],
    },
    {
      title: t('common.nav.settings'),
      url: '/dashboard/settings',
      icon: Settings2,
      items: [
        {
          title: t('common.nav.members'),
          url: '/dashboard/settings/organization-members',
        },
        {
          title: t('common.nav.apiKeys'),
          url: '/dashboard/settings/api-keys',
        },
      ],
    },
  ]

  const navSecondary = [
    {
      title: t('common.nav.docs'),
      url: 'https://clerk.com/docs/guides/development/machine-auth/overview#api-keys',
    },
    {
      title: t('common.nav.github'),
      url: 'https://github.com/commx-app/commx-app',
    },
  ]

  return (
    <Sidebar collapsible="icon" variant="inset" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <ActiveOrg />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavSecondary className="mt-auto" items={navSecondary} />
      </SidebarContent>
    </Sidebar>
  )
}
