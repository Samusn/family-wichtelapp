import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      max_tokens: 300,
    })

    const text = completion.choices[0].message?.content || ''
    return NextResponse.json({ text })
  } catch (err) {
    console.error(err)
    return NextResponse.json({ error: 'Fehler beim Chat' }, { status: 500 })
  }
}

