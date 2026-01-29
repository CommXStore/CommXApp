'use client'

import Link from 'next/link'
import { Pencil, Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ContentType } from '@/lib/clerk/content-schemas'

export const createContentTypeColumns = (
  deleteContentType: (contentType: ContentType) => Promise<void>
): ColumnDef<ContentType>[] => [
  {
    id: 'select',
    header: ({ table }) => (
      <div className="flex items-center justify-center">
        <Checkbox
          aria-label="Select all"
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
          aria-label="Select row"
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
    header: 'Nome',
    enableHiding: false,
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
  },
  {
    accessorKey: 'status',
    header: 'Status',
  },
  {
    accessorKey: 'fields',
    header: 'Campos',
    cell: ({ row }) => row.original.fields.length,
  },
  {
    accessorKey: 'updatedAt',
    header: 'Atualizado em',
    cell: ({ row }) => new Date(row.original.updatedAt).toLocaleString(),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end gap-1">
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
