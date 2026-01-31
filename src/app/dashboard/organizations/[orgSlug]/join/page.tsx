import { notFound, redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getTranslations } from '@/i18n/server'
import { requiresSubscriptionForOrg } from '@/lib/entitlements'
import { JoinOrganizationForm } from './join-form'

type JoinOrganizationPageProps = {
  params: Promise<{ orgSlug: string }>
}

export default async function JoinOrganizationPage({
  params,
}: JoinOrganizationPageProps) {
  const { orgSlug: slugParam } = await params
  const t = await getTranslations()
  const { userId } = await auth()
  const client = await clerkClient()

  const organization = await client.organizations
    .getOrganization({
      slug: slugParam,
    })
    .catch(() => notFound())

  if (userId) {
    const memberships = await client.organizations
      .getOrganizationMembershipList({
        organizationId: organization.id,
        userId: [userId],
        limit: 1,
      })
      .catch(() => null)

    if (memberships && memberships.data.length > 0) {
      redirect('/dashboard')
    }
  }

  const orgSlug = organization.slug ?? slugParam
  const requiresSubscription = await requiresSubscriptionForOrg(orgSlug)

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <div className="space-y-2">
        <h1 className="font-semibold text-2xl">
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
        orgSlug={orgSlug}
        requiresSubscription={requiresSubscription}
      />
    </div>
  )
}
