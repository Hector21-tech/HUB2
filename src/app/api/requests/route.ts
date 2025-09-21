import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getCountryByClub, getLeagueByClub } from '@/lib/club-country-mapping'
import { validateSupabaseTenantAccess } from '@/lib/supabase/tenant-validation'

const prisma = new PrismaClient()

// GET - List all requests for a tenant
export async function GET(request: NextRequest) {
  try {
    const tenantSlug = request.nextUrl.searchParams.get('tenant')

    if (!tenantSlug) {
      return NextResponse.json(
        { error: 'tenant parameter is required' },
        { status: 400 }
      )
    }

    // Validate user has access to this tenant via Supabase RLS
    const validation = await validateSupabaseTenantAccess(tenantSlug)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.message,
          meta: { reason: validation.reason }
        },
        { status: 401 }
      )
    }

    const tenantId = validation.tenantId

    const requests = await prisma.request.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        description: true,
        club: true,
        country: true,
        league: true,
        position: true,
        status: true,
        priority: true,
        windowOpenAt: true,
        windowCloseAt: true,
        deadline: true,
        graceDays: true,
        createdAt: true,
        updatedAt: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({
      success: true,
      data: requests
    })
  } catch (error) {
    console.error('Failed to fetch requests:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

// POST - Create a new request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { tenantSlug, title, description, club, position, country, league } = body

    // Basic validation
    if (!tenantSlug || !title || !club) {
      return NextResponse.json(
        { error: 'tenantSlug, title, and club are required' },
        { status: 400 }
      )
    }

    // Validate user has access to this tenant via Supabase RLS
    const validation = await validateSupabaseTenantAccess(tenantSlug)
    if (!validation.success) {
      return NextResponse.json(
        {
          error: validation.message,
          meta: { reason: validation.reason }
        },
        { status: 401 }
      )
    }

    const tenantId = validation.tenantId

    // Auto-populate country and league if not provided
    const autoCountry = country || getCountryByClub(club) || ''
    const autoLeague = league || getLeagueByClub(club) || ''

    console.log('Creating request with auto-populated data:', {
      club,
      autoCountry,
      autoLeague,
      providedCountry: country,
      providedLeague: league
    })

    const newRequest = await prisma.request.create({
      data: {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        title,
        description: description || '',
        club,
        country: autoCountry,
        league: autoLeague,
        position: position || null,
        // Set owner to authenticated user - using validation result
        ownerId: 'temp-user-id', // TODO: Get from Supabase validation
        priority: 'MEDIUM',
        status: 'OPEN'
      },
      select: {
        id: true,
        title: true,
        description: true,
        club: true,
        country: true,
        league: true,
        position: true,
        status: true,
        priority: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: newRequest
    })
  } catch (error) {
    console.error('Failed to create request:', error)
    return NextResponse.json(
      { error: 'Failed to create request', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}