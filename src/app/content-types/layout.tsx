import { AppLayout } from '@/components/layouts/app-layout'

export default function ContentTypesLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return <AppLayout>{children}</AppLayout>
}
