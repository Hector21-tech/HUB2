import { createClient } from '@/lib/supabase/server'

export interface TenantValidationResult {
  tenantId: string
  tenantSlug: string
  userRole: 'OWNER' | 'ADMIN' | 'MANAGER' | 'SCOUT' | 'VIEWER'
  success: true
}

export interface TenantValidationError {
  success: false
  reason: 'tenant_missing' | 'tenant_not_found' | 'not_member' | 'insufficient_role' | 'db_error'
  message: string
}

/**
 * Validates that a user has ADMIN or OWNER access to a tenant via Supabase RLS
 *
 * @param tenantSlug - The tenant slug from URL parameter
 * @returns Promise<TenantValidationResult | TenantValidationError>
 */
export async function validateSupabaseTenantAccess(
  tenantSlug: string | null
): Promise<TenantValidationResult | TenantValidationError> {

  // Check if tenant slug is provided
  if (!tenantSlug || tenantSlug.trim() === '') {
    return {
      success: false,
      reason: 'tenant_missing',
      message: 'Tenant slug parameter is required'
    }
  }

  try {
    const supabase = createClient()

    // Get current user from Supabase session
    const { data: { user }, error: userError } = await supabase.auth.getUser()

    if (userError || !user) {
      return {
        success: false,
        reason: 'not_member',
        message: 'User not authenticated'
      }
    }

    console.log('🔍 Supabase Tenant Validation: Starting for user:', user.id, 'tenant:', tenantSlug)

    // Step 1: Look up tenant by slug
    const { data: tenant, error: tenantError } = await supabase
      .from('tenants')
      .select('id, slug, name')
      .eq('slug', tenantSlug)
      .single()

    if (tenantError || !tenant) {
      console.log('❌ Tenant not found:', tenantSlug, tenantError?.message)
      return {
        success: false,
        reason: 'tenant_not_found',
        message: `Tenant '${tenantSlug}' not found`
      }
    }

    console.log('✅ Tenant found:', tenant.id, tenant.name)

    // Step 2: Check if user is member with ADMIN or OWNER role
    const { data: membership, error: memberError } = await supabase
      .from('tenant_memberships')
      .select('tenantId, role')
      .eq('tenantId', tenant.id)
      .eq('userId', user.id)
      .single()

    if (memberError || !membership) {
      console.log('❌ User not member of tenant:', user.id, tenant.id, memberError?.message)
      return {
        success: false,
        reason: 'not_member',
        message: `User is not a member of tenant '${tenantSlug}'`
      }
    }

    // Step 3: Verify user has sufficient role (ADMIN or OWNER)
    const allowedRoles = ['ADMIN', 'OWNER']
    if (!allowedRoles.includes(membership.role)) {
      console.log('❌ Insufficient role:', membership.role, 'Required:', allowedRoles)
      return {
        success: false,
        reason: 'insufficient_role',
        message: `User role '${membership.role}' insufficient. Required: ADMIN or OWNER`
      }
    }

    console.log('✅ Supabase Tenant Validation: Success for', user.id, 'in', tenant.id, 'as', membership.role)

    return {
      success: true,
      tenantId: tenant.id,
      tenantSlug: tenant.slug,
      userRole: membership.role as 'OWNER' | 'ADMIN' | 'MANAGER' | 'SCOUT' | 'VIEWER'
    }

  } catch (error) {
    console.error('❌ Supabase Tenant Validation: Database error:', error)
    return {
      success: false,
      reason: 'db_error',
      message: error instanceof Error ? error.message : 'Database connection error'
    }
  }
}

/**
 * Creates a Supabase client with tenant context for data operations
 * Call this after successful tenant validation
 */
export function createTenantSupabaseClient() {
  return createClient()
}