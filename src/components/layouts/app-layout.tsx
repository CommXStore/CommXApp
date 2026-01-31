import { AppSidebar } from '@/components/sidebar/app-sidebar'
import { Separator } from '@/components/ui/separator'
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from '@/components/ui/sidebar'
import { ClerkLoaded, ClerkLoading, UserButton } from '@clerk/nextjs'
import { ThemeToggle } from '@/components/theme-toggle'
import { OrgRefresh } from '@/components/org-refresh'
import { LanguageSwitcher } from '@/components/language-switcher'
import { HeaderBreadcrumb } from '@/components/header-breadcrumb'
import { AuthOrgGuard } from '@/components/auth-org-guard'
import { headers } from 'next/headers'

export function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const headerStore = headers()
  const search = headerStore.get('x-next-url') ?? ''
  const params = new URLSearchParams(search.split('?')[1] ?? '')
  const noticeId = params.get('orgNotice')
  const noticeName = params.get('orgNoticeName')
  const initialNotice =
    noticeId && noticeName ? { orgId: noticeId, orgName: noticeName } : null

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="overflow-hidden">
        <header className="flex h-16 shrink-0 items-center gap-2">
          <div className="flex w-full items-center justify-between gap-2 px-4">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator
                className="mr-2 data-[orientation=vertical]:h-4"
                orientation="vertical"
              />
              <HeaderBreadcrumb />
            </div>
            <div className="flex items-center gap-2">
              <LanguageSwitcher />
              <ThemeToggle />
              <ClerkLoaded>
                <UserButton />
              </ClerkLoaded>
              <ClerkLoading>
                <div className="size-8 rounded-full bg-muted" />
              </ClerkLoading>
            </div>
            <OrgRefresh />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
        <AuthOrgGuard initialNotice={initialNotice} />
      </SidebarInset>
    </SidebarProvider>
  )
}
