export type TranslationParams = Record<string, string | number>

export type MessageValue = string | Record<string, unknown>

export function resolveMessage(
  messages: Record<string, MessageValue>,
  key: string
): string | undefined {
  const parts = key.split('.')
  let current: MessageValue | undefined = messages
  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return
    }
    current = (current as Record<string, unknown>)[part] as
      | MessageValue
      | undefined
  }
  return typeof current === 'string' ? current : undefined
}

export function formatMessage(
  message: string,
  params?: TranslationParams
): string {
  if (!params) {
    return message
  }
  return message.replace(/\{(\w+)\}/g, (_match, key) => {
    const value = params[key]
    return value === undefined ? `{${key}}` : String(value)
  })
}
