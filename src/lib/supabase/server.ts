import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({ name, value: '', ...options })
          } catch (error) {
            // The `delete` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}

// Helper function to get authenticated user
export async function getUser() {
  const supabase = createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  return user
}

// Helper function to validate user has access to tenant
export async function validateTenantAccess(tenantId: string) {
  const user = await getUser()

  if (!user) {
    throw new Error('Unauthorized: No user session')
  }

  // Check if user has membership in this tenant
  const supabase = createClient()
  const { data: membership } = await supabase
    .from('tenant_memberships')
    .select('role')
    .eq('tenantId', tenantId)
    .eq('userId', user.id)
    .single()

  if (!membership) {
    throw new Error('Unauthorized: No access to this tenant')
  }

  return { user, role: membership.role }
}