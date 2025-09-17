import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

interface PDFRequest {
  html?: string
  url?: string
  fileName?: string
  playerData?: any
  aiImprovedNotes?: string | null
}

const ALLOWED_HOSTS = new Set([
  'hub2-seven.vercel.app',
  'hub2-fqi83azof-hector-bataks-projects.vercel.app',
  'localhost:3000',
  '127.0.0.1:3000'
])

function sanitizeFileName(name: string) {
  const base = (name || 'document.pdf').replace(/[^a-zA-Z0-9_.-]/g, '_')
  const withExt = base.toLowerCase().endsWith('.pdf') ? base : `${base}.pdf`
  return withExt.slice(0, 120)
}

export async function POST(request: NextRequest) {
  try {
    const { html, url, fileName = 'document.pdf', playerData, aiImprovedNotes }: PDFRequest = await request.json()

    // Support both new format (html/url) and legacy format (playerData)
    let htmlContent = html
    let targetUrl = url
    let finalFileName = fileName

    if (playerData) {
      // Legacy support - generate HTML from playerData
      htmlContent = generatePDFHTML(playerData, aiImprovedNotes || null)
      finalFileName = `${playerData.firstName}_${playerData.lastName}_Scout_Report.pdf`
    }

    if (!htmlContent && !targetUrl) {
      return NextResponse.json({ error: 'Either html, url, or playerData is required' }, { status: 400 })
    }

    if (targetUrl) {
      let host: string | null = null
      try { host = new URL(targetUrl).host } catch {}
      if (!host || !ALLOWED_HOSTS.has(host)) {
        return NextResponse.json({ error: 'URL not allowed' }, { status: 400 })
      }
    }

    // Different setup for dev vs prod
    const isDev = process.env.NODE_ENV === 'development'
    let browser

    if (isDev) {
      // Local development: use system Chrome
      const { default: puppeteer } = await import('puppeteer-core')

      // Try to find Chrome executable on Windows
      const possiblePaths = [
        'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
        'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
        process.env.CHROME_PATH || '',
      ]

      let executablePath = ''
      for (const path of possiblePaths) {
        if (path) {
          try {
            const fs = await import('fs')
            if (fs.existsSync(path)) {
              executablePath = path
              break
            }
          } catch {}
        }
      }

      if (!executablePath) {
        return NextResponse.json({
          error: 'Chrome not found. Please install Chrome or set CHROME_PATH environment variable'
        }, { status: 500 })
      }

      browser = await puppeteer.launch({
        executablePath,
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      })
    } else {
      // Production: use @sparticuz/chromium
      const [{ default: chromium }, { default: puppeteer }] = await Promise.all([
        import('@sparticuz/chromium'),
        import('puppeteer-core'),
      ])

      browser = await puppeteer.launch({
        args: chromium.args,
        executablePath: await chromium.executablePath(),
        headless: true,
      })
    }

    try {
      const page = await browser.newPage()
      // Set viewport to match typical A4 document proportions for consistent PDF rendering
      await page.setViewport({
        width: 800,
        height: 1200,
        deviceScaleFactor: 1
      })

      // Optimize resource loading for faster rendering
      await page.setRequestInterception(true)
      page.on('request', (req) => {
        const type = req.resourceType()
        // Block only truly unnecessary resources
        if (['media', 'websocket', 'eventsource', 'manifest'].includes(type)) {
          return req.abort()
        }
        req.continue()
      })

      if (htmlContent) {
        await page.setContent(htmlContent, { waitUntil: 'networkidle0', timeout: 15000 })
      } else if (targetUrl) {
        await page.goto(targetUrl, { waitUntil: 'networkidle0', timeout: 15000 })
      }

      // Apply print CSS
      await page.emulateMediaType('print')

      const pdfBuffer = await page.pdf({
        printBackground: true,
        format: 'A4',
        margin: { top: '16mm', right: '16mm', bottom: '16mm', left: '16mm' },
        preferCSSPageSize: true,
      })

      const safeFileName = sanitizeFileName(finalFileName)
      return new Response(pdfBuffer as BodyInit, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `inline; filename="${safeFileName}"`,
          'Cache-Control': 'no-store',
        },
      })
    } finally {
      await browser.close()
    }
  } catch (error) {
    const isDev = process.env.NODE_ENV === 'development'

    // Always log detailed errors for debugging production issues
    console.error('PDF generation error (detailed):', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV,
      nodeVersion: process.version,
      platform: process.platform
    })

    // Return detailed error message for debugging
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({
      error: `PDF generation failed: ${errorMessage}`,
      details: isDev ? {
        stack: error instanceof Error ? error.stack : undefined,
        environment: process.env.NODE_ENV
      } : undefined
    }, { status: 500 })
  }
}


