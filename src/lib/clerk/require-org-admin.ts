import { redirect } from 'next/navigation'
import { checkAdmin } from './check-auth'

export async function requireOrgAdmin() {
  const result = await checkAdmin()
  if (!result.success) {
    if (result.error.status === 401) {
      redirect('/sign-in')
    }
    redirect('/dashboard')
  }

  return result.data
}
