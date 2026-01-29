import fs from 'node:fs/promises'
import process from 'node:process'
import { clerkClient } from '@clerk/nextjs/server'

const [organizationId, inputPath] = process.argv.slice(2)

if (!organizationId || !inputPath) {
  console.error('Usage: node scripts/import-content-metadata.mjs <orgId> <inputPath>')
  process.exit(1)
}

const raw = await fs.readFile(inputPath, 'utf-8')
const data = JSON.parse(raw)

const nextContentTypes = Array.isArray(data.contentTypes) ? data.contentTypes : []
const nextCustomFields = Array.isArray(data.customFields) ? data.customFields : []
const nextContentEntries = typeof data.contentEntries === 'object' && data.contentEntries
  ? data.contentEntries
  : {}
const nextSnapshots = Array.isArray(data.contentSnapshots) ? data.contentSnapshots : []

const clerk = await clerkClient()
const org = await clerk.organizations.getOrganization({ organizationId })
const publicMetadata = org.publicMetadata ?? {}

await clerk.organizations.updateOrganizationMetadata(organizationId, {
  publicMetadata: {
    ...publicMetadata,
    contentTypes: nextContentTypes,
    customFields: nextCustomFields,
    contentEntries: nextContentEntries,
    contentSnapshots: nextSnapshots,
  },
})

console.log(`Imported content metadata for ${organizationId} from ${inputPath}`)
