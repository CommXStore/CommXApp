// Generated file. Do not edit manually.

export type ContentType = {
  id: string
  name: string
  slug: string
  description?: string
  status: 'draft' | 'published'
  icon?: string
  fields: string[]
  createdAt: string
  updatedAt: string
}

export type CustomField = {
  id: string
  label: string
  key: string
  type: 'text' | 'number' | 'boolean' | 'date' | 'select'
  options?: string[]
  required: boolean
  helpText?: string
  attachedTo: string[]
  createdAt: string
  updatedAt: string
}

export type ContentEntry = {
  id: string
  contentTypeId: string
  slug: string
  status: 'draft' | 'published'
  fields: Record<string, unknown>
  createdAt: string
  updatedAt: string
}
