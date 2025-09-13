import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

export const runtime = 'nodejs'

// Initialize Prisma client
const prisma = new PrismaClient()

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Try a simple query to test if connection works
    const result = await prisma.$queryRaw`SELECT NOW() as current_time`
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      timestamp: result,
      database_url: process.env.DATABASE_URL ? 'configured' : 'missing'
    })
  } catch (error) {
    console.error('Database connection error:', error)
    
    await prisma.$disconnect()
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      database_url: process.env.DATABASE_URL ? 'configured' : 'missing'
    }, { status: 500 })
  }
}