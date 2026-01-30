import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { getTranslations } from '@/i18n/server'

function CTAButton({
  signedInLabel,
  signedOutLabel,
}: {
  signedInLabel: string
  signedOutLabel: string
}) {
  return (
    <>
      <SignedIn>
        <Button asChild>
          <Link href="/agents">{signedInLabel}</Link>
        </Button>
      </SignedIn>
      <SignedOut>
        <Button asChild>
          <Link href="/sign-in">{signedOutLabel}</Link>
        </Button>
      </SignedOut>
    </>
  )
}

export default async function Home() {
  const t = await getTranslations()

  return (
    <div className="flex w-fit flex-col items-center space-y-4">
      <ShoppingBag className="mb-4 size-10" />
      <div className="flex flex-col items-center">
        <h1 className="mb-2 font-semibold text-2xl md:text-3xl lg:text-4xl">
          {t('routes.home.title')}
        </h1>
        <p className="text-center text-muted-foreground text-sm md:text-base lg:text-lg">
          {t('routes.home.subtitle')}
        </p>
      </div>
      <CTAButton
        signedInLabel={t('routes.home.cta.signedIn')}
        signedOutLabel={t('routes.home.cta.signedOut')}
      />
    </div>
  )
}
