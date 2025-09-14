import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// GET - Fetch players using direct SQL
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


    // Direct SQL query to get players with avatarUrl
    const { data: players, error } = await supabase
      .from('players')
      .select(`
        id,
        tenantId,
        firstName,
        lastName,
        dateOfBirth,
        position,
        club,
        nationality,
        height,
        weight,
        notes,
        tags,
        rating,
        avatarUrl,
        createdAt,
        updatedAt
      `)
      .eq('tenantId', tenantId)
      .order('lastName', { ascending: true })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { success: false, error: 'Database query failed' },
        { status: 500 }
      )
    }

    // Transform data to match expected format
    const transformedPlayers = players?.map(player => ({
      ...player,
      positions: player.position ? player.position.split(', ').filter((p: string) => p.length > 0) : [],
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
      contractExpiry: null, // Temporarily set to null until column exists
      // Clean up any remaining avatar tags from tags array
      tags: player.tags ? player.tags.filter((tag: string) => !tag.startsWith('avatar:')) : []
    })) || []

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

// POST - Create new player using direct SQL
export async function POST(request: NextRequest) {
  try {
    console.log('🚀 POST /api/players-sql - Starting...')
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
      // contractExpiry, // Temporarily disabled until column exists
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

    // Generate ID
    const playerId = 'player_' + Math.random().toString(36).substr(2, 9)

    // Prepare player data
    const playerData = {
      id: playerId,
      tenantId,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
      nationality: nationality?.trim() || null,
      position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
      club: club?.trim() || null,
      // contractExpiry: contractExpiry ? new Date(contractExpiry).toISOString() : null, // Temporarily disabled
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      rating: rating ? parseFloat(rating) : null,
      notes: notes?.trim() || null,
      tags: tags || [], // Store regular tags only
      avatarUrl: avatarUrl?.trim() || null, // Store avatar URL in dedicated field
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    console.log('🗄️ Creating player with data:', JSON.stringify(playerData, null, 2))

    // Insert using Supabase
    const { data: player, error } = await supabase
      .from('players')
      .insert([playerData])
      .select()
      .single()

    if (error) {
      console.error('❌ Supabase insert error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create player', details: error.message },
        { status: 500 }
      )
    }

    console.log('✅ Player created successfully:', player.id)

    // Transform response data
    const transformedPlayer = {
      ...player,
      positions: player.position ? player.position.split(', ').filter((p: string) => p.length > 0) : [],
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
      contractExpiry: null // Temporarily set to null until column exists
    }

    return NextResponse.json({
      success: true,
      data: transformedPlayer,
      message: 'Player created successfully'
    })

  } catch (error) {
    console.error('❌ Error creating player:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
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
      // contractExpiry, // Temporarily disabled until column exists
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
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .eq('tenantId', tenantId)
      .single()

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Update player data
    const updateData = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth).toISOString() : null,
      nationality: nationality?.trim() || null,
      position: Array.isArray(positions) && positions.length > 0 ? positions.join(', ') : null,
      club: club?.trim() || null,
      // contractExpiry: contractExpiry ? new Date(contractExpiry).toISOString() : null, // Temporarily disabled
      height: height ? parseInt(height) : null,
      weight: weight ? parseInt(weight) : null,
      rating: rating ? parseFloat(rating) : null,
      notes: notes?.trim() || null,
      tags: tags || [],
      avatarUrl: avatarUrl?.trim() || null,
      updatedAt: new Date().toISOString()
    }

    const { data: player, error } = await supabase
      .from('players')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update player' },
        { status: 500 }
      )
    }

    // Transform response data
    const transformedPlayer = {
      ...player,
      positions: player.position ? player.position.split(', ').filter((p: string) => p.length > 0) : [],
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth) : null,
      contractExpiry: null // Temporarily set to null until column exists
    }

    return NextResponse.json({
      success: true,
      data: transformedPlayer,
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
    const { data: existingPlayer } = await supabase
      .from('players')
      .select('id')
      .eq('id', id)
      .eq('tenantId', tenantId)
      .single()

    if (!existingPlayer) {
      return NextResponse.json(
        { success: false, error: 'Player not found or access denied' },
        { status: 404 }
      )
    }

    // Delete player
    const { error } = await supabase
      .from('players')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to delete player' },
        { status: 500 }
      )
    }

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