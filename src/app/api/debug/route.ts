import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const headers = Object.fromEntries(request.headers.entries())

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    method: request.method,
    url: request.url,
    pathname: request.nextUrl.pathname,
    searchParams: Object.fromEntries(request.nextUrl.searchParams.entries()),
    headers: {
      'user-agent': headers['user-agent'],
      'referer': headers['referer'],
      'accept': headers['accept']
    }
  })
}

export async function POST(request: NextRequest) {
  return GET(request)
}

export async function PUT(request: NextRequest) {
  return GET(request)
}

export async function DELETE(request: NextRequest) {
  return GET(request)
}

export async function PATCH(request: NextRequest) {
  return GET(request)
}