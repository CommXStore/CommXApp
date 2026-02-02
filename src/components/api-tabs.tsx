'use client'

import { useState, useMemo } from 'react'
import { CodeTabs } from '@/components/animate-ui/components/animate/code-tabs'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslations } from '@/i18n/provider'

const SITE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

type ContentType = {
  id: string
  name: string
  slug: string
  status: 'draft' | 'published'
  fields: string[]
  createdAt: string
  updatedAt: string
  description?: string
  icon?: string
}

type ApiTabsProps = {
  contentTypes: ContentType[]
}

export function ApiTabs({ contentTypes }: ApiTabsProps) {
  const [apiKey, setApiKey] = useState('')
  const t = useTranslations()

  const agentsCodes = useMemo(() => {
    const safeApiKey = apiKey.trim() || '<API_KEY>'
    return {
      'get-agents': t('routes.agents.requestTester.codes.getAgents', {
        siteUrl: SITE_URL,
        apiKey: safeApiKey,
      }),
      'create-agent': t('routes.agents.requestTester.codes.createAgent', {
        siteUrl: SITE_URL,
        apiKey: safeApiKey,
      }),
      'delete-agent': t('routes.agents.requestTester.codes.deleteAgent', {
        siteUrl: SITE_URL,
        apiKey: safeApiKey,
      }),
    }
  }, [apiKey, t])
  const publishedTypes = contentTypes.filter(ct => ct.status === 'published')

  function generateEntryCodes(slug: string) {
    const safeApiKey = apiKey.trim() || '<API_KEY>'
    return {
      [`get-${slug}`]: `curl -X GET ${SITE_URL}/api/content/${slug} \\
  -H "Authorization: Bearer ${safeApiKey}"`,
      [`create-${slug}`]: `curl -X POST ${SITE_URL}/api/content/${slug} \\
  -H "Authorization: Bearer ${safeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {}}'`,
      [`get-${slug}-entry`]: `curl -X GET ${SITE_URL}/api/content/${slug}/entry_1 \\
  -H "Authorization: Bearer ${safeApiKey}"`,
      [`update-${slug}-entry`]: `curl -X PATCH ${SITE_URL}/api/content/${slug}/entry_1 \\
  -H "Authorization: Bearer ${safeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"data": {}}'`,
      [`delete-${slug}-entry`]: `curl -X DELETE ${SITE_URL}/api/content/${slug}/entry_1 \\
  -H "Authorization: Bearer ${safeApiKey}"`,
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="max-w-md">
        <Input
          onChange={e => setApiKey(e.target.value)}
          placeholder={t('routes.settings.apiKeys.apiUsage.inputPlaceholder')}
          type="text"
          value={apiKey}
        />
      </div>
      <Tabs className="w-full" defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">
            {t('routes.settings.apiKeys.apiUsage.tabs.agents')}
          </TabsTrigger>
          <TabsTrigger value="contentTypes">
            {t('routes.settings.apiKeys.apiUsage.tabs.contentTypes')}
          </TabsTrigger>
        </TabsList>
        <TabsContent value="agents">
          <CodeTabs
            codes={agentsCodes}
            lang="bash"
            onCopiedChange={async (copied, content) => {
              if (!(copied && content)) {
                return
              }
              await navigator.clipboard.writeText(content)
            }}
          />
        </TabsContent>
        <TabsContent value="contentTypes">
          {publishedTypes.length === 0 ? (
            <div className="rounded-lg border bg-muted/30 p-4 text-center text-muted-foreground">
              {t('routes.settings.apiKeys.apiUsage.noContentTypes')}
            </div>
          ) : (
            <Tabs className="w-full">
              <TabsList className="mb-4">
                {publishedTypes.map(ct => (
                  <TabsTrigger key={ct.id} value={ct.slug}>
                    {ct.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              {publishedTypes.map(ct => (
                <TabsContent key={ct.id} value={ct.slug}>
                  <div className="mb-2 text-muted-foreground text-sm">
                    Rotas de API para entradas do tipo &quot;{ct.name}&quot;
                  </div>
                  <CodeTabs
                    codes={generateEntryCodes(ct.slug)}
                    lang="bash"
                    onCopiedChange={async (copied, content) => {
                      if (!(copied && content)) {
                        return
                      }
                      await navigator.clipboard.writeText(content)
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
