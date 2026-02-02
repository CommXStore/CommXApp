'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import {
  ChevronsLeft,
  ChevronsRight,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import {
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from '@tanstack/react-table'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { PaymentProviderFormDialog } from './form-dialog'
import type { PaymentProvider } from './types'
import { useTranslations } from '@/i18n/provider'

export function PaymentProvidersTable({
  data: initialData,
}: {
  data: PaymentProvider[]
}) {
  const t = useTranslations()
  const [data, setData] = useState<PaymentProvider[]>(initialData)
  const [loading, setLoading] = useState(initialData.length === 0)
  const [editingProvider, setEditingProvider] =
    useState<PaymentProvider | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [togglingProviderId, setTogglingProviderId] = useState<string | null>(
    null
  )
  const [deleteProvider, setDeleteProvider] = useState<PaymentProvider | null>(
    null
  )

  const loadProviders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payment-providers')
      if (!res.ok) {
        return
      }
      const payload = (await res.json()) as { data?: PaymentProvider[] }
      setData(payload.data ?? [])
    } catch {
      toast.error('Failed to load providers.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (initialData.length === 0) {
      loadProviders()
    }
  }, [initialData, loadProviders])

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  async function createProvider(payload: PaymentProvider) {
    setLoading(true)
    setData(prevData => [...prevData, payload])
    try {
      await fetch('/api/admin/payment-providers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success('Provider created successfully.')
    } catch (error) {
      setData(prevData => prevData.filter(item => item.id !== payload.id))
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateProvider(payload: PaymentProvider) {
    setLoading(true)
    setData(prevData =>
      prevData.map(item => (item.id === payload.id ? payload : item))
    )
    try {
      await fetch(`/api/admin/payment-providers/${payload.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      toast.success('Provider updated.')
    } catch (error) {
      setData(prevData =>
        prevData.map(item =>
          item.id === payload.id ? (editingProvider ?? item) : item
        )
      )
      console.error(error)
    } finally {
      setLoading(false)
      setEditingProvider(null)
    }
  }

  async function toggleProvider(provider: PaymentProvider) {
    setTogglingProviderId(provider.id)
    try {
      const res = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !provider.enabled }),
      })
      if (!res.ok) {
        toast.error('Failed to update provider.')
        return
      }
      const payload = (await res.json()) as { data?: PaymentProvider }
      if (payload.data) {
        const savedProvider = payload.data
        setData(prevData =>
          prevData.map(item =>
            item.id === savedProvider.id ? savedProvider : item
          )
        )
      }
      toast.success('Provider updated.')
    } catch {
      toast.error('Failed to update provider.')
    } finally {
      setTogglingProviderId(null)
    }
  }

  async function confirmDelete(provider: PaymentProvider) {
    try {
      const res = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        toast.error('Failed to remove provider.')
        return
      }
      setData(prevData => prevData.filter(item => item.id !== provider.id))
      toast.success('Provider removed.')
    } catch {
      toast.error('Failed to remove provider.')
    } finally {
      setDeleteProvider(null)
    }
  }

  const columns = [
    {
      accessorKey: 'name',
      header: t('routes.settings.paymentProviders.table.headers.name'),
      cell: ({ row }: { row: { getValue: (key: string) => string } }) => (
        <span className="font-medium">{row.getValue('name')}</span>
      ),
    },
    {
      accessorKey: 'type',
      header: t('routes.settings.paymentProviders.table.headers.type'),
    },
    {
      accessorKey: 'enabled',
      header: t('routes.settings.paymentProviders.table.headers.status'),
      cell: ({ row }: { row: { getValue: (key: string) => boolean } }) => (
        <span>
          {row.getValue('enabled')
            ? t('routes.settings.paymentProviders.status.enabled')
            : t('routes.settings.paymentProviders.status.disabled')}
        </span>
      ),
    },
    {
      id: 'actions',
      header: t('routes.settings.paymentProviders.table.headers.actions'),
      cell: ({ row }: { row: { original: PaymentProvider } }) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            disabled={togglingProviderId === row.original.id}
            onClick={() => toggleProvider(row.original)}
            size="sm"
            type="button"
            variant="outline"
          >
            {row.original.enabled
              ? t('routes.settings.paymentProviders.actions.disable')
              : t('routes.settings.paymentProviders.actions.enable')}
          </Button>
          <Button
            disabled={loading}
            onClick={() => {
              setEditingProvider(row.original)
              setIsDialogOpen(true)
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            {t('routes.settings.paymentProviders.actions.edit')}
          </Button>
          <Button
            onClick={() => setDeleteProvider(row.original)}
            size="sm"
            type="button"
            variant="destructive"
          >
            {t('routes.settings.paymentProviders.actions.delete')}
          </Button>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnVisibility,
      rowSelection,
      columnFilters,
      pagination,
    },
    getRowId: row => row.id.toString(),
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
  })

  return (
    <div className="flex flex-1 flex-col justify-between gap-4">
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-end gap-2">
          <Button onClick={loadProviders} size="sm" variant="outline">
            {t('routes.settings.paymentProviders.actions.refresh')}
          </Button>
          <PaymentProviderFormDialog
            isPending={loading}
            onSave={createProvider}
            trigger={
              <Button>
                {t('routes.settings.paymentProviders.form.submit')}
              </Button>
            }
          />
        </div>
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-muted">
              {table.getHeaderGroups().map(headerGroup => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <TableHead colSpan={header.colSpan} key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody className="**:data-[slot=table-cell]:first:w-8">
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map(row => (
                  <TableRow
                    data-state={row.getIsSelected() && 'selected'}
                    key={row.id}
                  >
                    {row.getVisibleCells().map(cell => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    className="h-24 text-center"
                    colSpan={columns.length}
                  >
                    {t('common.table.noResults')}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      <div className="flex items-center justify-between px-4">
        <div className="hidden flex-1 text-muted-foreground text-sm lg:flex">
          {t('common.table.selectedRows', {
            selected: table.getFilteredSelectedRowModel().rows.length,
            total: table.getFilteredRowModel().rows.length,
          })}
        </div>
        <div className="flex w-full items-center gap-8 lg:w-fit">
          <div className="hidden items-center gap-2 lg:flex">
            <Label className="font-medium text-sm" htmlFor="rows-per-page">
              {t('common.table.rowsPerPage')}
            </Label>
            <Select
              onValueChange={value => {
                table.setPageSize(Number(value))
              }}
              value={`${table.getState().pagination.pageSize}`}
            >
              <SelectTrigger className="w-20" id="rows-per-page" size="sm">
                <SelectValue
                  placeholder={table.getState().pagination.pageSize}
                />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map(pageSize => (
                  <SelectItem key={pageSize} value={`${pageSize}`}>
                    {pageSize}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex w-fit items-center justify-center font-medium text-sm">
            {t('common.table.pageOf', {
              page: table.getState().pagination.pageIndex + 1,
              total: table.getPageCount(),
            })}
          </div>
          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <Button
              className="hidden h-8 w-8 p-0 lg:flex"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.setPageIndex(0)}
              variant="outline"
            >
              <span className="sr-only">{t('common.aria.goToFirstPage')}</span>
              <ChevronsLeft />
            </Button>
            <Button
              className="size-8"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">
                {t('common.aria.goToPreviousPage')}
              </span>
              <ChevronLeft />
            </Button>
            <Button
              className="size-8"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">{t('common.aria.goToNextPage')}</span>
              <ChevronRight />
            </Button>
            <Button
              className="hidden size-8 lg:flex"
              disabled={!table.getCanNextPage()}
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              size="icon"
              variant="outline"
            >
              <span className="sr-only">{t('common.aria.goToLastPage')}</span>
              <ChevronsRight />
            </Button>
          </div>
        </div>
      </div>

      <PaymentProviderFormDialog
        isPending={loading}
        onOpenChange={setIsDialogOpen}
        onSave={updateProvider}
        open={isDialogOpen}
        provider={editingProvider}
        trigger={null}
      />

      <Dialog
        onOpenChange={(value: boolean) => {
          if (!value) {
            setDeleteProvider(null)
          }
        }}
        open={deleteProvider !== null}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove Provider</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove "{deleteProvider?.name}"? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={() => setDeleteProvider(null)} variant="outline">
              Cancel
            </Button>
            <Button
              onClick={() => {
                if (deleteProvider) {
                  confirmDelete(deleteProvider)
                }
              }}
              variant="destructive"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
