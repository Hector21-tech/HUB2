import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Get signed download URL for player avatar
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tenantId = searchParams.get('tenantId')

    if (!path || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameters: path, tenantId' },
        { status: 400 }
      )
    }

    // Validate that the path belongs to the requested tenant
    if (!path.startsWith(`player-avatars/${tenantId}/`)) {
      return NextResponse.json(
        { error: 'Access denied: path does not belong to tenant' },
        { status: 403 }
      )
    }

    // Generate signed download URL (60 minutes TTL)
    const { data, error } = await supabase.storage
      .from('player-avatars')
      .createSignedUrl(path, 3600) // 60 minutes

    if (error) {
      console.error('Supabase signed URL error:', error)
      return NextResponse.json(
        { error: 'Failed to generate download URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      url: data.signedUrl,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 60 min from now
    })

  } catch (error) {
    console.error('Avatar URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete avatar file from storage
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const path = searchParams.get('path')
    const tenantId = searchParams.get('tenantId')

    if (!path || !tenantId) {
      return NextResponse.json(
        { error: 'Missing required parameters: path, tenantId' },
        { status: 400 }
      )
    }

    // Validate that the path belongs to the requested tenant
    if (!path.startsWith(`player-avatars/${tenantId}/`)) {
      return NextResponse.json(
        { error: 'Access denied: path does not belong to tenant' },
        { status: 403 }
      )
    }

    // Delete file from storage
    const { error } = await supabase.storage
      .from('player-avatars')
      .remove([path])

    if (error) {
      console.error('Supabase delete error:', error)
      return NextResponse.json(
        { error: 'Failed to delete file' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Avatar deletion error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}