import Link from 'next/link'
import { SignedIn, SignedOut } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center space-y-4">
      <h1 className="text-center font-semibold text-xl">
        AI SaaS w/ API Keys Quickstart
      </h1>
      <SignedIn>
        <Button asChild>
          <Link href="/dashboard">Go to Dashboard</Link>
        </Button>
      </SignedIn>
      <SignedOut>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </SignedOut>
    </main>
  )
}
