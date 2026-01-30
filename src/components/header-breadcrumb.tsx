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
  'content-types': 'common.nav.contentTypes',
  'custom-fields': 'common.nav.customFields',
  billing: 'common.nav.billing',
  settings: 'common.nav.settings',
}

function humanizeSegment(segment: string) {
  return segment
    .split('-')
    .map(item => item.charAt(0).toUpperCase() + item.slice(1))
    .join(' ')
}

export function HeaderBreadcrumb() {
  const t = useTranslations()
  const pathname = usePathname()
  const segments = pathname.split('?')[0]?.split('/').filter(Boolean) ?? []

  if (!segments.length) {
    return null
  }

  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join('/')}`
    const isLast = index === segments.length - 1
    const labelKey = PATH_LABELS[segment]
    const label = labelKey ? t(labelKey) : humanizeSegment(segment)

    return { href, label, isLast, key: `${href}:${segment}` }
  })

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <Fragment key={item.key}>
            <BreadcrumbItem>
              {item.isLast ? (
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
