'use client'

import { useEffect, useState, type ComponentProps } from 'react'
import {
  Home,
  Layers,
  Settings2,
  SlidersHorizontal,
  SquareTerminal,
  TrendingUp,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
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
import type { ContentType } from '@/lib/clerk/content-schemas'
import { getIconByName } from '@/lib/icon-map'

type SidebarProps = ComponentProps<typeof Sidebar>

type ContentTypeLink = {
  title: string
  url: string
  icon: LucideIcon
}

export function AppSidebar({ ...props }: SidebarProps) {
  const t = useTranslations()
  const { orgRole, isSignedIn } = useAuth()
  const isAdmin = orgRole === 'org:admin'
  const [contentTypeLinks, setContentTypeLinks] = useState<ContentTypeLink[]>(
    []
  )

  useEffect(() => {
    if (!isSignedIn) {
      return
    }
    const controller = new AbortController()

    async function loadContentTypes() {
      try {
        const response = await fetch('/api/content-types/viewer', {
          signal: controller.signal,
        })
        if (!response.ok) {
          return
        }
        const payload = (await response.json()) as {
          success?: boolean
          data?: ContentType[]
        }
        if (!(payload.success && payload.data)) {
          return
        }
        setContentTypeLinks(
          payload.data.map(item => ({
            title: item.name,
            url: `/content/${item.slug}`,
            icon: getIconByName(item.icon),
          }))
        )
      } catch (error) {
        if ((error as Error).name === 'AbortError') {
          return
        }
        console.error(error)
      }
    }

    loadContentTypes()

    return () => {
      controller.abort()
    }
  }, [isSignedIn])
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
    ...contentTypeLinks.map(item => ({
      title: item.title,
      url: item.url,
      icon: item.icon,
      items: [],
    })),
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
      icon: TrendingUp,
      items: [],
    },
    {
      title: t('common.nav.settings'),
      url: '/dashboard/settings',
      icon: Settings2,
      items: [
        ...(isAdmin
          ? [
              {
                title: t('common.nav.members'),
                url: '/dashboard/settings/organization-members',
              },
              {
                title: t('common.nav.paymentProviders'),
                url: '/dashboard/settings/payment-providers',
              },
            ]
          : []),
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
