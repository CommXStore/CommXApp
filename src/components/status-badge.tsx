import { Badge } from '@/components/ui/badge'
import type { ContentEntry, ContentType } from '@/lib/clerk/content-schemas'

type Status = ContentType['status'] | ContentEntry['status']

type StatusBadgeProps = {
  status: Status
}

const statusLabels: Record<Status, string> = {
  draft: 'Rascunho',
  published: 'Publicado',
}

const statusVariant: Record<Status, 'default' | 'secondary'> = {
  draft: 'secondary',
  published: 'default',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge variant={statusVariant[status]}>{statusLabels[status]}</Badge>
}
