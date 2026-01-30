'use client'

import Link from 'next/link'
import { Fragment } from 'react'
import { usePathname } from 'next/navigation'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useTranslations } from '@/i18n/provider'

const PATH_LABELS: Record<string, string> = {
  dashboard: 'common.nav.dashboard',
  agents: 'common.nav.agents',
  content: 'common.nav.content',
  'content-types': 'common.nav.contentTypes',
  'custom-fields': 'common.nav.customFields',
  billing: 'common.nav.billing',
  settings: 'common.nav.settings',
  upgrade: 'routes.billing.upgrade.title',
  new: 'common.breadcrumbs.new',
  edit: 'common.breadcrumbs.edit',
}

const ORGANIZATION_ID_REGEX = /^(ct|cf|ce)_/i

function humanizeSegment(segment: string) {
  return segment
    .split('-')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
}

type BreadcrumbItemData = {
  href?: string
  label: string
  key: string
}

function buildContentItems(
  segments: string[],
  t: (key: string) => string
): BreadcrumbItemData[] {
  const items: BreadcrumbItemData[] = [
    {
      href: '/content-types',
      label: t('common.nav.content'),
      key: 'content',
    },
  ]

  if (segments.includes('new')) {
    items.push({
      label: t('common.breadcrumbs.new'),
      key: 'content:new',
    })
  } else if (segments.includes('edit')) {
    items.push({
      label: t('common.breadcrumbs.edit'),
      key: 'content:edit',
    })
  } else if (segments.length > 1) {
    items.push({
      label: t('common.breadcrumbs.entries'),
      key: 'content:entries',
    })
  }

  return items
}

function buildResourceItems(
  root: 'content-types' | 'custom-fields',
  segments: string[],
  t: (key: string) => string
): BreadcrumbItemData[] {
  const rootLabel = PATH_LABELS[root]
  const items: BreadcrumbItemData[] = [
    {
      href: `/${root}`,
      label: rootLabel ? t(rootLabel) : humanizeSegment(root),
      key: root,
    },
  ]

  if (segments.includes('new')) {
    items.push({
      label: t('common.breadcrumbs.new'),
      key: `${root}:new`,
    })
  } else if (segments.includes('edit')) {
    items.push({
      label: t('common.breadcrumbs.edit'),
      key: `${root}:edit`,
    })
  }

  return items
}

function buildBillingItems(t: (key: string) => string): BreadcrumbItemData[] {
  return [
    {
      href: '/billing/upgrade',
      label: t('common.nav.billing'),
      key: 'billing',
    },
    {
      label: t('routes.billing.upgrade.title'),
      key: 'billing:upgrade',
    },
  ]
}

function buildDefaultItems(
  segments: string[],
  t: (key: string) => string
): BreadcrumbItemData[] {
  const items: BreadcrumbItemData[] = []

  segments.forEach((segment, index) => {
    if (segment === 'new' || segment === 'edit') {
      const labelKey = PATH_LABELS[segment]
      items.push({
        label: labelKey ? t(labelKey) : humanizeSegment(segment),
        key: `${segment}:${index}`,
      })
      return
    }

    if (ORGANIZATION_ID_REGEX.test(segment)) {
      return
    }

    const labelKey = PATH_LABELS[segment]
    if (!labelKey) {
      return
    }
    const href = `/${segments.slice(0, index + 1).join('/')}`
    items.push({
      href,
      label: t(labelKey),
      key: `${href}:${segment}`,
    })
  })

  return items
}

function buildBreadcrumbItems(
  segments: string[],
  t: (key: string) => string
): BreadcrumbItemData[] {
  if (!segments.length) {
    return []
  }

  const root = segments[0]
  if (root === 'content') {
    return buildContentItems(segments, t)
  }

  if (root === 'content-types' || root === 'custom-fields') {
    return buildResourceItems(root, segments, t)
  }

  if (root === 'billing' && segments.includes('upgrade')) {
    return buildBillingItems(t)
  }

  return buildDefaultItems(segments, t)
}

export function HeaderBreadcrumb() {
  const t = useTranslations()
  const pathname = usePathname()
  const segments = pathname.split('?')[0]?.split('/').filter(Boolean) ?? []

  const items = buildBreadcrumbItems(segments, t)
  if (!items.length) {
    return null
  }

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.key}>
            <BreadcrumbItem>
              {index === items.length - 1 || !item.href ? (
                <BreadcrumbPage>{item.label}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link href={item.href}>{item.label}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
            {index < items.length - 1 ? <BreadcrumbSeparator /> : null}
          </Fragment>
        ))}
      </BreadcrumbList>
    </Breadcrumb>
  )
}
