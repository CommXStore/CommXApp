type FeatureInput =
  | string
  | { slug?: string | null; name?: string | null }
  | null
  | undefined

export function normalizeFeatureList(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return value
    .map(item => {
      if (typeof item === 'string') {
        return item.trim()
      }
      if (item && typeof item === 'object') {
        const candidate =
          (item as FeatureInput).slug ?? (item as FeatureInput).name
        return typeof candidate === 'string' ? candidate.trim() : ''
      }
      return ''
    })
    .filter(Boolean)
}
