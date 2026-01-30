import { auth } from '@clerk/nextjs/server'
import type { TokenType } from '@clerk/backend/internal'

const errors = {
  unauthorized: {
    message: 'Unauthorized',
    status: 401,
  },
  missingOrg: {
    message: 'Organization not found. Did you use an org-scoped API key?',
    status: 404,
  },
  forbidden: {
    message: 'Forbidden',
    status: 403,
  },
}

type CheckAuthResponse =
  | {
      success: true
      error?: null
      data: {
        tokenType: TokenType
        userId: string | null
        orgId: string
        orgRole?: string
        orgPermissions?: string[]
      }
    }
  | {
      success: false
      error: { message: string; status: number }
      data?: null
    }

export async function checkAuth(): Promise<CheckAuthResponse> {
  // Needs to have the `acceptsToken: 'api_key'` or it will only accept session tokens
  const res = await auth({ acceptsToken: ['api_key', 'session_token'] })

  if (!res.isAuthenticated) {
    return { success: false, error: errors.unauthorized }
  }
  if (!res.orgId) {
    return { success: false, error: errors.missingOrg }
  }

  return {
    success: true,
    data: {
      tokenType: res.tokenType,
      userId: res.userId,
      orgId: res.orgId,
      orgRole: res.orgRole ?? undefined,
      orgPermissions: res.orgPermissions ?? undefined,
    },
  }
}

export async function checkAdmin(): Promise<CheckAuthResponse> {
  const result = await checkAuth()
  if (!result.success) {
    return result
  }
  if (result.data.orgRole !== 'org:admin') {
    return { success: false, error: errors.forbidden }
  }
  return result
}
