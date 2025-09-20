'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
  userTenants: TenantMembership[]
  currentTenant: string | null
  setCurrentTenant: (tenantId: string) => void
}

interface TenantMembership {
  tenantId: string
  role: string
  tenant: {
    id: string
    name: string
    slug: string
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [userTenants, setUserTenants] = useState<TenantMembership[]>([])
  const [currentTenant, setCurrentTenant] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutId = setTimeout(() => {
          console.warn('Auth session timeout, continuing without auth')
          setLoading(false)
        }, 10000) // 10 second timeout

        const { data: { session }, error } = await supabase.auth.getSession()
        clearTimeout(timeoutId)

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)
      } catch (error) {
        console.error('Fatal auth error:', error)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)

        if (session?.user) {
          // Ensure user exists in database
          await ensureUserInDatabase(session.user)
          // Fetch user's tenant memberships
          await fetchUserTenants(session.user.id)
        } else {
          setUserTenants([])
          setCurrentTenant(null)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  // Ensure user exists in our database
  const ensureUserInDatabase = async (user: User) => {
    try {
      await fetch('/api/users/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          email: user.email,
          firstName: user.user_metadata?.firstName || user.user_metadata?.first_name,
          lastName: user.user_metadata?.lastName || user.user_metadata?.last_name,
          avatarUrl: user.user_metadata?.avatarUrl || user.user_metadata?.avatar_url
        })
      })
    } catch (error) {
      console.error('Error syncing user to database:', error)
    }
  }

  // Fetch user's tenant memberships
  const fetchUserTenants = async (userId: string) => {
    console.log('🔍 AuthContext: Starting fetchUserTenants for userId:', userId)
    console.log('🌐 AuthContext: User agent:', navigator.userAgent)
    console.log('📱 AuthContext: Screen size:', window.innerWidth, 'x', window.innerHeight)

    try {
      // Add timeout for tenant fetching
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Tenant fetch timeout, continuing without tenants')
      }, 5000) // 5 second timeout

      console.log('📡 AuthContext: Querying tenant_memberships...')
      console.log('🔗 AuthContext: Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)

      const { data, error } = await supabase
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
        .eq('userId', userId)

      clearTimeout(timeoutId)
      console.log('📊 AuthContext: Query result - data:', data, 'error:', error)
      console.log('🔄 AuthContext: Data length:', data?.length || 0)

      if (error) {
        console.error('❌ Error fetching user tenants:', error)
        console.error('❌ Error details:', {
          message: error.message,
          code: error.code,
          hint: error.hint
        })
        // Don't return - continue with empty tenants
        setUserTenants([])
        return
      }

      const memberships = data?.map(item => ({
        tenantId: item.tenantId,
        role: item.role,
        tenant: Array.isArray(item.tenant) ? item.tenant[0] : item.tenant
      })) as TenantMembership[] || []

      console.log('✅ AuthContext: Processed memberships:', memberships)
      console.log('📋 AuthContext: Membership count:', memberships.length)
      console.log('🏢 AuthContext: Organization names:', memberships.map(m => m.tenant.name))

      setUserTenants(memberships)

      // Set current tenant to first available if none set
      if (memberships.length > 0 && !currentTenant) {
        console.log('🏢 AuthContext: Setting current tenant to:', memberships[0].tenantId)
        setCurrentTenant(memberships[0].tenantId)
      } else if (memberships.length === 0) {
        console.log('📭 AuthContext: No tenant memberships found for user')
      }
    } catch (error) {
      console.error('❌ Error in fetchUserTenants:', error)
      console.error('❌ Catch block error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack'
      })
      // Continue with empty tenants on error
      setUserTenants([])
    }
  }

  // Sign out function
  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      console.error('Error signing out:', error)
      throw error
    }

    setUser(null)
    setSession(null)
    setUserTenants([])
    setCurrentTenant(null)
  }

  const value: AuthContextType = {
    user,
    session,
    loading,
    signOut,
    userTenants,
    currentTenant,
    setCurrentTenant
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Hook to get current tenant data
export function useCurrentTenant() {
  const { userTenants, currentTenant } = useAuth()

  const tenantData = userTenants.find(
    membership => membership.tenantId === currentTenant
  )

  return {
    tenantId: currentTenant,
    tenant: tenantData?.tenant,
    role: tenantData?.role,
    hasAccess: !!tenantData
  }
}