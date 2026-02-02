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

export function ApiTabs() {
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

  const contentTypesCodes = useMemo(() => {
    const safeApiKey = apiKey.trim() || '<API_KEY>'
    return {
      'get-content-types': `curl -X GET ${SITE_URL}/api/content-types \\
  -H "Authorization: Bearer ${safeApiKey}"`,
      'create-content-type': `curl -X POST ${SITE_URL}/api/content-types \\
  -H "Authorization: Bearer ${safeApiKey}" \\
  -H "Content-Type: application/json" \\
  -d '{"name": "Meu Tipo", "slug": "meu-tipo", "description": "Descrição do tipo"}'`,
      'get-content-type': `curl -X GET ${SITE_URL}/api/content-types/ct_1 \\
  -H "Authorization: Bearer ${safeApiKey}"`,
    }
  }, [apiKey])

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
          <CodeTabs
            codes={contentTypesCodes}
            lang="bash"
            onCopiedChange={async (copied, content) => {
              if (!(copied && content)) {
                return
              }
              await navigator.clipboard.writeText(content)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
