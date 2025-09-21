import { NextRequest, NextResponse } from 'next/server'
import { transformDatabasePlayer } from '@/lib/player-utils'
import { validateSupabaseTenantAccess, createTenantSupabaseClient } from '@/lib/supabase/tenant-validation'
import { cache, CacheKeys, CacheTTL, CacheInvalidation } from '@/lib/cache'
import { createSecureResponse, createSecureErrorResponse } from '@/lib/security-headers'
import { monitoredPrisma, createTenantOperations } from '@/lib/db-monitor/monitored-prisma'
import { Logger, createLogContext } from '@/lib/logger'
import { createErrorResponse, createStandardResponse, createServerErrorResponse } from '@/lib/http-utils'

// 🛡️ SECURITY UPGRADE: Using monitored Prisma client with automatic tenant isolation
const prisma = monitoredPrisma

// GET - Fetch players for a tenant
export async function GET(request: NextRequest) {
  const timer = Logger.timer()
  const baseContext = createLogContext(request)
  let tenantSlug: string | null = null
  let userId: string | undefined

  try {
    tenantSlug = request.nextUrl.searchParams.get('tenant')

    Logger.info('Players API request started', {
      ...baseContext,
      status: 200,
      details: { tenantSlug }
    })

    if (!tenantSlug) {
      const duration = timer.end()
      Logger.warn('Missing tenant parameter', {
        ...baseContext,
        status: 400,
        duration
      })
      return NextResponse.json(
        { success: false, error: 'Tenant parameter is required' },
        { status: 400 }
      )
    }

    // Validate user has access to this tenant via Supabase RLS
    const validation = await validateSupabaseTenantAccess(tenantSlug)
    userId = 'anonymous' // TODO: Extract from validation when available

    if (!validation.success) {
      const duration = timer.end()
      Logger.warn('Tenant access denied', {
        ...baseContext,
        tenant: tenantSlug,
        userId,
        status: validation.httpStatus,
        duration,
        details: { reason: validation.reason }
      })
      return createErrorResponse(validation)
    }

    const tenantId = validation.tenantId

    // 🛡️ MONITORED QUERY: Using safe tenant-scoped operation
    const tenantOps = createTenantOperations(tenantId)
    const players = await tenantOps.getPlayers({ orderBy: { lastName: 'asc' } })

    // Transform players to include positions array and avatar URL
    const transformedPlayers = players.map(transformDatabasePlayer)

    const duration = timer.end()
    Logger.success('Players fetched successfully', {
      ...baseContext,
      tenant: tenantSlug,
      userId,
      status: 200,
      duration,
      details: { playerCount: transformedPlayers.length }
    })

    return createStandardResponse(transformedPlayers)

  } catch (error) {
    const duration = timer.end()
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    Logger.error('Error fetching players', {
      ...baseContext,
      tenant: tenantSlug || 'unknown',
      userId: userId || 'anonymous',
      status: 500,
      duration,
      error: errorMessage
    })

    return createServerErrorResponse('Failed to fetch players')
  }
}

