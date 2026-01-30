import { redirect } from 'next/navigation'
import { getContentTypesViewerAction } from '@/lib/clerk/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const contentTypes = await getContentTypesViewerAction()
  if (contentTypes.length) {
    redirect(`/content/${contentTypes[0].slug}`)
  }
  redirect('/content-types')
}
