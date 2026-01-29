import { ContentTypeForm } from '@/components/content-type-form'
import { getCustomFieldsAction } from '@/lib/clerk/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const customFields = await getCustomFieldsAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Novo tipo de conteúdo</h1>
        <p className="text-muted-foreground">
          Crie um tipo de conteúdo personalizado.
        </p>
      </div>
      <ContentTypeForm customFields={customFields} mode="create" />
    </div>
  )
}
