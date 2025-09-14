import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { transformDatabasePlayer } from '@/lib/player-utils'

// Use global Prisma instance in production to avoid connection issues
// Updated to support avatarUrl field - regenerating Prisma client
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: ['query', 'error'],
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// GET - Fetch players for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { success: false, error: 'Tenant ID is required' },
        { status: 400 }
      )
    }

    const players = await prisma.player.findMany({
      where: { tenantId },
      orderBy: { lastName: 'asc' }
    })

    // Transform players to include positions array and avatar URL
    const transformedPlayers = players.map(transformDatabasePlayer)

    return NextResponse.json({
      success: true,
      data: transformedPlayers
    })

  } catch (error) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST - Create new player
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/players - Starting...')
    const body = await request.json()
    console.log('📦 Request body:', JSON.stringify(body, null, 2))

    const {
      tenantId,
      firstName,
      lastName,
      dateOfBirth,
      nationality,
      positions = [],
      club,
      height,
      weight,
      rating,
      notes,
      tags = [],
      avatarUrl
    } = body

    // Validation
    if (!tenantId || !firstName || !lastName) {
      console.log('❌ Validation failed: Missing required fields')
      return NextResponse.json(
        { success: false, error: 'Tenant ID, first name, and last name are required' },
        { status: 400 }
      )
    }

    console.log('✅ Validation passed, creating player...')

    // Create player data object
    const playerData = {
      tenantId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
      nationality: nationality?.trim() || null,
      position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
      club: club?.trim() || null,
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      rating: rating ? parseFloat(rating) : null,
      notes: notes?.trim() || null,
      tags: tags, // Store tags normally
      avatarUrl: avatarUrl?.trim() || null // Store avatar URL in proper field
    }

    console.log('🗄️ Creating player with data:', JSON.stringify(playerData, null, 2))

    // Create player
    const player = await prisma.player.create({
      data: playerData
    })

    console.log('✅ Player created successfully:', player.id)

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
      weight,
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

    // Check if player exists and belongs to tenant
    const existingPlayer = await prisma.player.findFirst({
      where: { id, tenantId }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Update player
    const player = await prisma.player.update({
      where: { id },
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        nationality: nationality?.trim() || null,
        position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
        club: club?.trim() || null,
        height: height ? parseInt(height) : null,
        weight: weight ? parseInt(weight) : null,
        rating: rating ? parseFloat(rating) : null,
        notes: notes?.trim() || null,
        tags: tags, // Store tags normally
        avatarUrl: avatarUrl?.trim() || null // Store avatar URL in proper field
      }
    })

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

    // Check if player exists and belongs to tenant
    const existingPlayer = await prisma.player.findFirst({
      where: { id, tenantId }
    })

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Delete player
    await prisma.player.delete({
      where: { id }
    })

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