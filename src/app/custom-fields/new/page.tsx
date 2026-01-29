import { CustomFieldForm } from '@/components/custom-field-form'
import { getContentTypesAction } from '@/lib/clerk/actions'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const contentTypes = await getContentTypesAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">Novo campo personalizado</h1>
        <p className="text-muted-foreground">
          Crie um campo e vincule a um tipo de conteúdo.
        </p>
      </div>
      <CustomFieldForm contentTypes={contentTypes} mode="create" />
    </div>
  )
}
