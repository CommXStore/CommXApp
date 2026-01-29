import { z } from 'zod'

export const contentTypeStatusSchema = z.enum(['draft', 'published'])
export const customFieldTypeSchema = z.enum([
  'text',
  'number',
  'boolean',
  'date',
  'select',
])

export const contentTypeSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().optional(),
  status: contentTypeStatusSchema,
  icon: z.string().optional(),
  fields: z.array(z.string()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1),
  key: z.string().min(1),
  type: customFieldTypeSchema,
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  helpText: z.string().optional(),
  attachedTo: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const contentEntrySchema = z.object({
  id: z.string(),
  contentTypeId: z.string(),
  slug: z.string().min(1),
  status: contentTypeStatusSchema,
  fields: z.record(z.string(), z.unknown()),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const contentTypeInputSchema = contentTypeSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().optional(),
    slug: z.string().optional(),
    fields: z.array(z.string()).optional(),
  })

export const customFieldInputSchema = customFieldSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().optional(),
    key: z.string().optional(),
    options: z.array(z.string()).optional(),
    attachedTo: z.string().nullable().optional(),
  })

export const contentEntryInputSchema = contentEntrySchema
  .omit({
    id: true,
    contentTypeId: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().optional(),
    slug: z.string().optional(),
    status: contentTypeStatusSchema.optional(),
    fields: z.record(z.string(), z.unknown()).optional(),
  })

export type ContentType = z.infer<typeof contentTypeSchema>
export type CustomField = z.infer<typeof customFieldSchema>
export type ContentEntry = z.infer<typeof contentEntrySchema>
export type ContentTypeInput = z.input<typeof contentTypeInputSchema>
export type CustomFieldInput = z.input<typeof customFieldInputSchema>
export type ContentEntryInput = z.input<typeof contentEntryInputSchema>

export function parseContentTypes(value: unknown): ContentType[] {
  const parsed = z.array(contentTypeSchema).safeParse(value)
  return parsed.success ? parsed.data : []
}

export function parseCustomFields(value: unknown): CustomField[] {
  const parsed = z.array(customFieldSchema).safeParse(value)
  return parsed.success ? parsed.data : []
}

export function parseContentEntries(value: unknown): Record<string, ContentEntry[]> {
  const parsed = z
    .record(z.string(), z.array(contentEntrySchema))
    .safeParse(value)
  return parsed.success ? parsed.data : {}
}
