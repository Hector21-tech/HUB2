'use client'

import { useParams } from 'next/navigation'
import { useAuth } from '@/lib/auth/AuthContext'

/**
 * Hook to get current tenant information from URL slug
 * Returns tenant ID, slug, and tenant data from auth context
 */
export function useTenantSlug() {
  const params = useParams()
  const { userTenants, currentTenant, setCurrentTenant } = useAuth()

  const tenantSlug = params?.tenant as string

  // Find tenant by slug from user's memberships
  const tenantData = userTenants.find(
    membership => membership.tenant.slug === tenantSlug
  )

  // Debug logging
  console.log('🔍 useTenantSlug Debug:', {
    tenantSlug,
    userTenants: userTenants.map(t => ({ slug: t.tenant.slug, id: t.tenantId })),
    found: !!tenantData,
    tenantId: tenantData?.tenantId
  })

  // Auto-set current tenant if it matches the URL and is different
  if (tenantData && currentTenant !== tenantData.tenantId) {
    setCurrentTenant(tenantData.tenantId)
  }

  return {
    tenantSlug,
    tenantId: tenantData?.tenantId || null,
    tenant: tenantData?.tenant || null,
    role: tenantData?.role || null,
    hasAccess: !!tenantData
  }
}