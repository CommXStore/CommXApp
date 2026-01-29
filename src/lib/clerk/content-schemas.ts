import { z } from 'zod'

const MAX_NAME_LENGTH = 120
const MAX_SLUG_LENGTH = 120
const MAX_DESCRIPTION_LENGTH = 500
const MAX_LABEL_LENGTH = 120
const MAX_KEY_LENGTH = 120
const MAX_HELP_TEXT_LENGTH = 240
const MAX_OPTION_LENGTH = 120
const MAX_OPTIONS_COUNT = 50
const MAX_FIELDS_COUNT = 100
const MAX_FIELDS_DEPTH = 3

const isWithinDepth = (value: unknown, maxDepth: number): boolean => {
  if (maxDepth < 0) {
    return false
  }
  if (value === null || typeof value !== 'object') {
    return true
  }
  if (Array.isArray(value)) {
    return value.every(item => isWithinDepth(item, maxDepth - 1))
  }
  return Object.values(value as Record<string, unknown>).every(item =>
    isWithinDepth(item, maxDepth - 1)
  )
}

const contentEntryFieldsSchema = z
  .record(z.string().max(MAX_KEY_LENGTH), z.unknown())
  .superRefine((value, ctx) => {
    if (Object.keys(value).length > MAX_FIELDS_COUNT) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Too many fields',
      })
    }
    if (!isWithinDepth(value, MAX_FIELDS_DEPTH)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Fields exceed maximum depth',
      })
    }
  })

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
  name: z.string().min(1).max(MAX_NAME_LENGTH),
  slug: z.string().min(1).max(MAX_SLUG_LENGTH),
  description: z.string().max(MAX_DESCRIPTION_LENGTH).optional(),
  status: contentTypeStatusSchema,
  icon: z.string().max(MAX_NAME_LENGTH).optional(),
  fields: z.array(z.string().max(MAX_KEY_LENGTH)).max(MAX_FIELDS_COUNT),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const customFieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1).max(MAX_LABEL_LENGTH),
  key: z.string().min(1).max(MAX_KEY_LENGTH),
  type: customFieldTypeSchema,
  options: z
    .array(z.string().min(1).max(MAX_OPTION_LENGTH))
    .max(MAX_OPTIONS_COUNT)
    .optional(),
  required: z.boolean(),
  helpText: z.string().max(MAX_HELP_TEXT_LENGTH).optional(),
  attachedTo: z.preprocess(
    value => {
      if (Array.isArray(value)) {
        return value
      }
      if (typeof value === 'string' && value.length > 0) {
        return [value]
      }
      return []
    },
    z.array(z.string())
  ),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export const contentEntrySchema = z.object({
  id: z.string(),
  contentTypeId: z.string(),
  slug: z.string().min(1).max(MAX_SLUG_LENGTH),
  status: contentTypeStatusSchema,
  fields: contentEntryFieldsSchema,
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
    slug: z.string().max(MAX_SLUG_LENGTH).optional(),
    fields: z.array(z.string().max(MAX_KEY_LENGTH)).max(MAX_FIELDS_COUNT).optional(),
  })

export const customFieldInputSchema = customFieldSchema
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .extend({
    id: z.string().optional(),
    key: z.string().max(MAX_KEY_LENGTH).optional(),
    options: z
      .array(z.string().min(1).max(MAX_OPTION_LENGTH))
      .max(MAX_OPTIONS_COUNT)
      .optional(),
    attachedTo: z.array(z.string().max(MAX_KEY_LENGTH)).optional(),
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
    slug: z.string().max(MAX_SLUG_LENGTH).optional(),
    status: contentTypeStatusSchema.optional(),
    fields: contentEntryFieldsSchema.optional(),
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
