import { notFound } from 'next/navigation'
import { ContentEntryForm } from '@/components/content-entry-form'
import { getContentEntryAction } from '@/lib/clerk/actions'

type PageProps = {
  params: Promise<{ contentTypeSlug: string; entryId: string }>
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const { contentTypeSlug, entryId } = await params
  const { contentType, entry, fields } = await getContentEntryAction(
    contentTypeSlug,
    entryId
  )

  if (!entry) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Editar entrada</h1>
        <p className="text-muted-foreground">
          Atualize a entrada de {contentType.name}.
        </p>
      </div>
      <ContentEntryForm
        contentType={contentType}
        fields={fields}
        initialData={entry}
        mode="edit"
      />
    </div>
  )
}
