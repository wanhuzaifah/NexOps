import { NextRequest, NextResponse } from 'next/server'
import { tenderScoutAgent } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'

const HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Cache-Control': 'no-cache',
}

const TENDER_SOURCES = [
  {
    name: 'JKR',
    url: 'https://tender.jkr.gov.my/kenyataan/tender',
    type: 'tier1',
  },
  {
    name: 'MyProcurement',
    url: 'https://myprocurement.treasury.gov.my/iklan/tender/',
    type: 'tier1',
  },
  {
    name: 'CIDB',
    url: 'https://www.cidb.gov.my/eng/',
    type: 'tier1',
  },
]

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function scrapeSimple(url: string): Promise<string> {
  try {
    await delay(2000 + Math.random() * 3000)
    const response = await fetch(url, {
      headers: HEADERS,
      signal: AbortSignal.timeout(15000),
    })
    if (!response.ok) return ''
    const html = await response.text()
    // Basic HTML to text — extract visible text
    const text = html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    return text.slice(0, 10000) // Limit to 10K chars
  } catch {
    return ''
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_id, manual_content } = body

    if (!company_id) {
      return NextResponse.json({ success: false, error: 'Missing company_id' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const results = []

    // Use manual content if provided (for testing), otherwise scrape
    const contentToProcess = manual_content
      ? [{ source: 'Manual', content: manual_content }]
      : await Promise.all(
          TENDER_SOURCES.map(async (source) => ({
            source: source.name,
            content: await scrapeSimple(source.url),
          }))
        )

    // Process each source
    for (const { source, content } of contentToProcess) {
      if (!content || content.length < 100) continue

      try {
        const scored = await tenderScoutAgent(content)

        for (const tender of scored) {
          if ((tender.relevance_score || 0) < 40) continue // Skip irrelevant

          // Upsert to database
          const { data } = await supabase
            .from('tender_cache')
            .upsert(
              {
                company_id,
                source,
                source_url: TENDER_SOURCES.find((s) => s.name === source)?.url,
                title: tender.title,
                agency: tender.agency,
                estimated_value: tender.estimated_value,
                closing_date: tender.closing_date || null,
                location: tender.location,
                relevance_score: tender.relevance_score,
                match_reasons: tender.match_reasons,
                status: 'new',
                scraped_at: new Date().toISOString(),
              },
              {
                onConflict: 'source,tender_id_external',
                ignoreDuplicates: true,
              }
            )
            .select()

          if (data) results.push(...data)
        }
      } catch (err) {
        console.error(`Error processing ${source}:`, err)
      }
    }

    const highMatch = results.filter((r) => r.relevance_score >= 60)

    return NextResponse.json({
      success: true,
      total_scraped: results.length,
      high_match: highMatch.length,
      tenders: results,
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const company_id = searchParams.get('company_id')
    const status = searchParams.get('status') || 'new'
    const min_score = parseInt(searchParams.get('min_score') || '0')

    if (!company_id) {
      return NextResponse.json({ success: false, error: 'Missing company_id' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('tender_cache')
      .select('*')
      .eq('company_id', company_id)
      .eq('status', status)
      .gte('relevance_score', min_score)
      .order('relevance_score', { ascending: false })
      .limit(50)

    if (error) throw error

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 })
  }
}
