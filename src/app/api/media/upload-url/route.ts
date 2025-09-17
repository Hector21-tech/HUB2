import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Generate signed upload URL for player avatar
export async function POST(request: NextRequest) {
  try {
    const { tenantId, playerId, fileName, fileType } = await request.json()

    // Validate required fields
    if (!tenantId || !playerId || !fileName || !fileType) {
      return NextResponse.json(
        { error: 'Missing required fields: tenantId, playerId, fileName, fileType' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(fileType)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed' },
        { status: 400 }
      )
    }

    // Generate unique filename with timestamp
    const timestamp = Date.now()
    const uuid = Math.random().toString(36).substring(2, 15)
    const extension = fileName.split('.').pop()?.toLowerCase() || 'jpg'
    const storagePath = `player-avatars/${tenantId}/${playerId}/${timestamp}-${uuid}.${extension}`

    // Generate signed upload URL (30 minutes TTL)
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('player-avatars')
      .createSignedUploadUrl(storagePath, {
        expiresIn: 1800, // 30 minutes
      })

    if (uploadError) {
      console.error('Supabase upload URL error:', uploadError)
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      uploadUrl: uploadData.signedUrl,
      path: storagePath,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 min from now
    })

  } catch (error) {
    console.error('Upload URL generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}