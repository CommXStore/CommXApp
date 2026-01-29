import { ContentEntryForm } from '@/components/content-entry-form'
import { getContentEntriesAction } from '@/lib/clerk/actions'

type PageProps = {
  params: Promise<{ contentTypeSlug: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const { contentTypeSlug } = await params
  const { contentType, fields } = await getContentEntriesAction(contentTypeSlug)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Nova entrada</h1>
        <p className="text-muted-foreground">
          Criando entrada para {contentType.name}.
        </p>
      </div>
      <ContentEntryForm contentType={contentType} fields={fields} mode="create" />
    </div>
  )
}
