'use client'

import Link from 'next/link'
import { Pencil, Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

type ColumnsOptions = {
  t: (key: string, params?: Record<string, string | number>) => string
  deleteCustomField: (customField: CustomField) => Promise<void>
  contentTypeMap: Record<string, ContentType>
}

export const createCustomFieldColumns = ({
  t,
  deleteCustomField,
  contentTypeMap,
}: ColumnsOptions): ColumnDef<CustomField>[] => [
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
    accessorKey: 'label',
    header: t('routes.custom-fields.table.headers.label'),
    enableHiding: false,
  },
  {
    accessorKey: 'key',
    header: t('routes.custom-fields.table.headers.key'),
  },
  {
    accessorKey: 'type',
    header: t('routes.custom-fields.table.headers.type'),
  },
  {
    accessorKey: 'required',
    header: t('routes.custom-fields.table.headers.required'),
    cell: ({ row }) =>
      row.original.required
        ? t('routes.custom-fields.table.values.yes')
        : t('routes.custom-fields.table.values.no'),
  },
  {
    accessorKey: 'attachedTo',
    header: t('routes.custom-fields.table.headers.contentType'),
    cell: ({ row }) => {
      const attachedIds = row.original.attachedTo ?? []
      if (!attachedIds.length) {
        return t('routes.custom-fields.table.values.unlinked')
      }
      return attachedIds
        .map(typeId => contentTypeMap[typeId]?.name ?? t('routes.custom-fields.table.values.removedType'))
        .join(', ')
    },
  },
  {
    accessorKey: 'updatedAt',
    header: t('routes.custom-fields.table.headers.updatedAt'),
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
        <Button asChild size="icon" variant="ghost">
          <Link href={`/custom-fields/${row.original.id}/edit`}>
            <Pencil />
          </Link>
        </Button>
        <Button
          className="flex size-8 text-destructive"
          onClick={async () => {
            await deleteCustomField(row.original)
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
