import fs from 'node:fs/promises'
import process from 'node:process'
import { clerkClient } from '@clerk/nextjs/server'

const [organizationId, outputPath] = process.argv.slice(2)

if (!(organizationId && outputPath)) {
  console.error(
    'Usage: node scripts/export-content-metadata.mjs <orgId> <outputPath>'
  )
  process.exit(1)
}

const clerk = await clerkClient()
const org = await clerk.organizations.getOrganization({ organizationId })
const publicMetadata = org.publicMetadata ?? {}

const payload = {
  contentTypes: publicMetadata.contentTypes ?? [],
  customFields: publicMetadata.customFields ?? [],
  contentEntries: publicMetadata.contentEntries ?? {},
  contentSnapshots: publicMetadata.contentSnapshots ?? [],
}

await fs.writeFile(outputPath, JSON.stringify(payload, null, 2), 'utf-8')
console.log(`Exported content metadata for ${organizationId} to ${outputPath}`)
