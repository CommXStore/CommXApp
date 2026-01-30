'use client'

import Link from 'next/link'
import { List, Pencil, Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { StatusBadge } from '@/components/status-badge'
import type { ContentType } from '@/lib/clerk/content-schemas'

export const createContentTypeColumns = (
  t: (key: string, params?: Record<string, string | number>) => string,
  deleteContentType: (contentType: ContentType) => Promise<void>
): ColumnDef<ContentType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={t('common.aria.selectAll')}
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && 'indeterminate')
          }
          onCheckedChange={value => table.toggleAllPageRowsSelected(!!value)}
        />
      </div>
    ),
    cell: ({ row }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label={t('common.aria.selectRow')}
          checked={row.getIsSelected()}
          onCheckedChange={value => row.toggleSelected(!!value)}
        />
      </div>
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: 'name',
    header: t('routes.content-types.table.headers.name'),
    enableHiding: false,
  },
  {
    accessorKey: 'slug',
    header: t('routes.content-types.table.headers.slug'),
  },
  {
    accessorKey: 'status',
    header: t('routes.content-types.table.headers.status'),
    cell: ({ row }) => <StatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'fields',
    header: t('routes.content-types.table.headers.fields'),
    cell: ({ row }) => row.original.fields.length,
  },
  {
    accessorKey: 'updatedAt',
    header: t('routes.content-types.table.headers.updatedAt'),
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button asChild size="icon" variant="ghost">
          <Link href={`/content/${row.original.slug}`}>
            <List />
          </Link>
        </Button>
        <Button asChild size="icon" variant="ghost">
          <Link href={`/content-types/${row.original.id}/edit`}>
            <Pencil />
          </Link>
        </Button>
        <Button
          className="flex size-8 text-destructive"
          onClick={async () => {
            await deleteContentType(row.original)
          }}
          size="icon"
          variant="ghost"
        >
          <Trash />
        </Button>
      </div>
    ),
  },
]
