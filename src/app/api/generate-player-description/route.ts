import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { playerData } = await request.json()

    if (!playerData) {
      return NextResponse.json(
        { error: 'Player data is required' },
        { status: 400 }
      )
    }

    const { firstName, lastName, positions, club, nationality, dateOfBirth, notes, rating, goalsThisSeason, assistsThisSeason, marketValue } = playerData

    const age = dateOfBirth ? Math.floor((new Date().getTime() - new Date(dateOfBirth).getTime()) / (1000 * 60 * 60 * 24 * 365)) : null

    // Check if there's meaningful data to create a report
    const hasNotes = notes && notes.trim() && notes.trim() !== ''
    const hasStats = (goalsThisSeason && goalsThisSeason > 0) || (assistsThisSeason && assistsThisSeason > 0)
    const hasRating = rating && rating > 0

    // If no meaningful data, return null to skip AI section
    if (!hasNotes && !hasStats && !hasRating) {
      return NextResponse.json({ description: null })
    }

    const prompt = `Du är en professionell fotbollsscout som skriver spelarrapporter för klubbar.

ABSOLUT FÖRBUD MOT:
- Att hitta på information som INTE finns i tillhandahållen data
- Att använda allmänna fotbollsfraser som "krosspassningar", "dynamisk spelare", "spelförståelse"
- Att spekulera om ålder, erfarenhet eller värde
- Att nämna specifika fotbollstekniker som inte nämns i scout-anteckningarna

Spelarinfo:
- Namn: ${firstName} ${lastName}
- Ålder: ${age || 'Okänd'}
- Nationalitet: ${nationality || 'Okänd'}
- Position: ${positions?.join(', ') || 'Okänd'}
- Nuvarande klubb: ${club || 'Klubblös'}
${hasRating ? `- Betyg: ${rating}/10` : ''}
${hasStats ? `- Mål denna säsong: ${goalsThisSeason || 0}` : ''}
${hasStats ? `- Assist denna säsong: ${assistsThisSeason || 0}` : ''}
${marketValue ? `- Marknadsvärde: €${marketValue.toLocaleString()}` : ''}

${hasNotes ? `Scout-anteckningar:\n${notes}` : ''}

STRIKT REGEL:
- Använd ENDAST ord och information som finns EXPLICIT i scout-anteckningarna ovan
- Om scout-anteckningarna säger "bra skott" - skriv om skott, INTE "krosspassningar"
- Om inga specifika tekniker nämns - skriv INGA tekniker
- Citera eller parafrasera ENDAST från anteckningarna

Skapa en rapport (max 2-3 meningar) strukturerad så här:

Styrkor:
${hasNotes ? '[Använd ENDAST ord och begrepp som finns i scout-anteckningarna. Skriv 1-2 punkter med • symbol]' : '[Baserat på statistik: skriv 1 punkt med • symbol]'}

SVAGHETER-SEKTION:
- OM det finns SPECIFIKA NEGATIVA kommentarer i scout-anteckningarna, då skriv "Svagheter:" följt av punkterna
- OM det INTE finns negativa kommentarer, skriv INGENTING om svagheter
- Skriv ALDRIG "Svagheter: Ingen specifik information tillgänglig"
- Skriv ALDRIG "Svagheter:" som rubrik om du inte har faktiska svagheter att lista
- HOPPA ÖVER hela svagheter-sektionen om ingen negativ information finns

EXEMPEL PÅ KORREKT FORMAT:
OM negativa kommentarer finns:
Styrkor:
• [punkt baserad på anteckningar]

Svagheter:
• [specifik negativ punkt från anteckningar]

OM INGA negativa kommentarer finns:
Styrkor:
• [punkt baserad på anteckningar]

[SLUT - ingen svagheter-sektion alls]

TILLÅT INTE fantasier eller allmänna fotbollskommentarer.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "Du är en expert fotbollsscout som skriver professionella spelarrapporter på svenska för fotbollsklubbar."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      max_tokens: 600,
      temperature: 0.7,
    })

    const description = completion.choices[0]?.message?.content

    if (!description) {
      throw new Error('Failed to generate description')
    }

    return NextResponse.json({ description })

  } catch (error) {
    console.error('Error generating player description:', error)
    return NextResponse.json(
      { error: 'Failed to generate player description' },
      { status: 500 }
    )
  }
}