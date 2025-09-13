import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    // Test database connection first
    await prisma.$connect()
    console.log('Database connection established')

    // Create tables manually using raw SQL since we can't run shell commands in Vercel
    console.log('Creating database tables...')

    // Create enums first
    await prisma.$executeRaw`
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TenantRole') THEN
          CREATE TYPE "TenantRole" AS ENUM ('OWNER', 'ADMIN', 'MANAGER', 'SCOUT', 'VIEWER');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Priority') THEN
          CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'RequestStatus') THEN
          CREATE TYPE "RequestStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'TrialStatus') THEN
          CREATE TYPE "TrialStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
        END IF;
        IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'EventType') THEN
          CREATE TYPE "EventType" AS ENUM ('TRIAL', 'MEETING', 'MATCH', 'TRAINING', 'SCOUTING', 'OTHER');
        END IF;
      END $$;
    `

    // Create tenants table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tenants" (
        "id" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "description" TEXT,
        "logoUrl" TEXT,
        "settings" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tenants_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "tenants_slug_key" UNIQUE ("slug")
      );
    `

    // Create users table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "firstName" TEXT,
        "lastName" TEXT,
        "avatarUrl" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "users_email_key" UNIQUE ("email")
      );
    `

    // Create tenant_memberships table
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS "tenant_memberships" (
        "id" TEXT NOT NULL,
        "tenantId" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "role" "TenantRole" NOT NULL DEFAULT 'VIEWER',
        "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "tenant_memberships_pkey" PRIMARY KEY ("id"),
        CONSTRAINT "tenant_memberships_tenantId_userId_key" UNIQUE ("tenantId", "userId"),
        CONSTRAINT "tenant_memberships_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
        CONSTRAINT "tenant_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
      );
    `

    // Create indexes
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "tenant_memberships_tenantId_idx" ON "tenant_memberships"("tenantId");`
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS "tenant_memberships_userId_idx" ON "tenant_memberships"("userId");`

    // Verify tables were created
    const tables = await prisma.$queryRaw`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `

    console.log('Tables created:', tables)

    return Response.json({
      success: true,
      message: 'Database migration completed successfully',
      tables: tables
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