'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useOrganizationList, useUser } from '@clerk/nextjs'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Field, FieldGroup, FieldLabel, FieldSet } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { useTranslations } from '@/i18n/provider'

type JoinOrganizationFormProps = {
  orgId: string
  orgName: string
  requiresSubscription: boolean
}

export function JoinOrganizationForm({
  orgId,
  orgName,
  requiresSubscription,
}: JoinOrganizationFormProps) {
  const t = useTranslations()
  const router = useRouter()
  const { user, isLoaded } = useUser()
  const { setActive } = useOrganizationList()
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const didInit = useRef(false)

  useEffect(() => {
    if (!isLoaded || didInit.current) {
      return
    }
    setFirstName(user?.firstName ?? '')
    setLastName(user?.lastName ?? '')
    didInit.current = true
  }, [isLoaded, user?.firstName, user?.lastName])

  const email = user?.primaryEmailAddress?.emailAddress ?? ''

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (isSubmitting) {
      return
    }

    setIsSubmitting(true)
    const payload = {
      organizationId: orgId,
      joinAsCurrentUser: true,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
    }

    try {
      const response = await fetch('/api/organizations/memberships', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = (await response.json()) as {
        error?: string
      }

      if (!response.ok) {
        toast.error(data.error ?? t('routes.organizations-join.toasts.failed'))
        return
      }

      if (setActive) {
        await setActive({ organization: orgId })
      }
      toast.success(
        t('routes.organizations-join.toasts.joined', { org: orgName })
      )
      router.push('/dashboard')
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : t('routes.organizations-join.toasts.failed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <p className="font-medium text-sm">
              {requiresSubscription
                ? t('routes.organizations-join.status.requiresPlan')
                : t('routes.organizations-join.status.free')}
            </p>
            <p className="text-muted-foreground text-sm">
              {requiresSubscription
                ? t('routes.organizations-join.status.requiresPlanDescription')
                : t('routes.organizations-join.status.freeDescription')}
            </p>
          </div>
          {requiresSubscription ? (
            <Button asChild size="sm" variant="secondary">
              <Link href="/billing/upgrade">
                {t('routes.organizations-join.actions.upgrade')}
              </Link>
            </Button>
          ) : null}
        </div>
      </div>

      <FieldSet>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="email">
              {t('routes.organizations-join.form.emailLabel')}
            </FieldLabel>
            <Input
              autoComplete="email"
              disabled={!email}
              id="email"
              name="email"
              readOnly
              type="email"
              value={email}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="firstName">
              {t('routes.organizations-join.form.firstNameLabel')}
            </FieldLabel>
            <Input
              autoComplete="given-name"
              id="firstName"
              name="firstName"
              onChange={event => setFirstName(event.target.value)}
              placeholder={t(
                'routes.organizations-join.form.firstNamePlaceholder'
              )}
              type="text"
              value={firstName}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="lastName">
              {t('routes.organizations-join.form.lastNameLabel')}
            </FieldLabel>
            <Input
              autoComplete="family-name"
              id="lastName"
              name="lastName"
              onChange={event => setLastName(event.target.value)}
              placeholder={t(
                'routes.organizations-join.form.lastNamePlaceholder'
              )}
              type="text"
              value={lastName}
            />
          </Field>
        </FieldGroup>
      </FieldSet>

      <div className="flex justify-end">
        <Button disabled={!isLoaded || isSubmitting} type="submit">
          {t('routes.organizations-join.form.submit')}
        </Button>
      </div>
    </form>
  )
}
