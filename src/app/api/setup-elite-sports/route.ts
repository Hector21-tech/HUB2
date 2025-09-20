import { PrismaClient } from '@prisma/client'
import { NextRequest } from 'next/server'

const prisma = new PrismaClient()

export async function POST(request: NextRequest) {
  try {
    await prisma.$connect()
    console.log('Creating elite-sports-group tenant...')

    // Create elite-sports-group tenant
    const tenant = await prisma.tenant.upsert({
      where: { slug: 'elite-sports-group' },
      update: {
        name: 'Elite Sports Group',
        description: 'Professional sports talent management organization',
      },
      create: {
        id: 'tenant-elite-sports-1',
        slug: 'elite-sports-group',
        name: 'Elite Sports Group',
        description: 'Professional sports talent management organization',
        logoUrl: null,
        settings: {
          theme: 'dark',
          notifications: true,
          timezone: 'Europe/Stockholm'
        }
      }
    })

    console.log('Elite Sports Group tenant created:', tenant.id)

    // Get or create user (you'll need to replace with actual user ID from your auth session)
    const adminUser = await prisma.user.upsert({
      where: { email: 'admin@elitesports.com' },
      update: {},
      create: {
        id: 'user-elite-admin-1',
        email: 'admin@elitesports.com',
        firstName: 'Elite',
        lastName: 'Admin',
        avatarUrl: null
      }
    })

    // Create tenant membership for admin
    const membership = await prisma.tenantMembership.upsert({
      where: {
        tenantId_userId: {
          tenantId: tenant.id,
          userId: adminUser.id
        }
      },
      update: {},
      create: {
        id: 'membership-elite-admin-1',
        tenantId: tenant.id,
        userId: adminUser.id,
        role: 'OWNER'
      }
    })

    // Create some sample data for elite sports group
    const samplePlayer = await prisma.player.upsert({
      where: { id: 'player-elite-1' },
      update: {},
      create: {
        id: 'player-elite-1',
        tenantId: tenant.id,
        firstName: 'Victor',
        lastName: 'Osimhen',
        dateOfBirth: new Date('1998-12-29'),
        position: 'Striker',
        club: 'Napoli',
        nationality: 'Nigeria',
        height: 185,
        notes: 'Clinical finisher with excellent pace and aerial ability',
        tags: ['pace', 'finishing', 'headers', 'clinical'],
        rating: 8.8
      }
    })

    const sampleRequest = await prisma.request.upsert({
      where: { id: 'request-elite-1' },
      update: {},
      create: {
        id: 'request-elite-1',
        tenantId: tenant.id,
        title: 'Premier League Striker Search',
        description: 'Seeking world-class striker for Premier League club',
        club: 'Chelsea FC',
        position: 'Striker',
        ageRange: '22-28',
        priority: 'URGENT',
        status: 'OPEN',
        budget: 80000000,
        deadline: new Date('2025-01-31')
      }
    })

    console.log('Elite Sports Group setup completed successfully')

    return Response.json({
      success: true,
      message: 'Elite Sports Group tenant setup completed',
      data: {
        tenant,
        adminUser,
        membership,
        samplePlayer,
        sampleRequest
      }
    })

  } catch (error) {
    console.error('Elite Sports Group setup error:', error)
    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}