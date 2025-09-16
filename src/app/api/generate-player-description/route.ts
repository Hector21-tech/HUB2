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

    const prompt = `Du är en professionell fotbollsscout som skriver detaljerade spelarrapporter för klubbar. Skapa en professionell och informativ beskrivning av följande spelare på svenska:

Spelarinfo:
- Namn: ${firstName} ${lastName}
- Ålder: ${age || 'Okänd'}
- Nationalitet: ${nationality || 'Okänd'}
- Position: ${positions?.join(', ') || 'Okänd'}
- Nuvarande klubb: ${club || 'Klubblös'}
- Betyg: ${rating || 'Ej betygsatt'}/10
- Mål denna säsong: ${goalsThisSeason || 0}
- Assist denna säsong: ${assistsThisSeason || 0}
- Marknadsvärde: ${marketValue ? `€${marketValue.toLocaleString()}` : 'Ej uppskattat'}

Scout-anteckningar:
${notes || 'Inga anteckningar tillgängliga'}

Skriv en professionell rapport på svenska som:
1. Börjar med en kort sammanfattning av spelaren
2. Beskriver tekniska färdigheter och spelstil
3. Kommenterar fysiska egenskaper och prestationer
4. Avslutar med rekommendationer och potential

Håll texten mellan 200-400 ord och använd professionellt språk som passar för att skicka till fotbollsklubbar.`

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