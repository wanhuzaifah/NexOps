import { NextRequest, NextResponse } from 'next/server'
import { dailyBriefAgent } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { company_id } = await request.json() as { company_id: string }

    if (!company_id) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const supabase = await createAdminClient()

    // Fetch data in parallel
    const [{ data: tenders }, { data: digests }] = await Promise.all([
      supabase
        .from('tender_cache')
        .select('title, relevance_score, agency, closing_date, status')
        .eq('company_id', company_id)
        .gte('relevance_score', 70)
        .order('relevance_score', { ascending: false })
        .limit(10),
      supabase
        .from('market_digests')
        .select('content')
        .eq('company_id', company_id)
        .eq('type', 'digest')
        .order('created_at', { ascending: false })
        .limit(1),
    ])

    const { count: allTendersCount } = await supabase
      .from('tender_cache')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company_id)

    const { count: savedTendersCount } = await supabase
      .from('tender_cache')
      .select('id', { count: 'exact', head: true })
      .eq('company_id', company_id)
      .eq('status', 'saved')

    const brief = await dailyBriefAgent({
      highTenders: (tenders || []).map(t => ({
        title: t.title || '',
        score: t.relevance_score || 0,
        agency: t.agency || '',
        closing_date: t.closing_date,
      })),
      latestDigest: digests?.[0]?.content || 'No market digest available yet.',
      stats: {
        total: allTendersCount ?? 0,
        high: tenders?.length ?? 0,
        saved: savedTendersCount ?? 0,
      },
    })

    return NextResponse.json({ success: true, brief })
  } catch (error) {
    console.error('Daily brief error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}
