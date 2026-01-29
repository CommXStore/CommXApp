import { notFound } from 'next/navigation'
import { CustomFieldForm } from '@/components/custom-field-form'
import {
  getContentTypesAction,
  getCustomFieldAction,
} from '@/lib/clerk/actions'

type PageProps = {
  params: { id: string }
}

export const dynamic = 'force-dynamic'

export default async function Page({ params }: PageProps) {
  const [customField, contentTypes] = await Promise.all([
    getCustomFieldAction(params.id),
    getContentTypesAction(),
  ])

  if (!customField) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Editar campo personalizado</h1>
        <p className="text-muted-foreground">
          Atualize os dados do campo personalizado.
        </p>
      </div>
      <CustomFieldForm
        contentTypes={contentTypes}
        initialData={customField}
        mode="edit"
      />
    </div>
  )
}
