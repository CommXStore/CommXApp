'use client'

import { useState, useRef } from 'react'
import { nanoid } from 'nanoid'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { PaymentProvider } from './types'
import { useTranslations } from '@/i18n/provider'

type PaymentProviderFormDialogProps = {
  provider?: PaymentProvider | null
  onSave: (data: PaymentProvider) => Promise<void>
  isPending: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  trigger?: React.ReactNode
}

export function PaymentProviderFormDialog({
  provider,
  onSave,
  isPending,
  open,
  onOpenChange,
  trigger,
}: PaymentProviderFormDialogProps) {
  const t = useTranslations()
  const formRef = useRef<HTMLFormElement>(null)
  const [internalOpen, setInternalOpen] = useState(false)
  const isEditing = Boolean(provider)
  const isControlled = open !== undefined && onOpenChange !== undefined
  const dialogOpen = isControlled ? open : internalOpen
  const setDialogOpen = isControlled
    ? onOpenChange
    : (value: boolean) => setInternalOpen(value)

  async function formAction(formData: FormData) {
    const id = provider?.id ?? nanoid()
    const name = formData.get('name') as string
    const type = formData.get('type') as string
    const signingSecret = formData.get('signingSecret') as string
    const enabled = formData.get('enabled') === 'on'
    const metadataRaw = formData.get('metadata') as string

    let metadata: Record<string, unknown> = {}
    if (metadataRaw.trim()) {
      try {
        metadata = JSON.parse(metadataRaw)
      } catch {
        toast.error('Invalid metadata. Provide valid JSON.')
        return
      }
    }

    const payload: PaymentProvider = {
      id,
      name,
      type,
      enabled,
      metadata,
    }

    if (signingSecret.trim()) {
      Object.defineProperty(payload, 'signingSecret', {
        value: signingSecret,
        writable: true,
        enumerable: true,
      })
    }

    await onSave(payload)
    setDialogOpen(false)
    formRef.current?.reset()
  }

  return (
    <Dialog onOpenChange={setDialogOpen} open={dialogOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? t('routes.settings.paymentProviders.form.editTitle')
              : t('routes.settings.paymentProviders.form.createTitle')}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {isEditing
            ? t('routes.settings.paymentProviders.form.editDescription')
            : t('routes.settings.paymentProviders.form.createDescription')}
        </DialogDescription>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('routes.settings.paymentProviders.form.nameLabel')}
              </Label>
              <Input
                defaultValue={provider?.name ?? ''}
                id="name"
                name="name"
                placeholder={t(
                  'routes.settings.paymentProviders.form.namePlaceholder'
                )}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">
                {t('routes.settings.paymentProviders.form.typeLabel')}
              </Label>
              <Input
                defaultValue={provider?.type ?? ''}
                id="type"
                name="type"
                placeholder={t(
                  'routes.settings.paymentProviders.form.typePlaceholder'
                )}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="signingSecret">
              {t('routes.settings.paymentProviders.form.secretLabel')}
            </Label>
            <Input
              id="signingSecret"
              name="signingSecret"
              placeholder={t(
                'routes.settings.paymentProviders.form.secretPlaceholder'
              )}
              type="text"
            />
            {isEditing ? (
              <p className="text-muted-foreground text-xs">
                {t('routes.settings.paymentProviders.form.secretHint')}
              </p>
            ) : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="metadata">
              {t('routes.settings.paymentProviders.form.metadataLabel')}
            </Label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
              defaultValue={
                provider?.metadata
                  ? JSON.stringify(provider.metadata, null, 2)
                  : ''
              }
              id="metadata"
              name="metadata"
              placeholder={t(
                'routes.settings.paymentProviders.form.metadataPlaceholder'
              )}
              rows={4}
            />
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              defaultChecked={provider?.enabled ?? true}
              id="enabled"
              name="enabled"
            />
            <Label htmlFor="enabled">
              {t('routes.settings.paymentProviders.form.enabledLabel')}
            </Label>
          </div>
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              {t(
                isEditing
                  ? 'routes.settings.paymentProviders.form.update'
                  : 'routes.settings.paymentProviders.form.submit'
              )}
            </Button>
            <DialogClose asChild>
              <Button variant="outline">{t('common.actions.cancel')}</Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

import { toast } from 'sonner'
