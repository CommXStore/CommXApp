'use client'

import { useState, useMemo } from 'react'
import { CodeTabs } from '@/components/animate-ui/components/animate/code-tabs'
import { Input } from '@/components/ui/input'
import { useTranslations } from '@/i18n/provider'

const SITE_URL =
  process.env.NODE_ENV === 'development'
    ? 'http://localhost:3000'
    : `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`

export function RequestTester() {
  const [apiKey, setApiKey] = useState('')
  const t = useTranslations()

  const codes = useMemo(() => {
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

  return (
    <div className="flex flex-col gap-2">
      <div className="max-w-md">
        <Input
          onChange={e => setApiKey(e.target.value)}
          placeholder={t('routes.agents.requestTester.inputPlaceholder')}
          type="text"
          value={apiKey}
        />
      </div>
      <CodeTabs
        codes={codes}
        lang="bash"
        onCopiedChange={async (copied, content) => {
          if (!(copied && content)) {
            return
          }
          await navigator.clipboard.writeText(content)
        }}
      />
    </div>
  )
}
