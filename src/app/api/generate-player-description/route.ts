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

    const prompt = `Du är en professionell fotbollsscout som skriver spelarrapporter för klubbar. Analysera endast den faktiska informationen som finns tillgänglig.

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

VIKTIGT:
- Basera ENDAST analysen på den information som faktiskt finns tillgänglig
- Skriv INTE samma punkt flera gånger
- Variera innehållet och fokusera på olika aspekter
- Skapa UNIKA och SPECIFIKA punkter baserat på tillgänglig data

Skapa en kort rapport (max 3-4 meningar totalt) strukturerad så här:

Styrkor:
${hasNotes ? '[Analysera scout-anteckningarna och skriv 2-3 OLIKA punkter med • symbol]' : '[Baserat på tillgänglig statistik, skriv 1-2 punkter med • symbol]'}

SVAGHETER-SEKTION:
- Skriv ENDAST "Svagheter:" om det finns SPECIFIKA NEGATIVA kommentarer i anteckningarna
- Annars hoppa över svagheter-sektionen helt

Använd professionellt språk. Skriv ALDRIG samma information flera gånger.`

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