// POST - Create new player
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/players - Starting...')

    // Get tenant from query parameter
    const tenantSlug = request.nextUrl.searchParams.get('tenant')
    const body = await request.json()

    const {
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      positions = [],
      club,
      height,
      rating,
      notes,
      tags = [],
      avatarUrl
    } = body

    // Validation
    if (!tenantSlug || !firstName || !lastName) {
      console.log('❌ Validation failed: Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Tenant parameter, first name, and last name are required' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed, checking tenant access...')

    // Validate user has access to this tenant via Supabase RLS
    const validation = await validateSupabaseTenantAccess(tenantSlug)
    if (!validation.success) {
      console.log('❌ Tenant access denied:', validation.reason, validation.message)
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

    console.log('✅ Tenant access validated, creating player...')

    // Log received data for debugging
    console.log('📦 Raw request data:', {
      tenantSlug,
      tenantId: validation.tenantId,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      positions,
      club,
      height,
      rating,
      notes,
      tags,
      avatarUrl
    })

    // Create player data object with validation
    const playerData = {
      tenantId: validation.tenantId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      nationality: nationality?.trim() || null,
      position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
      club: club?.trim() || null,
      height: height ? parseInt(height) : 180, // Default height if not provided
      rating: rating ? parseFloat(rating) : null,
      notes: notes?.trim() || null,
      tags: tags || [], // Ensure tags is always an array
      avatarUrl: avatarUrl?.trim() || null // Store avatar URL in proper field
    }

    console.log('🗄️ Final player data for Prisma:', JSON.stringify(playerData, null, 2))

    // Validate critical fields
    if (!playerData.tenantId || !playerData.firstName || !playerData.lastName) {
      console.error('❌ Critical validation failed:', {
        hasTenantId: !!playerData.tenantId,
        hasFirstName: !!playerData.firstName,
        hasLastName: !!playerData.lastName
      })
      return NextResponse.json(
        { success: false, error: 'Missing critical player data' },
        { status: 400 }
      )
    }

    // 🛡️ MONITORED CREATE: Using safe tenant-scoped operation
    console.log('🚀 Attempting monitored player.create...')
    let player
    try {
      const tenantOps = createTenantOperations(tenantId)
      player = await tenantOps.createPlayer(playerData)
      console.log('✅ Player created successfully with monitoring:', player.id)
    } catch (prismaError) {
      console.error('❌ Prisma create error:', prismaError)
      console.error('❌ Error details:', {
        message: prismaError instanceof Error ? prismaError.message : String(prismaError),
        code: (prismaError as any)?.code,
        meta: (prismaError as any)?.meta
      })

      // Return detailed error information
      return NextResponse.json(
        {
          success: false,
          error: 'Database error creating player',
          details: prismaError instanceof Error ? prismaError.message : String(prismaError)
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: transformDatabasePlayer(player),
      message: 'Player created successfully'
    })

  } catch (error) {
    console.error('❌ Error creating player:')
    console.error('Error type:', typeof error)
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Full error:', error)

    // More specific error messages
    let errorMessage = 'Internal server error'
    if (error instanceof Error) {
      if (error.message.includes('Foreign key constraint')) {
        errorMessage = 'Invalid tenant ID or data relationship error'
      } else if (error.message.includes('Unique constraint')) {
        errorMessage = 'Player with this data already exists'
      } else if (error.message.includes('Required field')) {
        errorMessage = 'Missing required field in database'
      }
    }

    return NextResponse.json(
      { success: false, error: errorMessage, details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

// PUT - Update existing player
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      id,
      tenantId,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      positions = [],
      club,
      height,
      rating,
      notes,
      tags = [],
      avatarUrl
    } = body

    // Validation
    if (!id || !tenantId || !firstName || !lastName) {
      return NextResponse.json(
        { success: false, error: 'ID, tenant ID, first name, and last name are required' },
        { status: 400 }
      )
    }

    // 🛡️ MONITORED UPDATE: Using safe tenant-scoped operation
    const tenantOps = createTenantOperations(tenantId)

    // First check if player exists (this will be tenant-scoped automatically)
    const existingPlayers = await tenantOps.getPlayers({ where: { id } })
    if (!existingPlayers || existingPlayers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Update player with monitored operation
    const updateData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality: nationality?.trim() || null,
        position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
        club: club?.trim() || null,
        height: height ? parseInt(height) : 180, // Default height if not provided
        rating: rating ? parseFloat(rating) : null,
        notes: notes?.trim() || null,
        tags: tags, // Store tags normally
        avatarUrl: avatarUrl?.trim() || null // Store avatar URL in proper field
      }

    const player = await tenantOps.updatePlayer(id, updateData)

    return NextResponse.json({
      success: true,
      data: transformDatabasePlayer(player),
      message: 'Player updated successfully'
    })

  } catch (error) {
    console.error('Error updating player:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete player
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const tenantId = searchParams.get('tenantId')

    if (!id || !tenantId) {
      return NextResponse.json(
        { success: false, error: 'Player ID and tenant ID are required' },
        { status: 400 }
      )
    }

    // 🛡️ MONITORED DELETE: Using safe tenant-scoped operation
    const tenantOps = createTenantOperations(tenantId)

    // First check if player exists (tenant-scoped automatically)
    const existingPlayers = await tenantOps.getPlayers({ where: { id } })
    if (!existingPlayers || existingPlayers.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Delete player with monitored operation
    await tenantOps.deletePlayer(id)

    return NextResponse.json({
      success: true,
      message: 'Player deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting player:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}