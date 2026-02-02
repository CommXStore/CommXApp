type FeatureObject = { slug?: string | null; name?: string | null }

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
        const obj = item as FeatureObject
        const candidate = obj.slug ?? obj.name
        return typeof candidate === 'string' ? candidate.trim() : ''
      }
      return ''
    })
    .filter(Boolean)
}
