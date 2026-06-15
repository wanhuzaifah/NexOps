import { NextRequest, NextResponse } from 'next/server'
import { researchAgent } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { company_id, topic } = await request.json() as {
      company_id: string
      topic: string
    }

    if (!company_id) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }
    if (!topic?.trim()) {
      return NextResponse.json({ error: 'topic required' }, { status: 400 })
    }

    // Run AI research
    const result = await researchAgent(topic.trim())

    // Save to research history
    const supabase = await createAdminClient()
    const { error } = await supabase
      .from('research_history')
      .insert({
        company_id,
        topic: topic.trim(),
        result,
      })

    if (error) {
      console.error('Failed to save research:', error.message)
      // Still return the result even if save fails
    }

    return NextResponse.json({ success: true, result, topic: topic.trim() })
  } catch (error) {
    console.error('Research API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const company_id = searchParams.get('company_id')

  if (!company_id) {
    return NextResponse.json({ error: 'company_id required' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('research_history')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(20)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ history: data })
}
