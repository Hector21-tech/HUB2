import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Fix enum conflicts by converting to TEXT
export async function POST(req: NextRequest) {
  try {
    console.log('🔧 Converting enum columns to TEXT...')

    // Step 1: Convert priority column from enum to TEXT
    console.log('1. Converting priority column...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "requests"
      ALTER COLUMN "priority" TYPE TEXT
      USING "priority"::TEXT;
    `)
    console.log('✅ Priority column converted to TEXT')

    // Step 2: Convert status column from enum to TEXT
    console.log('2. Converting status column...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "requests"
      ALTER COLUMN "status" TYPE TEXT
      USING "status"::TEXT;
    `)
    console.log('✅ Status column converted to TEXT')

    // Step 3: Set simple default values
    console.log('3. Setting default values...')
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "requests"
      ALTER COLUMN "priority" SET DEFAULT 'MEDIUM';
    `)

    await prisma.$executeRawUnsafe(`
      ALTER TABLE "requests"
      ALTER COLUMN "status" SET DEFAULT 'OPEN';
    `)
    console.log('✅ Default values set')

    // Step 4: Test creating a simple request
    console.log('4. Testing request creation...')
    const testRequest = await prisma.$executeRawUnsafe(`
      INSERT INTO "requests" ("id", "tenantId", "title", "description", "club", "position")
      VALUES ('test-request-mvp', 'tenant-test-1', 'Test MVP Request', 'This is a test', 'Arsenal FC', 'ST')
      RETURNING id, title;
    `)
    console.log('✅ Test request created:', testRequest)

    // Clean up test
    await prisma.$executeRawUnsafe(`DELETE FROM "requests" WHERE "id" = 'test-request-mvp'`)
    console.log('✅ Test request cleaned up')

    return NextResponse.json({
      success: true,
      message: 'Enum columns successfully converted to TEXT',
      data: {
        priorityConverted: true,
        statusConverted: true,
        defaultsSet: true,
        testPassed: true
      }
    })

  } catch (error) {
    console.error('❌ Enum conversion failed:', error)

    return NextResponse.json({
      success: false,
      error: 'Failed to convert enum columns',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}