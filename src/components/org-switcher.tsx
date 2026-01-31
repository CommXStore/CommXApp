'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { useOrganization, useOrganizationList } from '@clerk/nextjs'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { useIsMobile } from '@/hooks/use-mobile'
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
  const isMobile = useIsMobile()
  const { organization } = useOrganization()
  const { isLoaded, setActive, userMemberships, userSuggestions } =
    useOrganizationList({
      userMemberships: true,
      userSuggestions: true,
    })

  const [availableOrgs, setAvailableOrgs] = useState<
    Array<{ id: string; name: string; slug: string; imageUrl: string | null }>
  >([])

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

  const memberOrgIds = useMemo(
    () => new Set(memberships.map(item => item.organization.id)),
    [memberships]
  )

  useEffect(() => {
    if (!isLoaded) {
      return
    }
    let isMounted = true
    async function loadAvailableOrgs() {
      try {
        const res = await fetch('/api/organizations/available')
        if (!res.ok) {
          return
        }
        const payload = (await res.json()) as {
          data?: Array<{
            id: string
            name: string
            slug: string
            imageUrl: string | null
          }>
        }
        const next = payload.data ?? []
        if (isMounted) {
          setAvailableOrgs(next)
        }
      } catch {
        if (isMounted) {
          setAvailableOrgs([])
        }
      }
    }

    loadAvailableOrgs()
    return () => {
      isMounted = false
    }
  }, [isLoaded])

  const available = useMemo(
    () => availableOrgs.filter(org => !memberOrgIds.has(org.id)),
    [availableOrgs, memberOrgIds]
  )

  const joinableOrgs = useMemo(() => {
    if (available.length) {
      return available.map(org => ({
        id: org.id,
        name: org.name,
        slug: org.slug,
        imageUrl: org.imageUrl,
      }))
    }

    return suggestions.map(suggestion => ({
      id: suggestion.id,
      name: suggestion.publicOrganizationData.name,
      slug: suggestion.publicOrganizationData.slug ?? '',
      imageUrl: suggestion.publicOrganizationData.imageUrl,
    }))
  }, [available, suggestions])

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
          className="w-full justify-between gap-2 pl-0"
          disabled={!isLoaded}
          size="lg"
        >
          <span className="flex min-w-0 items-center gap-2">
            <span
              className={cn(
                'flex aspect-square h-[30px] min-h-[30px] w-[30px] min-w-[30px] shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground text-xs uppercase',
                activeImage ? 'border-transparent bg-transparent p-0' : ''
              )}
            >
              {activeImage ? (
                <Image
                  alt={activeName}
                  className="aspect-square h-[30px] w-[30px] shrink-0 rounded-full object-cover"
                  height={30}
                  src={activeImage}
                  width={30}
                />
              ) : (
                activeName.slice(0, 2)
              )}
            </span>
            <span className="min-w-0 truncate font-medium text-sm">
              {activeName}
            </span>
          </span>
          {isMobile ? (
            <span
              className={cn(
                'flex aspect-square h-[30px] min-h-[30px] w-[30px] min-w-[30px] shrink-0 items-center justify-center rounded-full bg-muted font-semibold text-muted-foreground text-xs uppercase',
                activeImage ? 'border-transparent bg-transparent p-0' : ''
              )}
            >
              {activeImage ? (
                <Image
                  alt={activeName}
                  className="aspect-square h-[30px] w-[30px] shrink-0 rounded-full object-cover"
                  height={30}
                  src={activeImage}
                  width={30}
                />
              ) : (
                activeName.slice(0, 2)
              )}
            </span>
          ) : (
            <ChevronDown className="size-4 shrink-0 opacity-70" />
          )}
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
              <span className="flex size-6 items-center justify-center rounded-full bg-muted font-semibold text-[10px] text-muted-foreground uppercase">
                {membership.organization.imageUrl ? (
                  <Image
                    alt={membership.organization.name}
                    className="size-6 rounded-full object-cover"
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
        {joinableOrgs.length ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>
              {t('common.organization.available')}
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {joinableOrgs.map(org => (
              <DropdownMenuItem
                className="flex items-center gap-2"
                key={org.id}
                onSelect={() =>
                  router.push(`/dashboard/organizations/${org.slug}/join`)
                }
              >
                <span className="flex size-6 items-center justify-center rounded-full bg-muted font-semibold text-[10px] text-muted-foreground uppercase">
                  {org.imageUrl ? (
                    <Image
                      alt={org.name}
                      className="size-6 rounded-full object-cover"
                      height={24}
                      src={org.imageUrl}
                      width={24}
                    />
                  ) : (
                    org.name.slice(0, 2)
                  )}
                </span>
                <span className="min-w-0 flex-1 truncate">{org.name}</span>
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
