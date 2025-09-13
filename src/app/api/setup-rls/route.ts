import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  try {
    await prisma.$connect()
    console.log('Setting up Row Level Security policies...')

    // Enable RLS on all tables
    await prisma.$executeRaw`ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "tenant_memberships" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "players" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "requests" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "trials" ENABLE ROW LEVEL SECURITY;`
    await prisma.$executeRaw`ALTER TABLE "calendar_events" ENABLE ROW LEVEL SECURITY;`

    // Create helper function to check tenant membership
    await prisma.$executeRaw`
      CREATE OR REPLACE FUNCTION user_has_tenant_access(tenant_id TEXT)
      RETURNS BOOLEAN AS $$
      BEGIN
        RETURN EXISTS (
          SELECT 1 FROM tenant_memberships tm
          WHERE tm."tenantId" = tenant_id
          AND tm."userId" = auth.uid()::text
        );
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    // RLS Policies for tenants table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Users can view tenants they belong to" ON "tenants";
      CREATE POLICY "Users can view tenants they belong to" ON "tenants"
        FOR SELECT USING (user_has_tenant_access(id));
    `

    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Owners can modify their tenant" ON "tenants";
      CREATE POLICY "Owners can modify their tenant" ON "tenants"
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM tenant_memberships tm
            WHERE tm."tenantId" = id
            AND tm."userId" = auth.uid()::text
            AND tm.role IN ('OWNER', 'ADMIN')
          )
        );
    `

    // RLS Policies for users table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Users can view themselves and tenant members" ON "users";
      CREATE POLICY "Users can view themselves and tenant members" ON "users"
        FOR SELECT USING (
          id = auth.uid()::text OR
          EXISTS (
            SELECT 1 FROM tenant_memberships tm1
            JOIN tenant_memberships tm2 ON tm1."tenantId" = tm2."tenantId"
            WHERE tm1."userId" = auth.uid()::text AND tm2."userId" = id
          )
        );
    `

    // RLS Policies for tenant_memberships table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Users can view memberships for their tenants" ON "tenant_memberships";
      CREATE POLICY "Users can view memberships for their tenants" ON "tenant_memberships"
        FOR SELECT USING (user_has_tenant_access("tenantId"));
    `

    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Admins can manage memberships" ON "tenant_memberships";
      CREATE POLICY "Admins can manage memberships" ON "tenant_memberships"
        FOR ALL USING (
          EXISTS (
            SELECT 1 FROM tenant_memberships tm
            WHERE tm."tenantId" = "tenantId"
            AND tm."userId" = auth.uid()::text
            AND tm.role IN ('OWNER', 'ADMIN')
          )
        );
    `

    // RLS Policies for players table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Tenant members can access players" ON "players";
      CREATE POLICY "Tenant members can access players" ON "players"
        FOR ALL USING (user_has_tenant_access("tenantId"));
    `

    // RLS Policies for requests table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Tenant members can access requests" ON "requests";
      CREATE POLICY "Tenant members can access requests" ON "requests"
        FOR ALL USING (user_has_tenant_access("tenantId"));
    `

    // RLS Policies for trials table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Tenant members can access trials" ON "trials";
      CREATE POLICY "Tenant members can access trials" ON "trials"
        FOR ALL USING (user_has_tenant_access("tenantId"));
    `

    // RLS Policies for calendar_events table
    await prisma.$executeRaw`
      DROP POLICY IF EXISTS "Tenant members can access events" ON "calendar_events";
      CREATE POLICY "Tenant members can access events" ON "calendar_events"
        FOR ALL USING (user_has_tenant_access("tenantId"));
    `

    console.log('RLS policies created successfully')

    return Response.json({
      success: true,
      message: 'Row Level Security policies implemented successfully'
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