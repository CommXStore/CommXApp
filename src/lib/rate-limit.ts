import type { NextRequest } from 'next/server'

type RateLimitEntry = {
  count: number
  resetAt: number
}

type RateLimitResult = {
  allowed: boolean
  remaining: number
  resetInMs: number
}

const storeKey = '__commx_rate_limit__'

function getStore(): Map<string, RateLimitEntry> {
  const globalStore = globalThis as typeof globalThis & {
    [storeKey]?: Map<string, RateLimitEntry>
  }

  if (!globalStore[storeKey]) {
    globalStore[storeKey] = new Map()
  }

  return globalStore[storeKey]
}

export function getClientIp(req: NextRequest) {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    return forwarded.split(',')[0]?.trim() || 'unknown'
  }
  return req.headers.get('x-real-ip') || 'unknown'
}

export function checkRateLimit(
  key: string,
  limit: number,
  windowMs: number
): RateLimitResult {
  const store = getStore()
  const now = Date.now()
  const existing = store.get(key)

  if (!existing || now > existing.resetAt) {
    const resetAt = now + windowMs
    store.set(key, { count: 1, resetAt })
    return {
      allowed: true,
      remaining: limit - 1,
      resetInMs: resetAt - now,
    }
  }

  if (existing.count >= limit) {
    return {
      allowed: false,
      remaining: 0,
      resetInMs: existing.resetAt - now,
    }
  }

  const nextCount = existing.count + 1
  store.set(key, { count: nextCount, resetAt: existing.resetAt })

  return {
    allowed: true,
    remaining: limit - nextCount,
    resetInMs: existing.resetAt - now,
  }
}
