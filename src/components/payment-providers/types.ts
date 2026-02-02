export type PaymentProvider = {
  id: string
  name: string
  type: string
  enabled: boolean
  metadata?: Record<string, unknown>
}
