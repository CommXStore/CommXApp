export const cacheTags = {
  agents: (orgId: string) => `agents:${orgId}`,
  contentTypes: (orgId: string) => `content-types:${orgId}`,
  customFields: (orgId: string) => `custom-fields:${orgId}`,
  contentEntries: (orgId: string, slug: string) =>
    `content-entries:${orgId}:${slug}`,
}
