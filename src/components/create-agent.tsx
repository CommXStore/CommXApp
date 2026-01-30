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
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSet,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Agent } from '@/lib/clerk/metadata-utils'
import { useTranslations } from '@/i18n/provider'

type CreateAgentProps = {
  createAgent: (payload: Agent) => Promise<void>
  isPending: boolean
}

export function CreateAgentButton({
  createAgent,
  isPending,
}: CreateAgentProps) {
  const t = useTranslations()
  const formRef = useRef<HTMLFormElement>(null)
  const [open, setOpen] = useState(false)

  async function formAction(formData: FormData) {
    const agent = {
      id: nanoid(),
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      model: formData.get('model') as string,
    } satisfies Agent
    await createAgent(agent)
    setOpen(false)
    formRef.current?.reset()
  }

  return (
    <Dialog onOpenChange={setOpen} open={open}>
      <DialogTrigger asChild>
        <Button>{t('routes.agents.create.button')}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('routes.agents.create.title')}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          {t('routes.agents.create.description')}
        </DialogDescription>
        <form action={formAction} className="space-y-4" ref={formRef}>
          <FieldSet>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="name">
                  {t('routes.agents.create.fields.name.label')}
                </FieldLabel>
                <FieldDescription>
                  {t('routes.agents.create.fields.name.description')}
                </FieldDescription>
                <Input
                  id="name"
                  name="name"
                  placeholder={t(
                    'routes.agents.create.fields.name.placeholder'
                  )}
                  type="text"
                />
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="model">
                  {t('routes.agents.create.fields.model.label')}
                </FieldLabel>
                <Select defaultValue="gpt-5-nano" name="model">
                  <SelectTrigger>
                    <SelectValue
                      placeholder={t(
                        'routes.agents.create.fields.model.placeholder'
                      )}
                    />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-5-nano">GPT-5 nano</SelectItem>
                    <SelectItem value="gpt-4o-mini">GPT-4o mini</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            </FieldGroup>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="description">
                  {t('routes.agents.create.fields.description.label')}
                </FieldLabel>
                <FieldDescription>
                  {t('routes.agents.create.fields.description.description')}
                </FieldDescription>
                <Input
                  id="description"
                  name="description"
                  placeholder={t(
                    'routes.agents.create.fields.description.placeholder'
                  )}
                  type="text"
                />
              </Field>
            </FieldGroup>
          </FieldSet>
          <DialogFooter>
            <Button disabled={isPending} type="submit">
              {t('routes.agents.create.submit')}
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
