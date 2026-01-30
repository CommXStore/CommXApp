'use client'

import { SignInButton, SignedIn, SignedOut, UserButton } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { LanguageSwitcher } from '@/components/language-switcher'
import { ThemeToggle } from '@/components/theme-toggle'

export function Header() {
  return (
    <header className="flex h-16 shrink-0 items-center justify-end">
      <div className="flex items-center gap-2 px-4">
        <LanguageSwitcher />
        <ThemeToggle />
        <SignedOut>
          <Button asChild className="border border-primary" variant="outline">
            <SignInButton />
          </Button>
        </SignedOut>
        <SignedIn>
          <UserButton />
        </SignedIn>
      </div>
    </header>
  )
}
