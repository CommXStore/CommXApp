'use client'

import { Badge } from '@/components/ui/badge'
import type { ContentEntry, ContentType } from '@/lib/clerk/content-schemas'
import { useTranslations } from '@/i18n/provider'

type Status = ContentType['status'] | ContentEntry['status']

type StatusBadgeProps = {
  status: Status
}

const statusVariant: Record<Status, 'default' | 'secondary'> = {
  draft: 'secondary',
  published: 'default',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const t = useTranslations()
  const statusLabels: Record<Status, string> = {
    draft: t('common.status.draft'),
    published: t('common.status.published'),
  }
  return <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
}
