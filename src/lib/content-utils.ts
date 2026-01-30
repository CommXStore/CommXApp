export function normalizeKebabCase(value: string) {
  const normalized = value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')

  return normalized
}

const KEBAB_CASE_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isKebabCase(value: string) {
  return KEBAB_CASE_REGEX.test(value)
}

export function nowIso() {
  return new Date().toISOString()
}
