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
      console.log('🔐 AuthContext: Starting session initialization...')

      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⏰ AuthContext: Session timeout, setting loading to false')
        setLoading(false)
      }, 8000) // 8 second timeout

      try {
        console.log('🔐 AuthContext: Getting session from Supabase...')

        // First try to get session
        const { data: { session }, error } = await supabase.auth.getSession()

        clearTimeout(timeoutId) // Clear timeout if we get a response

        console.log('🔐 AuthContext: Session result:', {
          hasSession: !!session,
          hasUser: !!session?.user,
          error: error?.message
        })

        if (error) {
          console.error('Error getting session:', error)
          setLoading(false)
          return
        }

        setSession(session)
        setUser(session?.user ?? null)

        // If we have a user, fetch their tenants
        if (session?.user) {
          console.log('🔐 AuthContext: User found, fetching tenants...')
          await fetchUserTenants(session.user.id)
        } else {
          console.log('🔐 AuthContext: No user found in session')
        }

        setLoading(false)
        console.log('🔐 AuthContext: Session initialization complete')
      } catch (error) {
        clearTimeout(timeoutId)
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
    console.log('🔍 AuthContext: fetchUserTenants started for user:', userId)
    try {
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

      console.log('📊 AuthContext: Query result:', { data, error, dataLength: data?.length })

      if (error) {
        console.error('❌ AuthContext: Error fetching user tenants:', error)
        console.error('❌ AuthContext: Error details:', {
          message: error.message,
          code: error.code,
          hint: error.hint,
          details: error.details
        })
        setUserTenants([])
        return
      }

      if (!data || data.length === 0) {
        console.warn('⚠️ AuthContext: No tenant memberships found for user')
        setUserTenants([])
        return
      }

      const memberships = data?.map((item: any) => ({
        tenantId: item.tenantId,
        role: item.role,
        tenant: Array.isArray(item.tenant) ? item.tenant[0] : item.tenant
      })) as TenantMembership[] || []

      console.log('✅ AuthContext: Processed memberships:', memberships)
      setUserTenants(memberships)

      // Set current tenant to first available if none set
      if (memberships.length > 0 && !currentTenant) {
        console.log('🏢 AuthContext: Setting current tenant:', memberships[0].tenantId)
        setCurrentTenant(memberships[0].tenantId)
      }
    } catch (error) {
      console.error('❌ AuthContext: Catch error in fetchUserTenants:', error)
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