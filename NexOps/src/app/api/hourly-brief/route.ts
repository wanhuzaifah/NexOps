// ============================================================
// NexOps — Hourly Business Opportunity Brief
// Called by: Vercel Cron (every hour) OR n8n OR manual trigger
// What it does:
//   1. Fetch high-match tenders from DB
//   2. Get latest market digest snippet
//   3. Run DeepSeek hourlyOpportunityBrief agent
//   4. Send formatted brief to Telegram
//   5. Return result
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { hourlyOpportunityBrief } from '@/lib/ai/deepseek'
import { broadcastTelegram } from '@/lib/telegram/send'
import { createAdminClient } from '@/lib/supabase/server'

// Vercel Cron secret to prevent unauthorized calls
function validateCronSecret(request: NextRequest): boolean {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  // Allow if no secret configured (dev mode) or secret matches
  if (!cronSecret || cronSecret === 'dev') return true
  return authHeader === `Bearer ${cronSecret}`
}

export async function POST(request: NextRequest) {
  if (!validateCronSecret(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json().catch(() => ({}))
    const company_id: string = body.company_id || process.env.DEFAULT_COMPANY_ID || ''

    if (!company_id) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const supabase = await createAdminClient()
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()

    // Fetch data in parallel
    const [
      { data: highTenders },
      { data: newTenders },
      { data: digests },
      { data: company },
    ] = await Promise.all([
      // All high-match tenders
      supabase
        .from('tender_cache')
        .select('title, agency, relevance_score, closing_date, location')
        .eq('company_id', company_id)
        .gte('relevance_score', 70)
        .neq('status', 'ignored')
        .order('relevance_score', { ascending: false })
        .limit(10),

      // New tenders in last hour
      supabase
        .from('tender_cache')
        .select('id', { count: 'exact' })
        .eq('company_id', company_id)
        .gte('scraped_at', oneHourAgo),

      // Latest market digest
      supabase
        .from('market_digests')
        .select('content, created_at')
        .eq('company_id', company_id)
        .eq('type', 'digest')
        .order('created_at', { ascending: false })
        .limit(1),

      // Company Telegram IDs
      supabase
        .from('companies')
        .select('telegram_chat_ids, settings')
        .eq('id', company_id)
        .single(),
    ])

    const latestDigestSnippet = digests?.[0]?.content
      ? digests[0].content.slice(0, 1000)
      : 'Belum ada market digest. Jana digest baru di NexOps > Market Intel.'

    // Generate AI brief
    const briefText = await hourlyOpportunityBrief({
      tenders: highTenders || [],
      latestDigestSnippet,
      hour: now.getHours(),
      newTendersCount: newTenders?.length || 0,
    })

    // Format with header
    const mykl = new Date().toLocaleString('en-MY', {
      timeZone: 'Asia/Kuala_Lumpur',
      hour: '2-digit',
      minute: '2-digit',
      day: 'numeric',
      month: 'short',
    })

    const fullMessage = `🤖 *NexOps AI Brief* — ${mykl} MYT\n\n${briefText}\n\n_Powered by DeepSeek V4 | nexops.fginspections.com_`

    // Send to Telegram
    const chatIds: string[] = company?.telegram_chat_ids?.length
      ? company.telegram_chat_ids
      : (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '').split(',').map(s => s.trim()).filter(Boolean)

    const telegramResults = await broadcastTelegram(fullMessage, chatIds)
    const sent = telegramResults.filter(r => r.ok).length
    const failed = telegramResults.filter(r => !r.ok)

    console.log(`[HourlyBrief] Sent to ${sent}/${chatIds.length} Telegram chats`)
    if (failed.length) {
      console.warn('[HourlyBrief] Failed chats:', failed.map(f => `${f.chat_id}: ${f.error}`))
    }

    return NextResponse.json({
      success: true,
      brief_length: briefText.length,
      telegram_sent: sent,
      telegram_failed: failed.length,
      errors: failed.map(f => f.error),
    })
  } catch (error) {
    console.error('[HourlyBrief] Error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

// GET — manual trigger from browser/n8n with company_id as query param
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const company_id = searchParams.get('company_id')

  if (!company_id) {
    return NextResponse.json({ error: 'company_id required' }, { status: 400 })
  }

  // Reuse POST handler
  const newRequest = new NextRequest(request.url, {
    method: 'POST',
    headers: request.headers,
    body: JSON.stringify({ company_id }),
  })
  return POST(newRequest)
}
