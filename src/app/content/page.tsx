import Link from 'next/link'
import { getContentTypesViewerAction } from '@/lib/clerk/actions'
import { getTranslations } from '@/i18n/server'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const t = await getTranslations()
  const contentTypes = await getContentTypesViewerAction()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-semibold text-2xl">
          {t('routes.content.types.title')}
        </h1>
        <p className="text-muted-foreground">
          {t('routes.content.types.description')}
        </p>
      </div>

      {contentTypes.length ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {contentTypes.map(contentType => (
            <Link
              className="group rounded-lg border bg-card p-4 transition-colors hover:border-primary"
              href={`/content/${contentType.slug}`}
              key={contentType.id}
            >
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="font-semibold text-base text-foreground">
                    {contentType.name}
                  </h2>
                  {contentType.description ? (
                    <p className="text-muted-foreground text-sm">
                      {contentType.description}
                    </p>
                  ) : null}
                </div>
                <span className="text-muted-foreground text-sm">
                  {contentType.fields.length}
                </span>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-lg border bg-muted/40 p-6 text-muted-foreground">
          {t('routes.content.types.empty')}
        </div>
      )}
    </div>
  )
}
