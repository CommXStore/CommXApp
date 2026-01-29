'use client'

import Link from 'next/link'
import { Pencil, Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { ContentType, CustomField } from '@/lib/clerk/content-schemas'

type ColumnsOptions = {
  deleteCustomField: (customField: CustomField) => Promise<void>
  contentTypeMap: Record<string, ContentType>
}

export const createCustomFieldColumns = ({
  deleteCustomField,
  contentTypeMap,
}: ColumnsOptions): ColumnDef<CustomField>[] => [
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
    accessorKey: 'label',
    header: 'Nome',
    enableHiding: false,
  },
  {
    accessorKey: 'key',
    header: 'Chave',
  },
  {
    accessorKey: 'type',
    header: 'Tipo',
  },
  {
    accessorKey: 'required',
    header: 'Obrigatório',
    cell: ({ row }) => (row.original.required ? 'Sim' : 'Não'),
  },
  {
    accessorKey: 'attachedTo',
    header: 'Tipo de conteúdo',
    cell: ({ row }) => {
      const attachedIds = row.original.attachedTo ?? []
      if (!attachedIds.length) {
        return 'Sem vínculo'
      }
      return attachedIds
        .map(typeId => contentTypeMap[typeId]?.name ?? 'Tipo removido')
        .join(', ')
    },
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
