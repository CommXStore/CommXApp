import { unstable_cache } from 'next/cache'

export function withCache<T>(
  keyParts: string[],
  tags: string[],
  fn: () => Promise<T>
) {
  const cached = unstable_cache(fn, keyParts, { tags })
  return cached()
}
