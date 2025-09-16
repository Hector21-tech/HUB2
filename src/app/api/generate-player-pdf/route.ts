import { NextRequest, NextResponse } from 'next/server'
import jsPDF from 'jspdf'

export async function POST(request: NextRequest) {
  try {
    const { playerData, aiImprovedNotes } = await request.json()

    if (!playerData) {
      return NextResponse.json({ error: 'Player data is required' }, { status: 400 })
    }

    // Generate PDF using jsPDF (server-compatible)
    const pdfBuffer = await generateServerPDF(playerData, aiImprovedNotes)

    // Return PDF as response
    return new Response(pdfBuffer as BodyInit, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${playerData.firstName}_${playerData.lastName}_Scout_Report.pdf"`
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

async function generateServerPDF(player: any, aiImprovedNotes: string | null): Promise<Buffer> {
  const pdf = new jsPDF('p', 'mm', 'a4')

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
  const currentDate = new Date().toLocaleDateString('sv-SE')

  // Format functions
  const formatPositions = (positions: string[]) => {
    if (!positions || positions.length === 0) return 'Player'
    return positions.join(', ')
  }

  const formatCurrency = (amount?: number) => {
    if (!amount) return 'N/A'
    if (amount >= 1000000) return `€${(amount / 1000000).toFixed(1)}M`
    if (amount >= 1000) return `€${(amount / 1000).toFixed(0)}K`
    return `€${amount}`
  }

  const formatDate = (date?: Date) => {
    if (!date) return 'Ej angivet'
    return new Date(date).toLocaleDateString('sv-SE')
  }

  const positions = formatPositions(player.positions || [])

  // Set up colors
  const primaryColor: [number, number, number] = [212, 175, 55] // Gold
  const textColor: [number, number, number] = [51, 51, 51] // Dark gray
  const lightGray: [number, number, number] = [128, 128, 128]

  // Title
  pdf.setFontSize(24)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('SPELARPROFIL', 20, 30)

  // Player header
  pdf.setFontSize(20)
  pdf.setTextColor(textColor[0], textColor[1], textColor[2])
  pdf.text(`${player.firstName || ''} ${player.lastName || ''}`, 20, 50)

  pdf.setFontSize(12)
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  pdf.text(`${positions} | ${age || 'Okänd ålder'} år | ${player.nationality || 'Okänd nationalitet'}`, 20, 58)

  // Personal Information Section
  let yPos = 80
  pdf.setFontSize(14)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('PERSONLIG INFORMATION', 20, yPos)

  pdf.setFontSize(10)
  pdf.setTextColor(textColor[0], textColor[1], textColor[2])
  yPos += 10

  const personalInfo = [
    ['Ålder:', `${age || 'Ej angivet'} år`],
    ['Längd:', player.height ? `${player.height} cm` : 'Ej angivet'],
    ['Vikt:', player.weight ? `${player.weight} kg` : 'Ej angivet'],
    ['Födelsedatum:', formatDate(player.dateOfBirth)],
    ['Nationalitet:', player.nationality || 'Ej angivet'],
    ['Dominant fot:', player.preferredFoot || 'Ej angivet']
  ]

  personalInfo.forEach(([label, value]) => {
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.text(label, 25, yPos)
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.text(value, 70, yPos)
    yPos += 8
  })

  // Club & Contract Section
  yPos += 10
  pdf.setFontSize(14)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('KLUBB & KONTRAKT', 20, yPos)

  pdf.setFontSize(10)
  pdf.setTextColor(textColor[0], textColor[1], textColor[2])
  yPos += 10

  const clubInfo = [
    ['Nuvarande klubb:', player.club || 'Free Agent'],
    ['Kontraktslut:', formatDate(player.contractExpiry)],
    ['Marknadsvärde:', formatCurrency(player.marketValue)],
    ['Betyg:', player.rating ? player.rating.toFixed(1) : 'Ej angivet']
  ]

  clubInfo.forEach(([label, value]) => {
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.text(label, 25, yPos)
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.text(value, 70, yPos)
    yPos += 8
  })

  // Season Stats Section
  yPos += 10
  pdf.setFontSize(14)
  pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.text('SÄSONGSSTATISTIK', 20, yPos)

  pdf.setFontSize(10)
  pdf.setTextColor(textColor[0], textColor[1], textColor[2])
  yPos += 10

  const stats = [
    ['Mål:', (player.goalsThisSeason || 0).toString()],
    ['Assist:', (player.assistsThisSeason || 0).toString()],
    ['Matcher:', (player.appearances || 0).toString()],
    ['Minuter:', (player.minutesPlayed || 0).toString()]
  ]

  stats.forEach(([label, value]) => {
    pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2])
    pdf.text(label, 25, yPos)
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    pdf.text(value, 70, yPos)
    yPos += 8
  })

  // Notes Section
  if (player.notes || aiImprovedNotes) {
    yPos += 10
    pdf.setFontSize(14)
    pdf.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2])
    pdf.text('SCOUTANTECKNINGAR', 20, yPos)

    pdf.setFontSize(10)
    pdf.setTextColor(textColor[0], textColor[1], textColor[2])
    yPos += 10

    const notes = aiImprovedNotes || player.notes
    // Split long text into lines
    const lines = pdf.splitTextToSize(notes, 170)

    lines.forEach((line: string) => {
      if (yPos > 250) { // Start new page if needed
        pdf.addPage()
        yPos = 30
      }
      pdf.text(line, 25, yPos)
      yPos += 6
    })
  }

  // Footer
  yPos = 270 // Bottom of page
  pdf.setFontSize(8)
  pdf.setTextColor(lightGray[0], lightGray[1], lightGray[2])
  pdf.text(`Genererad: ${currentDate}`, 20, yPos)

  // Company info
  yPos += 10
  pdf.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2])
  pdf.rect(20, yPos - 5, 170, 15, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(10)
  pdf.text('Elite Sports Group AB', 25, yPos + 2)
  pdf.setFontSize(8)
  pdf.text('Professional Football Agents', 25, yPos + 8)

  const arrayBuffer = pdf.output('arraybuffer')
  return Buffer.from(arrayBuffer)
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

        @media print {
            .page-container {
                max-width: none;
                margin: 0;
                padding: 0;
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