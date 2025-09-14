import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Adding avatarUrl column to players table...')

    // Check if column already exists
    const { data: columns, error: checkError } = await supabase.rpc('check_column_exists', {
      table_name: 'players',
      column_name: 'avatarUrl'
    })

    if (checkError) {
      console.log('Column check failed, proceeding with ALTER anyway...')
    }

    // Add avatarUrl column if it doesn't exist
    const { error: alterError } = await supabase.rpc('execute_sql', {
      sql: `
        DO $$
        BEGIN
          IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'players'
            AND column_name = 'avatarUrl'
          ) THEN
            ALTER TABLE players ADD COLUMN "avatarUrl" TEXT;
            RAISE NOTICE 'Added avatarUrl column to players table';
          ELSE
            RAISE NOTICE 'avatarUrl column already exists';
          END IF;
        END $$;
      `
    })

    if (alterError) {
      console.error('❌ Error adding column via RPC:', alterError)

      // Try direct SQL approach
      const { error: directError } = await supabase
        .from('_sql')
        .select('*')
        .limit(0) // This will fail but let us execute raw SQL

      // Fallback: try using raw query
      try {
        await supabase.query(`
          ALTER TABLE players
          ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
        `)
        console.log('✅ Added avatarUrl column using direct query')
      } catch (directErr) {
        console.error('❌ Direct query also failed:', directErr)
        throw new Error('Could not add avatarUrl column')
      }
    } else {
      console.log('✅ Successfully executed column addition via RPC')
    }

    return NextResponse.json({
      success: true,
      message: 'avatarUrl column added successfully to players table'
    })

  } catch (error) {
    console.error('❌ Error adding avatarUrl column:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add avatarUrl column',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    )
  }
}