import { NextResponse, type NextRequest } from 'next/server'
import { logger } from '@/lib/logger'
import { buildLogContext } from '@/lib/logger-context'

export function GET(req: NextRequest) {
  logger.info(
    { ...buildLogContext('GET /api/webhooks/clerk/health', undefined, req) },
    'Webhook health check.'
  )
  return NextResponse.json(
    {
      ok: true,
      webhookSecretConfigured: Boolean(process.env.CLERK_WEBHOOK_SECRET),
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  )
}
