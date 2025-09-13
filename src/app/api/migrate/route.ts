import { PrismaClient } from '@prisma/client'
import { exec } from 'child_process'
import { promisify } from 'util'

const prisma = new PrismaClient()
const execAsync = promisify(exec)

export async function POST() {
  try {
    // Test database connection first
    await prisma.$connect()
    console.log('Database connection established')

    // Run Prisma db push to create tables
    console.log('Running Prisma db push...')
    const { stdout, stderr } = await execAsync('npx prisma db push --force-reset')

    console.log('Prisma stdout:', stdout)
    if (stderr) console.error('Prisma stderr:', stderr)

    // Verify tables were created
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    `

    return Response.json({
      success: true,
      message: 'Database migration completed successfully',
      tables: tables,
      output: stdout
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