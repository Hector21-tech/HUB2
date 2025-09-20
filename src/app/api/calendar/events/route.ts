import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET - List calendar events for a tenant
export async function GET(request: NextRequest) {
  try {
    const tenantId = request.nextUrl.searchParams.get('tenantId')
    const start = request.nextUrl.searchParams.get('start') // ISO date string
    const end = request.nextUrl.searchParams.get('end') // ISO date string
    const type = request.nextUrl.searchParams.get('type') // Optional event type filter

    if (!tenantId) {
      return NextResponse.json(
        { error: 'tenantId is required' },
        { status: 400 }
      )
    }

    // Build where clause
    const where: any = { tenantId }

    // Date range filtering
    if (start && end) {
      where.OR = [
        // Events that start within the range
        {
          startTime: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        // Events that end within the range
        {
          endTime: {
            gte: new Date(start),
            lte: new Date(end)
          }
        },
        // Events that span the entire range
        {
          AND: [
            { startTime: { lte: new Date(start) } },
            { endTime: { gte: new Date(end) } }
          ]
        }
      ]
    }

    // Event type filtering
    if (type) {
      where.type = type
    }

    const events = await prisma.calendarEvent.findMany({
      where,
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        type: true,
        isAllDay: true,
        recurrence: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: events
    })

  } catch (error) {
    console.error('Failed to fetch calendar events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar events' },
      { status: 500 }
    )
  }
}

// POST - Create a new calendar event
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      tenantId,
      title,
      description,
      startTime,
      endTime,
      location,
      type,
      isAllDay,
      recurrence
    } = body

    // Basic validation
    if (!tenantId || !title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'tenantId, title, startTime, and endTime are required' },
        { status: 400 }
      )
    }

    // Validate date range
    const start = new Date(startTime)
    const end = new Date(endTime)

    if (start >= end) {
      return NextResponse.json(
        { error: 'End time must be after start time' },
        { status: 400 }
      )
    }

    // Check for conflicts (overlapping events)
    const conflictingEvents = await prisma.calendarEvent.findMany({
      where: {
        tenantId,
        OR: [
          // New event starts during existing event
          {
            AND: [
              { startTime: { lte: start } },
              { endTime: { gt: start } }
            ]
          },
          // New event ends during existing event
          {
            AND: [
              { startTime: { lt: end } },
              { endTime: { gte: end } }
            ]
          },
          // New event contains existing event
          {
            AND: [
              { startTime: { gte: start } },
              { endTime: { lte: end } }
            ]
          }
        ]
      },
      select: { id: true, title: true, startTime: true, endTime: true }
    })

    const newEvent = await prisma.calendarEvent.create({
      data: {
        id: `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        tenantId,
        title,
        description: description || '',
        startTime: start,
        endTime: end,
        location: location || null,
        type: type || 'OTHER',
        isAllDay: isAllDay || false,
        recurrence: recurrence || null
      },
      select: {
        id: true,
        title: true,
        description: true,
        startTime: true,
        endTime: true,
        location: true,
        type: true,
        isAllDay: true,
        recurrence: true,
        createdAt: true,
        updatedAt: true
      }
    })

    return NextResponse.json({
      success: true,
      data: newEvent,
      conflicts: conflictingEvents.length > 0 ? conflictingEvents : undefined
    })

  } catch (error) {
    console.error('Failed to create calendar event:', error)
    return NextResponse.json(
      {
        error: 'Failed to create calendar event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}