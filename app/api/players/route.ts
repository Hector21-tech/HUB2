import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // TODO: Add tenant-based filtering when authentication is implemented
    const players = await prisma.player.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ success: true, data: players })
  } catch (error: any) {
    console.error('Error fetching players:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch players' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // TODO: Add tenant ID from authenticated user context
    const player = await prisma.player.create({
      data: {
        ...body,
        tenantId: 'temp-tenant-id', // Temporary until auth is implemented
      },
    })

    return NextResponse.json({ success: true, data: player }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating player:', error)
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create player' },
      { status: 500 }
    )
  }
}