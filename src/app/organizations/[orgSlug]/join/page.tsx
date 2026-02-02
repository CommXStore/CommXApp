import { notFound, redirect } from 'next/navigation'
import { auth, clerkClient } from '@clerk/nextjs/server'
import { getTranslations } from '@/i18n/server'
import { entitlements, requiresSubscriptionForOrg } from '@/lib/entitlements'
import { JoinOrganizationForm } from './join-form'
import { PageHeader } from '@/components/page-layout'

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
      redirect('/')
    }
  }

  const orgSlug = organization.slug ?? slugParam
  const requiresSubscription = await requiresSubscriptionForOrg(orgSlug)
  const joinDecision = userId
    ? await entitlements.canJoinOrg(userId, orgSlug)
    : { allowed: false, reason: 'User is required.' }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6">
      <PageHeader
        description={t('routes.organizations-join.subtitle')}
        title={t('routes.organizations-join.title', {
          org: organization.name,
        })}
      />
      <JoinOrganizationForm
        hasAccess={joinDecision.allowed}
        orgId={organization.id}
        orgName={organization.name}
        orgSlug={orgSlug}
        requiresSubscription={requiresSubscription}
      />
    </div>
  )
}
