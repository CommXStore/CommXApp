'use client'

import { useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useTranslations } from '@/i18n/provider'
import { SidebarMenuButton } from '@/components/ui/sidebar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function OrgSwitcher() {
  const t = useTranslations()
  const router = useRouter()
  const { organization } = useOrganization()
  const { isLoaded, setActive, userMemberships, userSuggestions } =
    useOrganizationList({
      userMemberships: true,
      userSuggestions: true,
    })

  const memberships = useMemo(
    () => userMemberships.data ?? [],
    [userMemberships.data]
  )
  const suggestions = useMemo(
    () =>
      (userSuggestions.data ?? []).filter(
        suggestion => suggestion.publicOrganizationData.slug
      ),
    [userSuggestions.data]
  )
  const activeOrgId = organization?.id
  const activeName = organization?.name ?? t('common.organization.none')
  const activeImage = organization?.imageUrl ?? null

  const handleSelect = useCallback(
    async (orgId: string) => {
      if (!setActive) {
        return
      }
      await setActive({ organization: orgId })
    },
    [setActive]
  )

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          aria-label={t('common.organization.switcher')}
          className="w-full justify-between gap-2"
          disabled={!isLoaded}
          size="lg"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex size-7 items-center justify-center rounded-md border bg-muted font-semibold text-muted-foreground text-xs uppercase',
                activeImage ? 'border-transparent bg-transparent p-0' : ''
              )}
            >
              {activeImage ? (
                <Image
                  alt={activeName}
                  className="size-7 rounded-md object-cover"
                  height={28}
                  src={activeImage}
                  width={28}
                />
              ) : (
                activeName.slice(0, 2)
              )}
            </span>
            <span className="min-w-0 truncate font-medium text-sm">
              {activeName}
            </span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-70" />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel>{t('common.organization.label')}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {memberships.length ? (
          memberships.map(membership => (
            <DropdownMenuItem
              className="flex items-center gap-2"
              key={membership.id}
              onSelect={() => handleSelect(membership.organization.id)}
            >
              <span className="flex size-6 items-center justify-center rounded-md border bg-muted font-semibold text-[10px] text-muted-foreground uppercase">
                {membership.organization.imageUrl ? (
                  <Image
                    alt={membership.organization.name}
                    className="size-6 rounded-md object-cover"
                    height={24}
                    src={membership.organization.imageUrl}
                    width={24}
                  />
                ) : (
                  membership.organization.name.slice(0, 2)
                )}
              </span>
              <span className="min-w-0 flex-1 truncate">
                {membership.organization.name}
              </span>
              {membership.organization.id === activeOrgId ? (
                <span className="ml-auto flex items-center">
                  <span className="sr-only">
                    {t('common.organization.active')}
                  </span>
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-emerald-500"
                  />
                </span>
              ) : null}
            </DropdownMenuItem>
          ))
        ) : (
          <DropdownMenuItem disabled>
            {t('common.organization.empty')}
          </DropdownMenuItem>
        )}
        {suggestions.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              {t('common.organization.available')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {suggestions.map(suggestion => (
              <DropdownMenuItem
                className="flex items-center gap-2"
                key={suggestion.id}
                onSelect={() =>
                  router.push(
                    `/dashboard/organizations/${suggestion.publicOrganizationData.slug}/join`
                  )
                }
              >
                <span className="flex size-6 items-center justify-center rounded-md border bg-muted font-semibold text-[10px] text-muted-foreground uppercase">
                  {suggestion.publicOrganizationData.imageUrl ? (
                    <Image
                      alt={suggestion.publicOrganizationData.name}
                      className="size-6 rounded-md object-cover"
                      height={24}
                      src={suggestion.publicOrganizationData.imageUrl}
                      width={24}
                    />
                  ) : (
                    suggestion.publicOrganizationData.name.slice(0, 2)
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">
                  {suggestion.publicOrganizationData.name}
                </span>
                <span className="text-muted-foreground text-xs">
                  {t('common.organization.join')}
                </span>
              </DropdownMenuItem>
            ))}
          </>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
