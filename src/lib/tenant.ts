import { supabase } from './supabase'

type TenantData = {
  id: string
  slug: string
  name: string
  description: string
  logoUrl?: string
  settings?: any
  createdAt: string
  updatedAt: string
}

export async function getTenantBySlug(slug: string): Promise<TenantData | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .eq('slug', slug.toLowerCase())
      .single()

    if (error) {
      console.log('Error fetching tenant:', error)
      return null
    }

    return data
  } catch (error) {
    console.log('Error in getTenantBySlug:', error)
    return null
  }
}

export async function getAllTenants(): Promise<TenantData[]> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('createdAt', { ascending: false })

    if (error) {
      console.log('Error fetching tenants:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.log('Error in getAllTenants:', error)
    return []
  }
}

export async function createTenant(tenantData: {
  slug: string
  name: string
  description: string
  logoUrl?: string
}): Promise<TenantData | null> {
  try {
    const { data, error } = await supabase
      .from('tenants')
      .insert([tenantData])
      .select()
      .single()

    if (error) {
      console.log('Error creating tenant:', error)
      return null
    }

    return data
  } catch (error) {
    console.log('Error in createTenant:', error)
    return null
  }
}