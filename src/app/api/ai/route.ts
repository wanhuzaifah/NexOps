import { NextRequest, NextResponse } from 'next/server'
import {
  tenderScoutAgent,
  marketIntelAgent,
  researchAgent,
  routeIntent,
} from '@/lib/ai/deepseek'

// General-purpose AI endpoint (Telegram bot / n8n webhook use)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, input, context } = body as {
      type: string
      input: string
      context?: Record<string, unknown>
    }

    if (!type || !input) {
      return NextResponse.json({ success: false, error: 'Missing type or input' }, { status: 400 })
    }

    let result: unknown

    switch (type) {
      case 'tender_score':
        result = await tenderScoutAgent(input)
        break

      case 'market_intel':
        result = await marketIntelAgent(input, (context?.scope as 'malaysia' | 'global') || 'malaysia')
        break

      case 'research':
        result = await researchAgent(input)
        break

      case 'route_intent':
        result = await routeIntent(input)
        break

      default:
        return NextResponse.json({ success: false, error: `Unknown type: ${type}` }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result })
  } catch (error) {
    console.error('AI API error:', error)
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
