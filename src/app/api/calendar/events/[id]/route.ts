import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { validateSupabaseTenantAccess } from '@/lib/supabase/tenant-validation'
import { Logger, createLogContext, generateRequestId } from '@/lib/logger'
import { applyRateLimit, createRateLimitResponse } from '@/lib/security/rate-limiting'

const prisma = new PrismaClient()

// GET - Get a specific calendar event
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = generateRequestId()
  const timer = Logger.timer()

  try {
    const { id } = params
    const tenantSlug = request.nextUrl.searchParams.get('tenant')

    const context = createLogContext(request, tenantSlug || undefined, undefined, requestId)

    // 🛡️ SECURITY: First get event to check tenant ownership
    const event = await prisma.calendarEvent.findUnique({
      where: { id },
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
        updatedAt: true,
        tenantId: true
      }
    })

    if (!event) {
      Logger.info('Calendar event not found', {
        ...context,
        status: 404,
        duration: timer.end(),
        details: { eventId: id }
      })
      return NextResponse.json(
        { success: false, error: 'Calendar event not found' },
        { status: 404 }
      )
    }

    // 🛡️ SECURITY: Validate user has access to this tenant
    const validation = await validateSupabaseTenantAccess(event.tenantId)
    if (!validation.success) {
      Logger.security('Calendar event access denied', {
        ...context,
        status: 403,
        duration: timer.end(),
        details: { eventId: id, tenantId: event.tenantId }
      })
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    Logger.success('Calendar event fetched successfully', {
      ...context,
      tenant: event.tenantId,
      userId: validation.userId,
      status: 200,
      duration: timer.end(),
      details: { eventId: id }
    })

    return NextResponse.json({
      success: true,
      data: event
    })

  } catch (error) {
    const context = createLogContext(request, undefined, undefined, requestId)
    Logger.error('Calendar event fetch error', {
      ...context,
      status: 500,
      duration: timer.end(),
      error: error instanceof Error ? error.message : 'Unknown error'
    })

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update a calendar event
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const body = await request.json()
    const {
      title,
      description,
      startTime,
      endTime,
      location,
      type,
      isAllDay,
      recurrence
    } = body

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
      select: { id: true, tenantId: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      )
    }

    // Validate date range if provided
    if (startTime && endTime) {
      const start = new Date(startTime)
      const end = new Date(endTime)

      if (start >= end) {
        return NextResponse.json(
          { error: 'End time must be after start time' },
          { status: 400 }
        )
      }

      // Check for conflicts (excluding this event)
      const conflictingEvents = await prisma.calendarEvent.findMany({
        where: {
          tenantId: existingEvent.tenantId,
          id: { not: id },
          OR: [
            {
              AND: [
                { startTime: { lte: start } },
                { endTime: { gt: start } }
              ]
            },
            {
              AND: [
                { startTime: { lt: end } },
                { endTime: { gte: end } }
              ]
            },
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

      if (conflictingEvents.length > 0) {
        return NextResponse.json({
          success: false,
          error: 'Event conflicts with existing events',
          conflicts: conflictingEvents
        }, { status: 409 })
      }
    }

    const updatedEvent = await prisma.calendarEvent.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(startTime && { startTime: new Date(startTime) }),
        ...(endTime && { endTime: new Date(endTime) }),
        ...(location !== undefined && { location }),
        ...(type && { type }),
        ...(isAllDay !== undefined && { isAllDay }),
        ...(recurrence !== undefined && { recurrence })
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
      data: updatedEvent
    })

  } catch (error) {
    console.error('Failed to update calendar event:', error)
    return NextResponse.json(
      {
        error: 'Failed to update calendar event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete a calendar event
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if event exists
    const existingEvent = await prisma.calendarEvent.findUnique({
      where: { id },
      select: { id: true, title: true }
    })

    if (!existingEvent) {
      return NextResponse.json(
        { error: 'Calendar event not found' },
        { status: 404 }
      )
    }

    await prisma.calendarEvent.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: `Event "${existingEvent.title}" deleted successfully`
    })

  } catch (error) {
    console.error('Failed to delete calendar event:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete calendar event',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}