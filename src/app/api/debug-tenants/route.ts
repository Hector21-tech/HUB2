import { NextRequest, NextResponse } from 'next/server'
import { getUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Starting tenant membership debugging...')

    // Get authenticated user
    const user = await getUser()
    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Not authenticated',
        user: null
      })
    }

    console.log('👤 Debug: User found:', user.id)

    // Create client for RLS testing
    const supabase = createClient()

    // Test direct tenant_memberships query
    console.log('📡 Debug: Testing tenant_memberships query...')
    const { data: memberships, error: membershipError } = await supabase
      .from('tenant_memberships')
      .select('*')
      .eq('userId', user.id)

    console.log('📊 Debug: Direct memberships result:', { memberships, membershipError })

    // Test with join
    console.log('📡 Debug: Testing with tenant join...')
    const { data: withJoin, error: joinError } = await supabase
      .from('tenant_memberships')
      .select(`
        tenantId,
        role,
        tenant:tenants!inner (
          id,
          name,
          slug
        )
      `)
      .eq('userId', user.id)

    console.log('📊 Debug: With join result:', { withJoin, joinError })

    // Test tenants table directly
    console.log('📡 Debug: Testing tenants table...')
    const { data: tenants, error: tenantsError } = await supabase
      .from('tenants')
      .select('*')

    console.log('📊 Debug: Tenants result:', { tenants, tenantsError })

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email
      },
      debug: {
        directMemberships: { data: memberships, error: membershipError },
        withJoin: { data: withJoin, error: joinError },
        tenants: { data: tenants, error: tenantsError }
      }
    })

  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: 'Debug failed',
      details: error instanceof Error ? error.message : String(error)
    })
  }
}