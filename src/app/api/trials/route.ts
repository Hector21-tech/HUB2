import { NextRequest, NextResponse } from 'next/server'
import { trialService } from '@/modules/trials/services/trialService'
import { TrialFilters, CreateTrialInput } from '@/modules/trials/types/trial'
import { validateSupabaseTenantAccess } from '@/lib/supabase/tenant-validation'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// GET - Fetch trials for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantSlug = searchParams.get('tenant')

    if (!tenantSlug) {
      return NextResponse.json(
        { success: false, error: 'Tenant parameter is required' },
        { status: 400 }
      )
    }

    // 🛡️ SECURITY: Validate user has access to this tenant via Supabase RLS
    const validation = await validateSupabaseTenantAccess(tenantSlug)
    if (!validation.success) {
      return NextResponse.json(
        {
          success: false,
          error: validation.message,
          meta: { reason: validation.reason }
        },
        { status: 401 }
      )
    }

    const tenantId = validation.tenantId

    // Parse filters from query params
    const filters: TrialFilters = {}

    const status = searchParams.get('status')
    if (status) {
      filters.status = status.split(',') as any[]
    }

    const playerId = searchParams.get('playerId')
    if (playerId) {
      filters.playerId = playerId
    }

    const requestId = searchParams.get('requestId')
    if (requestId) {
      filters.requestId = requestId
    }

    const dateFrom = searchParams.get('dateFrom')
    if (dateFrom) {
      filters.dateFrom = new Date(dateFrom)
    }

    const dateTo = searchParams.get('dateTo')
    if (dateTo) {
      filters.dateTo = new Date(dateTo)
    }

    const search = searchParams.get('search')
    if (search) {
      filters.search = search
    }

    const trials = await trialService.getTrials(tenantId, filters)

    return NextResponse.json({
      success: true,
      data: trials
    })

  } catch (error) {
    console.error('Error fetching trials:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch trials' },
      { status: 500 }
    )
  }
}

// POST - Create a new trial
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    // 🛡️ SECURITY: Validate user has access to this tenant
    try {
      await validateTenantAccess(tenantId)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const trialData: CreateTrialInput = {
      playerId: body.playerId,
      requestId: body.requestId || null,
      scheduledAt: new Date(body.scheduledAt),
      location: body.location || null,
      notes: body.notes || null
    }

    // Validate required fields
    if (!trialData.playerId || !trialData.scheduledAt) {
      return NextResponse.json(
        { success: false, error: 'Player ID and scheduled date are required' },
        { status: 400 }
      )
    }

    const trial = await trialService.createTrial(tenantId, trialData)

    return NextResponse.json({
      success: true,
      data: trial
    }, { status: 201 })

  } catch (error) {
    console.error('Error creating trial:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create trial' },
      { status: 500 }
    )
  }
}