import { notFound } from 'next/navigation'
import { clerkClient } from '@clerk/nextjs/server'
import { getTranslations } from '@/i18n/server'
import { requiresSubscriptionForOrg } from '@/lib/entitlements'
import { JoinOrganizationForm } from './join-form'

type JoinOrganizationPageProps = {
  params: { orgSlug: string }
}

export default async function JoinOrganizationPage({
  params,
}: JoinOrganizationPageProps) {
  const t = await getTranslations()
  const client = await clerkClient()

  const organization = await client.organizations
    .getOrganization({
      slug: params.orgSlug,
    })
    .catch(() => notFound())

  const orgSlug = organization.slug ?? params.orgSlug
  const requiresSubscription = await requiresSubscriptionForOrg(orgSlug)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">
          {t('routes.organizations-join.title', {
            org: organization.name,
          })}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.organizations-join.subtitle')}
        </p>
      </div>
      <JoinOrganizationForm
        orgId={organization.id}
        orgName={organization.name}
        requiresSubscription={requiresSubscription}
      />
    </div>
  )
}
