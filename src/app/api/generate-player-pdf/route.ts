import { NextRequest, NextResponse } from 'next/server'
import puppeteer from 'puppeteer-core'
import chromium from '@sparticuz/chromium'

// Vercel serverless config
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 30

export async function POST(request: NextRequest) {
  try {
    const { playerData, aiImprovedNotes } = await request.json()

    if (!playerData) {
      return NextResponse.json({ error: 'Player data is required' }, { status: 400 })
    }

    // Generate PDF using Puppeteer + Chromium (premium quality)
    const pdfBuffer = await generatePuppeteerPDF(playerData, aiImprovedNotes)

    // Return PDF as response
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${playerData.firstName}_${playerData.lastName}_Scout_Report.pdf"`,
        'Cache-Control': 'no-store'
      }
    })

  } catch (error) {
    console.error('PDF generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    )
  }
}

async function generatePuppeteerPDF(player: any, aiImprovedNotes: string | null): Promise<Buffer> {
  let browser

  try {
    // Launch Chromium with Vercel-optimized settings
    browser = await puppeteer.launch({
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      headless: true
    })

    const page = await browser.newPage()

    // Generate the HTML content using existing function
    const htmlContent = generatePDFHTML(player, aiImprovedNotes)

    // Set content and wait for full load
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0',
      timeout: 15000
    })

    // Generate PDF with high quality settings
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '20mm',
        right: '16mm',
        bottom: '20mm',
        left: '16mm'
      },
      preferCSSPageSize: true
    })

    return Buffer.from(pdfBuffer)

  } finally {
    if (browser) {
      await browser.close()
    }
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
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            line-height: 1.5;
            background: white;
            padding: 0;
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
            }
        }

        /* Ensure fonts load properly */
        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
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
                    <span class="info-value">${player.weight ? player.weight + ' kg' : 'Ej angivet'}</span>
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