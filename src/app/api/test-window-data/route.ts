import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Creating test requests with window scenarios...')

    const now = new Date()

    // Clear existing test requests
    await prisma.request.deleteMany({
      where: {
        title: {
          startsWith: 'TEST:'
        }
      }
    })
    console.log('✅ Cleared existing test requests')

    // Test scenarios with different window statuses
    const testRequests = [
      {
        id: `test-open-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Premier League Summer Window (OPEN)',
        description: 'Transfer window currently open with plenty of time',
        club: 'Arsenal FC',
        position: 'ST',
        country: 'England',
        ownerId: 'dev-user-id',
        priority: 'HIGH',
        status: 'OPEN',
        windowOpenAt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
        windowCloseAt: new Date(now.getTime() + 45 * 24 * 60 * 60 * 1000), // 45 days from now
        graceDays: 3
      },
      {
        id: `test-closes-soon-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Bundesliga Window (CLOSES SOON)',
        description: 'Window closing in 5 days - act fast!',
        club: 'Bayern Munich',
        position: 'CAM',
        country: 'Germany',
        ownerId: 'dev-user-id',
        priority: 'URGENT',
        status: 'OPEN',
        windowOpenAt: new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000), // 60 days ago
        windowCloseAt: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        graceDays: 3
      },
      {
        id: `test-paperwork-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Serie A Window (PAPERWORK DEADLINE)',
        description: 'Paperwork deadline approaching - critical!',
        club: 'AC Milan',
        position: 'CB',
        country: 'Italy',
        ownerId: 'dev-user-id',
        priority: 'URGENT',
        status: 'OPEN',
        windowOpenAt: new Date(now.getTime() - 45 * 24 * 60 * 60 * 1000), // 45 days ago
        windowCloseAt: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
        graceDays: 3
      },
      {
        id: `test-grace-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: La Liga Window (GRACE PERIOD)',
        description: 'In grace period - very limited time!',
        club: 'Real Madrid',
        position: 'LW',
        country: 'Spain',
        ownerId: 'dev-user-id',
        priority: 'URGENT',
        status: 'OPEN',
        windowOpenAt: new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000), // 90 days ago
        windowCloseAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
        graceDays: 3
      },
      {
        id: `test-opens-soon-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Allsvenskan Winter Window (OPENS SOON)',
        description: 'Winter window opens in 2 weeks',
        club: 'AIK Stockholm',
        position: 'RB',
        country: 'Sweden',
        ownerId: 'dev-user-id',
        priority: 'MEDIUM',
        status: 'OPEN',
        windowOpenAt: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000), // 14 days from now
        windowCloseAt: new Date(now.getTime() + 75 * 24 * 60 * 60 * 1000), // 75 days from now
        graceDays: 3
      },
      {
        id: `test-expired-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Saudi Pro League (EXPIRED)',
        description: 'Transfer window closed and expired',
        club: 'Al Hilal',
        position: 'CDM',
        country: 'Saudi Arabia',
        ownerId: 'dev-user-id',
        priority: 'LOW',
        status: 'EXPIRED',
        windowOpenAt: new Date(now.getTime() - 120 * 24 * 60 * 60 * 1000), // 120 days ago
        windowCloseAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
        graceDays: 3
      },
      {
        id: `test-no-window-${Date.now()}`,
        tenantId: 'tenant-test-1',
        title: 'TEST: Free Agent Signing (NO WINDOW)',
        description: 'Free agent - no transfer window restrictions',
        club: 'Inter Miami',
        position: 'GK',
        country: 'USA',
        ownerId: 'dev-user-id',
        priority: 'MEDIUM',
        status: 'OPEN',
        windowOpenAt: null,
        windowCloseAt: null,
        graceDays: 0
      }
    ]

    // Create all test requests
    for (const requestData of testRequests) {
      await prisma.request.create({
        data: requestData
      })
      console.log(`✅ Created: ${requestData.title}`)
    }

    console.log('🎉 All test requests created successfully!')

    return NextResponse.json({
      success: true,
      message: 'Test window data created successfully',
      data: {
        requestsCreated: testRequests.length,
        scenarios: [
          'OPEN - Window with plenty of time',
          'CLOSES_SOON - Window closing in 5 days',
          'PAPERWORK_DEADLINE - Critical timing',
          'GRACE_PERIOD - Limited time after close',
          'OPENS_SOON - Future window opening',
          'EXPIRED - Closed and past grace period',
          'NO_WINDOW - Free agent signing'
        ]
      }
    })

  } catch (error) {
    console.error('❌ Failed to create test data:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to create test window data',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}