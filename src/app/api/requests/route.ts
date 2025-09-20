import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List all requests for a tenant
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const tenantId = searchParams.get('tenantId')

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      )
    }

    const requests = await prisma.request.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        description: true,
        club: true,
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
    const { tenantId, title, description, club, position } = body

    // Basic validation
    if (!tenantId || !title || !club) {
      return NextResponse.json(
        { error: 'tenantId, title, and club are required' },
        { status: 400 }
      )
    }

    const newRequest = await prisma.request.create({
      data: {
        id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        title,
        description: description || '',
        club,
        position: position || null,
        // Set basic required fields with defaults
        country: '',
        ownerId: 'dev-user-id', // TODO: Get from auth
        priority: 'MEDIUM',
        status: 'OPEN'
      },
      select: {
        id: true,
        title: true,
        description: true,
        club: true,
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