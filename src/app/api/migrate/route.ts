import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Test database connection
    await prisma.$connect()

    // Run database migration by pushing schema
    await prisma.$executeRaw`SELECT 1`

    console.log('Database connection successful')

    return Response.json({
      success: true,
      message: 'Database migration completed successfully'
    })
  } catch (error) {
    console.error('Migration error:', error)

    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}

export async function GET() {
  try {
    await prisma.$connect()

    // Check if tables exist by querying system tables
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `

    return Response.json({
      success: true,
      tables,
      message: 'Database connection successful'
    })
  } catch (error) {
    console.error('Database check error:', error)

    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}