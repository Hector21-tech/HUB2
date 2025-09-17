import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  try {
    await prisma.$connect()

    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'tenants':
        const tenants = await prisma.tenant.findMany({
          include: {
            memberships: {
              include: {
                user: true
              }
            },
            _count: {
              select: {
                players: true,
                requests: true,
                trials: true,
                events: true
              }
            }
          }
        })
        return Response.json({ success: true, data: tenants })

      case 'users':
        const users = await prisma.user.findMany({
          include: {
            memberships: {
              include: {
                tenant: true
              }
            }
          }
        })
        return Response.json({ success: true, data: users })

      case 'players':
        const tenantId = searchParams.get('tenantId')
        if (!tenantId) {
          return Response.json({ success: false, error: 'tenantId required' }, { status: 400 })
        }
        const players = await prisma.player.findMany({
          where: { tenantId },
          include: {
            tenant: true,
            trials: true
          }
        })
        return Response.json({ success: true, data: players })

      case 'all':
        const allData = {
          tenants: await prisma.tenant.count(),
          users: await prisma.user.count(),
          memberships: await prisma.tenantMembership.count(),
          players: await prisma.player.count(),
          requests: await prisma.request.count(),
          trials: await prisma.trial.count(),
          events: await prisma.calendarEvent.count()
        }
        return Response.json({ success: true, data: allData })

      default:
        return Response.json({
          success: false,
          error: 'Invalid action. Use: tenants, users, players, or all'
        }, { status: 400 })
    }
  } catch (error) {
    console.error('Test CRUD GET error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST() {
  try {
    await prisma.$connect()
    console.log('Creating test seed data...')

    // Create test tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'test-scout-hub' },
      update: {},
      create: {
        id: 'tenant-test-1',
        slug: 'test-scout-hub',
        name: 'Test Scout Hub',
        description: 'Test tenant for Scout Hub 2 development',
        logoUrl: null,
        settings: {
          theme: 'light',
          notifications: true
        }
      }
    })

    // Create test users
    const user1 = await prisma.user.upsert({
      where: { email: 'admin@scouthub.test' },
      update: {},
      create: {
        id: 'user-test-1',
        email: 'admin@scouthub.test',
        firstName: 'Admin',
        lastName: 'User',
        avatarUrl: null
      }
    })

    const user2 = await prisma.user.upsert({
      where: { email: 'scout@scouthub.test' },
      update: {},
      create: {
        id: 'user-test-2',
        email: 'scout@scouthub.test',
        firstName: 'Scout',
        lastName: 'Manager',
        avatarUrl: null
      }
    })

    // Create tenant memberships
    const membership1 = await prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user1.id
        }
      },
      update: {},
      create: {
        id: 'membership-test-1',
        tenantId: tenant.id,
        userId: user1.id,
        role: 'OWNER'
      }
    })

    const membership2 = await prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: user2.id
        }
      },
      update: {},
      create: {
        id: 'membership-test-2',
        tenantId: tenant.id,
        userId: user2.id,
        role: 'SCOUT'
      }
    })

    // Create test players
    const player1 = await prisma.player.upsert({
      where: { id: 'player-test-1' },
      update: {},
      create: {
        id: 'player-test-1',
        tenantId: tenant.id,
        firstName: 'Marcus',
        lastName: 'Rashford',
        dateOfBirth: new Date('1997-10-31'),
        position: 'Forward',
        club: 'Manchester United',
        nationality: 'England',
        height: 186,
        notes: 'Excellent pace and finishing ability',
        tags: ['pace', 'finishing', 'versatile'],
        rating: 8.5
      }
    })

    const player2 = await prisma.player.upsert({
      where: { id: 'player-test-2' },
      update: {},
      create: {
        id: 'player-test-2',
        tenantId: tenant.id,
        firstName: 'Erling',
        lastName: 'Haaland',
        dateOfBirth: new Date('2000-07-21'),
        position: 'Striker',
        club: 'Manchester City',
        nationality: 'Norway',
        height: 194,
        notes: 'Incredible goal scoring record',
        tags: ['goals', 'strength', 'positioning'],
        rating: 9.2
      }
    })

    // Create test request
    const request1 = await prisma.request.upsert({
      where: { id: 'request-test-1' },
      update: {},
      create: {
        id: 'request-test-1',
        tenantId: tenant.id,
        title: 'Young Striker Needed',
        description: 'Looking for a promising young striker for our academy',
        club: 'Arsenal FC',
        position: 'Striker',
        ageRange: '16-19',
        priority: 'HIGH',
        status: 'OPEN',
        budget: 50000,
        deadline: new Date('2025-12-31')
      }
    })

    // Create test trial
    const trial1 = await prisma.trial.upsert({
      where: { id: 'trial-test-1' },
      update: {},
      create: {
        id: 'trial-test-1',
        tenantId: tenant.id,
        playerId: player2.id,
        requestId: request1.id,
        scheduledAt: new Date('2025-10-15T10:00:00Z'),
        location: 'Arsenal Training Ground',
        status: 'SCHEDULED',
        notes: 'Initial assessment trial',
        rating: null,
        feedback: null
      }
    })

    // Create test calendar event
    const event1 = await prisma.calendarEvent.upsert({
      where: { id: 'event-test-1' },
      update: {},
      create: {
        id: 'event-test-1',
        tenantId: tenant.id,
        title: 'Haaland Trial Session',
        description: 'Trial session for Erling Haaland at Arsenal',
        startTime: new Date('2025-10-15T10:00:00Z'),
        endTime: new Date('2025-10-15T12:00:00Z'),
        location: 'Arsenal Training Ground',
        type: 'TRIAL',
        isAllDay: false,
        recurrence: null
      }
    })

    console.log('Seed data created successfully')

    return Response.json({
      success: true,
      message: 'Test seed data created successfully',
      data: {
        tenant,
        users: [user1, user2],
        memberships: [membership1, membership2],
        players: [player1, player2],
        request: request1,
        trial: trial1,
        event: event1
      }
    })
  } catch (error) {
    console.error('Seed data creation error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}