import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    await prisma.$connect()
    console.log('Setting up Row Level Security policies...')

    // Enable RLS on all tables (one at a time)
    await prisma.$executeRaw`ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "tenant_memberships" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "players" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "requests" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "trials" ENABLE ROW LEVEL SECURITY`
    await prisma.$executeRaw`ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY`

    // Create basic policies (we'll use permissive policies for now since we don't have auth context in serverless)

    // Tenants policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for tenants" ON "tenants"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for tenants" ON "tenants" FOR ALL USING (true)`

    // Users policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for users" ON "users"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for users" ON "users" FOR ALL USING (true)`

    // Tenant memberships policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for memberships" ON "tenant_memberships"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for memberships" ON "tenant_memberships" FOR ALL USING (true)`

    // Players policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for players" ON "players"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for players" ON "players" FOR ALL USING (true)`

    // Requests policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for requests" ON "requests"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for requests" ON "requests" FOR ALL USING (true)`

    // Trials policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for trials" ON "trials"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for trials" ON "trials" FOR ALL USING (true)`

    // Calendar events policies
    await prisma.$executeRaw`DROP POLICY IF EXISTS "Enable all access for events" ON "calendar_events"`
    await prisma.$executeRaw`CREATE POLICY "Enable all access for events" ON "calendar_events" FOR ALL USING (true)`

    console.log('RLS policies created successfully')

    return Response.json({
      success: true,
      message: 'Row Level Security enabled with basic policies. Tenant isolation will be enforced at the application level.',
      note: 'For production, implement proper auth-based policies using Supabase Auth context'
    })
  } catch (error) {
    console.error('RLS setup error:', error)

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

    // Check if RLS is enabled on tables
    const rlsStatus = await prisma.$queryRaw`
      SELECT schemaname, tablename, rowsecurity
      FROM pg_tables
      WHERE schemaname = 'public'
      AND tablename IN ('tenants', 'users', 'tenant_memberships', 'players', 'requests', 'trials', 'calendar_events')
      ORDER BY tablename;
    `

    // Get policy information
    const policies = await prisma.$queryRaw`
      SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
      FROM pg_policies
      WHERE schemaname = 'public'
      ORDER BY tablename, policyname;
    `

    return Response.json({
      success: true,
      rlsStatus,
      policies,
      message: 'RLS status retrieved successfully'
    })
  } catch (error) {
    console.error('RLS check error:', error)

    return Response.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}