function generatePDFHTML(player: any, aiImprovedNotes: string | null): string {
  const currentDate = new Date().toLocaleDateString('sv-SE')

  // Calculate age
  const calculateAge = (dateOfBirth?: Date) => {
    if (!dateOfBirth) return null
    const today = new Date()
    const birthDate = new Date(dateOfBirth)
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age
  }

  const age = calculateAge(player.dateOfBirth)

  // Format positions
  const formatPositions = (positions: string[]) => {
    if (!positions || positions.length === 0) return 'Player'
    return positions.join(', ')
  }

  const positions = formatPositions(player.positions || [])

  // Format currency
  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`
    return `€${amount}`
  }

  // Format date
  const formatDate = (date?: Date) => {
    if (!date) return 'Ej angivet'
    return new Date(date).toLocaleDateString('sv-SE')
  }

  return `<!DOCTYPE html>
<html lang="sv">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Spelarprofil - ${player.firstName} ${player.lastName}</title>
    <style>
        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }

        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            color: #333;
            line-height: 1.5;
            background: white;
            padding: 0;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
        }

        .page-container {
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 25px;
            margin-bottom: 40px;
            padding: 25px;
            background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
            border-radius: 12px;
            border-left: 6px solid #d4af37;
        }

        .player-photo {
            width: 120px;
            height: 120px;
            border-radius: 12px;
            background: linear-gradient(135deg, #e2e8f0 0%, #cbd5e1 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            color: #64748b;
            font-weight: bold;
            flex-shrink: 0;
            border: 2px solid #e2e8f0;
        }

        .player-basic-info h1 {
            font-size: 2.2rem;
            color: #1e293b;
            margin-bottom: 12px;
            font-weight: 700;
        }

        .player-subtitle {
            font-size: 1.1rem;
            color: #64748b;
            font-weight: 500;
        }

        .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 30px;
            margin-bottom: 40px;
        }

        .info-section {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 25px;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .info-section h3 {
            margin: 0 0 20px 0;
            color: #d4af37;
            font-size: 1.3rem;
            font-weight: 600;
            border-bottom: 2px solid #d4af37;
            padding-bottom: 8px;
        }

        .info-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 0;
            border-bottom: 1px solid #f1f5f9;
        }

        .info-item:last-child {
            border-bottom: none;
        }

        .info-label {
            font-weight: 600;
            color: #475569;
            font-size: 0.95rem;
        }

        .info-value {
            font-weight: 500;
            color: #1e293b;
            font-size: 0.95rem;
            text-align: right;
        }

        .stats-section {
            margin-bottom: 40px;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
            margin-top: 20px;
        }

        .stat-card {
            background: white;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .stat-value {
            font-size: 2rem;
            font-weight: 700;
            color: #d4af37;
            margin-bottom: 8px;
        }

        .stat-label {
            font-size: 0.9rem;
            color: #64748b;
            font-weight: 500;
        }

        .notes-section {
            margin-bottom: 40px;
            padding: 25px;
            background: #fefcf3;
            border-radius: 12px;
            border-left: 6px solid #d4af37;
            border: 1px solid #f59e0b20;
        }

        .notes-section h3 {
            margin: 0 0 20px 0;
            color: #d4af37;
            font-size: 1.3rem;
            font-weight: 600;
        }

        .notes-content {
            color: #374151;
            line-height: 1.7;
            font-size: 1rem;
        }

        .notes-content strong {
            color: #1f2937;
            font-weight: 600;
        }

        .pdf-footer {
            margin-top: 60px;
            text-align: center;
            padding-top: 30px;
            border-top: 2px solid #e2e8f0;
            color: #64748b;
            font-size: 0.9rem;
        }

        .company-info {
            margin-top: 25px;
            padding: 20px;
            background: linear-gradient(135deg, #d4af37 0%, #b8941f 100%);
            color: white;
            border-radius: 8px;
            font-weight: 500;
        }

        .company-info strong {
            font-size: 1.1rem;
            display: block;
            margin-bottom: 5px;
        }

        @page {
            size: A4;
            margin: 16mm;
        }

        @media print {
            .page-container {
                max-width: none;
                margin: 0;
                padding: 0;
            }

            body {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                color-adjust: exact;
            }

            /* Optimize for print rendering */
            * {
                box-shadow: none !important;
                text-shadow: none !important;
            }
        }
    </style>
</head>
<body>
    <div class="page-container">
        <!-- Header -->
        <div class="player-header">
            <div class="player-photo">
                ${player.firstName ? player.firstName.substring(0, 1) : 'S'}${player.lastName ? player.lastName.substring(0, 1) : 'P'}
            </div>
            <div class="player-basic-info">
                <h1>${player.firstName || ''} ${player.lastName || ''}</h1>
                <div class="player-subtitle">
                    ${positions} | ${age || 'Okänd ålder'} år | ${player.nationality || 'Okänd nationalitet'}
                </div>
            </div>
        </div>

        <!-- Information Grid -->
        <div class="info-grid">
            <div class="info-section">
                <h3>Personlig Information</h3>
                <div class="info-item">
                    <span class="info-label">Ålder:</span>
                    <span class="info-value">${age || 'Ej angivet'} år</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Längd:</span>
                    <span class="info-value">${player.height ? player.height + ' cm' : 'Ej angivet'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Vikt:</span>
                    <span class="info-value">Ej angivet</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Födelsedatum:</span>
                    <span class="info-value">${formatDate(player.dateOfBirth)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Nationalitet:</span>
                    <span class="info-value">${player.nationality || 'Ej angivet'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Dominant fot:</span>
                    <span class="info-value">${player.preferredFoot || 'Ej angivet'}</span>
                </div>
            </div>

            <div class="info-section">
                <h3>Klubb & Kontrakt</h3>
                <div class="info-item">
                    <span class="info-label">Nuvarande klubb:</span>
                    <span class="info-value">${player.club || 'Free Agent'}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Kontraktslut:</span>
                    <span class="info-value">${formatDate(player.contractExpiry)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Marknadsvärde:</span>
                    <span class="info-value">${formatCurrency(player.marketValue)}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Betyg:</span>
                    <span class="info-value">${player.rating ? player.rating.toFixed(1) : 'Ej angivet'}</span>
                </div>
            </div>
        </div>

        <!-- Season Stats -->
        <div class="stats-section">
            <h3 style="color: #d4af37; font-size: 1.3rem; font-weight: 600; margin-bottom: 0;">Säsongsstatistik</h3>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-value">${player.goalsThisSeason || 0}</div>
                    <div class="stat-label">Mål</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${player.assistsThisSeason || 0}</div>
                    <div class="stat-label">Assist</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${player.appearances || 0}</div>
                    <div class="stat-label">Matcher</div>
                </div>
                <div class="stat-card">
                    <div class="stat-value">${player.minutesPlayed || 0}</div>
                    <div class="stat-label">Minuter</div>
                </div>
            </div>
        </div>

        <!-- Notes -->
        ${(player.notes || aiImprovedNotes) ? `
            <div class="notes-section">
                <h3>Scoutanteckningar</h3>
                <div class="notes-content">${aiImprovedNotes || player.notes}</div>
            </div>
        ` : ''}

        <!-- Footer -->
        <div class="pdf-footer">
            <div>Genererad: ${currentDate}</div>
            <div class="company-info">
                <strong>Elite Sports Group AB</strong>
                Professional Football Agents
            </div>
        </div>
    </div>
</body>
</html>`
}