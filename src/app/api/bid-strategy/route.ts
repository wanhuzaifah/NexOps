import { NextRequest, NextResponse } from 'next/server'
import { bidStrategyAgent } from '@/lib/ai/deepseek'

export async function POST(request: NextRequest) {
  try {
    const { tender } = await request.json() as {
      tender: {
        title: string
        agency: string
        estimated_value: string
        location: string
        match_reasons: string[]
      }
    }

    if (!tender?.title) {
      return NextResponse.json({ error: 'tender data required' }, { status: 400 })
    }

    const strategy = await bidStrategyAgent(tender)
    return NextResponse.json({ success: true, strategy })
  } catch (error) {
    console.error('Bid strategy error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
