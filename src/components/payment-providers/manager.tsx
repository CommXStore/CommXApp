'use client'

import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useTranslations } from '@/i18n/provider'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type PaymentProvider = {
  id: string
  name: string
  type: string
  enabled: boolean
  metadata?: Record<string, unknown>
}

type ProvidersResponse = {
  success?: boolean
  data?: PaymentProvider[]
}

export function PaymentProvidersManager() {
  const t = useTranslations()
  const [providers, setProviders] = useState<PaymentProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [type, setType] = useState('')
  const [signingSecret, setSigningSecret] = useState('')
  const [enabled, setEnabled] = useState(true)
  const [metadata, setMetadata] = useState('')
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const loadProviders = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/admin/payment-providers')
      if (!res.ok) {
        toast.error(t('routes.settings.paymentProviders.toasts.loadFailed'))
        return
      }
      const payload = (await res.json()) as ProvidersResponse
      setProviders(payload.data ?? [])
    } catch {
      toast.error(t('routes.settings.paymentProviders.toasts.loadFailed'))
    } finally {
      setLoading(false)
    }
  }, [t])

  useEffect(() => {
    loadProviders()
  }, [loadProviders])

  function getSaveErrorKey(isEditing: boolean) {
    return isEditing
      ? 'routes.settings.paymentProviders.toasts.updateFailed'
      : 'routes.settings.paymentProviders.toasts.createFailed'
  }

  function getSaveSuccessKey(isEditing: boolean) {
    return isEditing
      ? 'routes.settings.paymentProviders.toasts.updated'
      : 'routes.settings.paymentProviders.toasts.created'
  }

  function upsertProvider(
    current: PaymentProvider[],
    provider: PaymentProvider,
    isEditing: boolean
  ) {
    if (isEditing) {
      return current.map(item => (item.id === provider.id ? provider : item))
    }
    return [provider, ...current]
  }

  async function submitProvider(
    endpoint: string,
    method: string,
    body: Record<string, unknown>,
    errorKey: string
  ) {
    const res = await fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!res.ok) {
      toast.error(t(errorKey))
      return null
    }
    const payload = (await res.json()) as {
      success?: boolean
      data?: PaymentProvider
    }
    return payload.data ?? undefined
  }

  async function persistProvider(meta: Record<string, unknown>) {
    const isEditing = Boolean(editingId)
    const endpoint = isEditing
      ? `/api/admin/payment-providers/${editingId}`
      : '/api/admin/payment-providers'
    const method = isEditing ? 'PATCH' : 'POST'
    const body: Record<string, unknown> = {
      name,
      type,
      enabled,
      metadata: meta,
    }
    if (signingSecret.trim()) {
      body.signingSecret = signingSecret
    }

    try {
      const saved = await submitProvider(
        endpoint,
        method,
        body,
        getSaveErrorKey(isEditing)
      )
      if (saved === null) {
        return
      }
      if (saved) {
        setProviders(current => upsertProvider(current, saved, isEditing))
      } else {
        await loadProviders()
      }
      resetForm()
      toast.success(t(getSaveSuccessKey(isEditing)))
    } catch {
      toast.error(t(getSaveErrorKey(isEditing)))
    }
  }

  function parseMetadata() {
    const trimmed = metadata.trim()
    if (!trimmed) {
      return {}
    }
    try {
      return JSON.parse(trimmed) as Record<string, unknown>
    } catch {
      return null
    }
  }

  function resetForm() {
    setName('')
    setType('')
    setSigningSecret('')
    setEnabled(true)
    setMetadata('')
    setEditingId(null)
  }

  function startEdit(provider: PaymentProvider) {
    setEditingId(provider.id)
    setName(provider.name)
    setType(provider.type)
    setEnabled(provider.enabled)
    setMetadata(
      provider.metadata ? JSON.stringify(provider.metadata, null, 2) : ''
    )
    setSigningSecret('')
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) {
      return
    }

    const meta = parseMetadata()
    if (meta === null) {
      toast.error(t('routes.settings.paymentProviders.errors.invalidMetadata'))
      return
    }

    setSaving(true)
    await persistProvider(meta)
    setSaving(false)
  }

  async function handleToggle(provider: PaymentProvider) {
    try {
      const res = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !provider.enabled }),
      })
      if (!res.ok) {
        toast.error(t('routes.settings.paymentProviders.toasts.updateFailed'))
        return
      }
      const payload = (await res.json()) as {
        success?: boolean
        data?: PaymentProvider
      }
      if (payload.data) {
        setProviders(current =>
          current.map(item => (item.id === provider.id ? payload.data : item))
        )
      } else {
        await loadProviders()
      }
      toast.success(t('routes.settings.paymentProviders.toasts.updated'))
    } catch {
      toast.error(t('routes.settings.paymentProviders.toasts.updateFailed'))
    }
  }

  async function handleDelete(provider: PaymentProvider) {
    try {
      const res = await fetch(`/api/admin/payment-providers/${provider.id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        toast.error(t('routes.settings.paymentProviders.toasts.deleteFailed'))
        return
      }
      setProviders(current => current.filter(item => item.id !== provider.id))
      toast.success(t('routes.settings.paymentProviders.toasts.deleted'))
    } catch {
      toast.error(t('routes.settings.paymentProviders.toasts.deleteFailed'))
    }
  }

  let tableContent: ReactNode
  if (loading) {
    tableContent = (
      <p className="text-muted-foreground text-sm">
        {t('common.messages.loading')}
      </p>
    )
  } else if (providers.length === 0) {
    tableContent = (
      <p className="text-muted-foreground text-sm">
        {t('routes.settings.paymentProviders.table.empty')}
      </p>
    )
  } else {
    tableContent = (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              {t('routes.settings.paymentProviders.table.headers.name')}
            </TableHead>
            <TableHead>
              {t('routes.settings.paymentProviders.table.headers.type')}
            </TableHead>
            <TableHead>
              {t('routes.settings.paymentProviders.table.headers.status')}
            </TableHead>
            <TableHead className="text-right">
              {t('routes.settings.paymentProviders.table.headers.actions')}
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {providers.map(provider => (
            <TableRow key={provider.id}>
              <TableCell className="font-medium">{provider.name}</TableCell>
              <TableCell>{provider.type}</TableCell>
              <TableCell>
                {provider.enabled
                  ? t('routes.settings.paymentProviders.status.enabled')
                  : t('routes.settings.paymentProviders.status.disabled')}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    onClick={() => handleToggle(provider)}
                    size="sm"
                    type="button"
                    variant="outline"
                  >
                    {provider.enabled
                      ? t('routes.settings.paymentProviders.actions.disable')
                      : t('routes.settings.paymentProviders.actions.enable')}
                  </Button>
                  <Button
                    onClick={() => startEdit(provider)}
                    size="sm"
                    type="button"
                    variant="secondary"
                  >
                    {t('routes.settings.paymentProviders.actions.edit')}
                  </Button>
                  <Button
                    onClick={() => handleDelete(provider)}
                    size="sm"
                    type="button"
                    variant="destructive"
                  >
                    {t('routes.settings.paymentProviders.actions.delete')}
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  }

  return (
    <div className="space-y-8">
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="provider-name">
              {t('routes.settings.paymentProviders.form.nameLabel')}
            </Label>
            <Input
              id="provider-name"
              name="name"
              onChange={event => setName(event.target.value)}
              placeholder={t(
                'routes.settings.paymentProviders.form.namePlaceholder'
              )}
              required
              value={name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider-type">
              {t('routes.settings.paymentProviders.form.typeLabel')}
            </Label>
            <Input
              id="provider-type"
              name="type"
              onChange={event => setType(event.target.value)}
              placeholder={t(
                'routes.settings.paymentProviders.form.typePlaceholder'
              )}
              required
              value={type}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider-secret">
              {t('routes.settings.paymentProviders.form.secretLabel')}
            </Label>
            <Input
              id="provider-secret"
              name="signingSecret"
              onChange={event => setSigningSecret(event.target.value)}
              placeholder={t(
                'routes.settings.paymentProviders.form.secretPlaceholder'
              )}
              value={signingSecret}
            />
            {editingId ? (
              <p className="text-muted-foreground text-xs">
                {t('routes.settings.paymentProviders.form.secretHint')}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="provider-metadata">
              {t('routes.settings.paymentProviders.form.metadataLabel')}
            </Label>
            <textarea
              className="min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              id="provider-metadata"
              name="metadata"
              onChange={event => setMetadata(event.target.value)}
              placeholder={t(
                'routes.settings.paymentProviders.form.metadataPlaceholder'
              )}
              rows={4}
              value={metadata}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Checkbox
            checked={enabled}
            id="provider-enabled"
            onCheckedChange={value => setEnabled(Boolean(value))}
          />
          <Label htmlFor="provider-enabled">
            {t('routes.settings.paymentProviders.form.enabledLabel')}
          </Label>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={saving} type="submit">
            {t(
              editingId
                ? 'routes.settings.paymentProviders.form.update'
                : 'routes.settings.paymentProviders.form.submit'
            )}
          </Button>
          {editingId ? (
            <Button
              disabled={saving}
              onClick={resetForm}
              type="button"
              variant="outline"
            >
              {t('routes.settings.paymentProviders.form.cancel')}
            </Button>
          ) : null}
        </div>
      </form>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-medium text-lg">
            {t('routes.settings.paymentProviders.table.title')}
          </h2>
          <Button
            onClick={loadProviders}
            size="sm"
            type="button"
            variant="outline"
          >
            {t('routes.settings.paymentProviders.actions.refresh')}
          </Button>
        </div>

        {tableContent}
      </div>
    </div>
  )
}
