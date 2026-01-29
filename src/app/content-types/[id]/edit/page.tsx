import { notFound } from 'next/navigation'
import { ContentTypeForm } from '@/components/content-type-form'
import {
  getContentTypeAction,
  getCustomFieldsAction,
} from '@/lib/clerk/actions'

type PageProps = {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const [contentType, customFields] = await Promise.all([
    getContentTypeAction(params.id),
    getCustomFieldsAction(),
  ])

  if (!contentType) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Editar tipo de conteúdo</h1>
        <p className="text-muted-foreground">
          Atualize as informações do tipo de conteúdo.
        </p>
      </div>
      <ContentTypeForm
        customFields={customFields}
        initialData={contentType}
        mode="edit"
      />
    </div>
  )
}
