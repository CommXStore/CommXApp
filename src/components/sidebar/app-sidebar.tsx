'use client'

import type * as React from 'react'
import { Home, Layers, Settings2, SlidersHorizontal, SquareTerminal } from 'lucide-react'
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

const navMain = [
  {
    title: 'Dashboard',
    url: '/dashboard',
    icon: Home,
    items: [],
  },
  {
    title: 'Agents',
    url: '/agents',
    icon: SquareTerminal,
    items: [],
  },
  {
    title: 'Tipos de conteúdo',
    url: '/content-types',
    icon: Layers,
    items: [],
  },
  {
    title: 'Campos personalizados',
    url: '/custom-fields',
    icon: SlidersHorizontal,
    items: [],
  },
  {
    title: 'Settings',
    url: '/dashboard/settings',
    icon: Settings2,
    items: [
      {
        title: 'Members',
        url: '/dashboard/settings/organization-members',
      },
      {
        title: 'API Keys',
        url: '/dashboard/settings/api-keys',
      },
    ],
  },
]

const navSecondary = [
  {
    title: 'Docs',
    url: 'https://clerk.com/docs/guides/development/machine-auth/overview#api-keys',
  },
  {
    title: 'Github',
    url: 'https://github.com/commx-app/commx-app',
  },
]

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
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
