'use client'

import { useCallback, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth, useClerk } from '@clerk/nextjs'
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
import Link from 'next/link'
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
import { createContentEntryColumns } from './columns'
import { deleteContentEntryAction } from '@/lib/clerk/actions'
import type { ContentEntry, ContentType } from '@/lib/clerk/content-schemas'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useTranslations } from '@/i18n/provider'

type ContentEntriesTableProps = {
  contentType: ContentType
  entries: ContentEntry[]
}

export function ContentEntriesTable({
  contentType,
  entries: initialEntries,
}: ContentEntriesTableProps) {
  const [data, setData] = useState<ContentEntry[]>(initialEntries)
  const [, setLoading] = useState(false)
  const t = useTranslations()
  const [apiOpen, setApiOpen] = useState(false)
  const [apiEntry, setApiEntry] = useState<ContentEntry | null>(null)
  const [apiResponse, setApiResponse] = useState<unknown>(null)
  const [apiError, setApiError] = useState<string | null>(null)
  const [apiLoading, setApiLoading] = useState(false)
  const { orgId, userId, getToken } = useAuth()
  const { clerk } = useClerk()

  const [rowSelection, setRowSelection] = useState({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  })

  const deleteEntry = useCallback(
    async (entry: ContentEntry) => {
      setLoading(true)
      setData(prevData => prevData.filter(item => item.id !== entry.id))
      try {
        await deleteContentEntryAction(contentType.slug, entry.id)
        toast.success(
          t('routes.content.table.toasts.deleted', { slug: entry.slug })
        )
      } catch (error) {
        setData(prevData => [...prevData, entry])
        console.error(error)
      } finally {
        setLoading(false)
      }
    },
    [contentType.slug, t]
  )

  const getFirstApiKeySecret = useCallback(async () => {
    const apiKeysClient = (
      clerk as { apiKeys?: { getAll?: () => Promise<unknown> } }
    )?.apiKeys
    if (!apiKeysClient?.getAll) {
      return null
    }

    try {
      const result = await apiKeysClient.getAll()
      const keys = Array.isArray(result) ? result : (result?.data ?? [])
      const orgKey = orgId
        ? keys.find(
            (key: { subject?: string; organizationId?: string }) =>
              key?.subject === orgId || key?.organizationId === orgId
          )
        : null
      const userKey = userId
        ? keys.find(
            (key: { subject?: string; userId?: string }) =>
              key?.subject === userId || key?.userId === userId
          )
        : null
      const preferredKey = orgKey ?? userKey ?? keys[0]
      return preferredKey && typeof preferredKey.secret === 'string'
        ? preferredKey.secret
        : null
    } catch (error) {
      console.warn(error)
      return null
    }
  }, [clerk, orgId, userId])

  const fetchEntryApi = useCallback(
    async (entry: ContentEntry) => {
      setApiLoading(true)
      setApiError(null)
      setApiResponse(null)

      try {
        const apiKey = await getFirstApiKeySecret()
        const token = apiKey ? null : await getToken()
        const authHeader = apiKey ?? token

        if (!authHeader) {
          throw new Error(t('routes.content.api.keyMissing'))
        }

        const response = await fetch(
          `/api/content/${contentType.slug}/${entry.id}`,
          {
            headers: {
              Authorization: `Bearer ${authHeader}`,
            },
          }
        )

        const payload = await response.json()
        if (!response.ok) {
          throw new Error(
            payload?.error ?? t('routes.content.api.requestFailed')
          )
        }

        setApiResponse(payload)
      } catch (error) {
        const message =
          error instanceof Error ? error.message : t('common.errors.unexpected')
        setApiError(message)
      } finally {
        setApiLoading(false)
      }
    },
    [contentType.slug, getFirstApiKeySecret, getToken, t]
  )

  const openApiPreview = useCallback(
    (entry: ContentEntry) => {
      setApiEntry(entry)
      setApiOpen(true)
      fetchEntryApi(entry).catch(error => {
        console.error(error)
      })
    },
    [fetchEntryApi]
  )

  const columns = useMemo(
    () =>
      createContentEntryColumns(
        t,
        contentType.slug,
        deleteEntry,
        openApiPreview
      ),
    [contentType.slug, deleteEntry, openApiPreview, t]
  )

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
      <Dialog
        onOpenChange={open => {
          setApiOpen(open)
          if (!open) {
            setApiEntry(null)
            setApiResponse(null)
            setApiError(null)
          }
        }}
        open={apiOpen}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{t('routes.content.table.dialog.title')}</DialogTitle>
            <DialogDescription>
              {apiEntry
                ? t('routes.content.table.dialog.description', {
                    slug: apiEntry.slug,
                    id: apiEntry.id,
                  })
                : t('routes.content.table.dialog.fallback')}
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[60vh] overflow-y-auto rounded-md border bg-muted/40 p-3 font-mono text-xs">
            {apiLoading && <span>{t('common.messages.loading')}</span>}
            {!apiLoading && apiError && (
              <span className="text-destructive">{apiError}</span>
            )}
            {!(apiLoading || apiError) && apiResponse && (
              <pre className="whitespace-pre-wrap">
                {JSON.stringify(apiResponse, null, 2)}
              </pre>
            )}
          </div>
        </DialogContent>
      </Dialog>
      <div className="flex h-full flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="font-semibold text-2xl">{contentType.name}</h1>
            <p className="text-muted-foreground">
              {t('routes.content.table.description', {
                slug: contentType.slug,
              })}
            </p>
          </div>
          <Button asChild>
            <Link href={`/content/${contentType.slug}/new`}>
              {t('routes.content.table.add')}
            </Link>
          </Button>
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
                    <div className="flex flex-col items-center gap-2">
                      <span>{t('routes.content.table.empty.title')}</span>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/content/${contentType.slug}/new`}>
                          {t('routes.content.table.empty.cta')}
                        </Link>
                      </Button>
                    </div>
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
    </div>
  )
}
