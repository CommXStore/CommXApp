import { OrganizationProfile } from '@clerk/nextjs'
import { requireOrgAdmin } from '@/lib/clerk/require-org-admin'

type SettingsPageProps = {
  params?: Promise<{ rest?: string[] }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const resolvedParams = await params
  if (resolvedParams?.rest?.includes('organization-members')) {
    await requireOrgAdmin()
  }

  return (
    <div className="flex items-center justify-center">
      <OrganizationProfile
        appearance={{
          elements: {
            rootBox: '!w-full',
            cardBox: '!w-full !h-auto !flex !shadow-none !border-none',
            navbar: '!hidden',
            navbarMobileMenuRow: '!hidden',
            scrollBox: '!w-full !h-auto !max-w-none',
          },
        }}
      />
    </div>
  )
}
