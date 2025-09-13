import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'API endpoint is working!',
    timestamp: new Date().toISOString(),
    env_check: {
      database_url: !!process.env.DATABASE_URL,
      supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL
    }
  })
}