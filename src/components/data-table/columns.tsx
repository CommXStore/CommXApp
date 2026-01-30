'use client'

import { Trash } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import type { Agent } from '@/lib/clerk/metadata-utils'

export const createColumns = (
  t: (key: string, params?: Record<string, string | number>) => string,
  deleteAgent: (agent: Agent) => Promise<void>
): ColumnDef<Agent>[] => [
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
    accessorKey: 'id',
    header: t('routes.agents.table.headers.id'),
  },
  {
    accessorKey: 'name',
    header: t('routes.agents.table.headers.name'),
    enableHiding: false,
  },
  {
    accessorKey: 'model',
    header: t('routes.agents.table.headers.model'),
  },
  {
    accessorKey: 'description',
    header: t('routes.agents.table.headers.description'),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="flex items-center justify-end">
        <Button
          className="flex size-8 text-destructive"
          onClick={async () => {
            await deleteAgent(row.original)
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
