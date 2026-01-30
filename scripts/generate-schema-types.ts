import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { zodToTs, printNode } from 'zod-to-ts'
import {
  contentTypeSchema,
  customFieldSchema,
  contentEntrySchema,
} from '../src/lib/clerk/content-schemas'

const definitions = [
  { name: 'ContentType', schema: contentTypeSchema },
  { name: 'CustomField', schema: customFieldSchema },
  { name: 'ContentEntry', schema: contentEntrySchema },
]

const TYPE_PREFIX = /^type /

const types = definitions
  .map(({ name, schema }) => {
    const { node } = zodToTs(schema, name)
    return printNode(node).replace(TYPE_PREFIX, 'export type ')
  })
  .join('\n\n')

const header = '// Generated file. Do not edit manually.\n'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const outputPath = path.join(
  __dirname,
  '..',
  'src',
  'lib',
  'clerk',
  'content-schemas.generated.ts'
)

await fs.writeFile(outputPath, `${header}\n${types}\n`, 'utf-8')

console.log(`Generated schema types at ${outputPath}`)
