import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { transformDatabasePlayer } from '@/lib/player-utils'

const prisma = new PrismaClient()

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
    const body = await request.json()

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
      return NextResponse.json(
        { success: false, error: 'Tenant ID, first name, and last name are required' },
        { status: 400 }
      )
    }

    // Create player
    const player = await prisma.player.create({
      data: {
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
        tags: [...tags, ...(avatarUrl ? [`avatar:${avatarUrl}`] : [])] // Store avatar URL in tags temporarily
      }
    })

    return NextResponse.json({
      success: true,
      data: transformDatabasePlayer(player),
      message: 'Player created successfully'
    })

  } catch (error) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
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
        tags: [...tags, ...(avatarUrl ? [`avatar:${avatarUrl}`] : [])]
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