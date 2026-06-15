// ============================================================
// NexOps — Telegram Bot Webhook
// Receives messages from Telegram and routes commands
//
// Commands:
//   /tender   — scan tenders + return top 5
//   /market   — generate market digest + send summary
//   /brief    — AI opportunity brief
//   /research [topic] — deep research on any topic
//   /help     — list all commands
//   /status   — app stats
// ============================================================

import { NextRequest, NextResponse } from 'next/server'
import { sendTelegramMessage } from '@/lib/telegram/send'
import { routeIntent, hourlyOpportunityBrief } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'

interface TelegramUpdate {
  update_id: number
  message?: {
    message_id: number
    from: { id: number; first_name: string; username?: string }
    chat: { id: number; type: string }
    text?: string
    date: number
  }
}

// Validate the request is from Telegram
function isAllowedChat(chatId: string): boolean {
  const allowed = (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
    .split(',').map(s => s.trim()).filter(Boolean)
  if (allowed.length === 0) return true // No restriction if not configured
  return allowed.includes(chatId)
}

async function getCompanyId(): Promise<string | null> {
  const envId = process.env.DEFAULT_COMPANY_ID
  if (envId) return envId

  const supabase = await createAdminClient()
  const { data } = await supabase.from('companies').select('id').limit(1).maybeSingle()
  return data?.id ?? null
}

// ── Command Handlers ──────────────────────────────────────────

async function handleTender(chatId: string, companyId: string): Promise<void> {
  await sendTelegramMessage(chatId, '🔍 *Mengimbas tender terkini...*\n_Ini mengambil masa ~20 saat_', 'Markdown')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/tender`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId }),
    })
    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Scan failed')

    const supabase = await createAdminClient()
    const { data: topTenders } = await supabase
      .from('tender_cache')
      .select('title, agency, relevance_score, closing_date, location')
      .eq('company_id', companyId)
      .gte('relevance_score', 60)
      .order('relevance_score', { ascending: false })
      .limit(5)

    if (!topTenders?.length) {
      await sendTelegramMessage(chatId, `✅ Scan selesai — ${data.count ?? 0} tender disimpan.\n\n_Tiada tender high match (≥60) dijumpai._`, 'Markdown')
      return
    }

    const tenderList = topTenders.map((t, i) => {
      const score = t.relevance_score || 0
      const emoji = score >= 80 ? '🟢' : '🟡'
      const days = t.closing_date
        ? Math.ceil((new Date(t.closing_date).getTime() - Date.now()) / 86400000)
        : null
      const urgency = days !== null && days <= 7 ? ` ⚠️ *${days}h lagi*` : ''
      return `${i + 1}. ${emoji} *${(t.title || 'Untitled').slice(0, 55)}*\n   📍 ${t.location || '—'} | 🏢 ${(t.agency || '—').slice(0, 30)}${urgency}\n   Score: ${score}/100`
    }).join('\n\n')

    const msg = `🎯 *Top ${topTenders.length} Tender High Match*\n_(${data.count ?? 0} tender disimpan, ${data.high_match ?? 0} high match)_\n\n${tenderList}\n\n💡 Buka NexOps untuk details & bid strategy`
    await sendTelegramMessage(chatId, msg, 'Markdown')
  } catch (e) {
    await sendTelegramMessage(chatId, `❌ Scan gagal: ${String(e)}`)
  }
}

async function handleMarket(chatId: string, companyId: string, scope: 'malaysia' | 'global' = 'malaysia'): Promise<void> {
  const scopeLabel = scope === 'global' ? '🌐 Global' : '🇲🇾 Malaysia'
  await sendTelegramMessage(chatId, `📊 *Menjana market intel digest (${scopeLabel})...*\n_Mengambil masa ~30 saat_`, 'Markdown')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/market`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, scope, lang: 'bilingual' }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal')

    // Extract first 800 chars of digest for Telegram
    const digest = data.digest?.content || ''
    const preview = digest.slice(0, 900) + (digest.length > 900 ? '\n\n_...buka NexOps untuk laporan penuh_' : '')
    await sendTelegramMessage(chatId, `📊 *Market Intel Digest*\n\n${preview}`, 'Markdown')
  } catch (e) {
    await sendTelegramMessage(chatId, `❌ Digest gagal: ${String(e)}`)
  }
}

async function handleBrief(chatId: string, companyId: string): Promise<void> {
  await sendTelegramMessage(chatId, '🤖 *Menjana AI brief...*', 'Markdown')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/hourly-brief`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal')
    // Brief already sent to Telegram by the hourly-brief endpoint
    if (data.telegram_sent === 0) {
      await sendTelegramMessage(chatId, '⚠️ Brief dijana tapi Telegram send gagal. Semak bot token.')
    }
  } catch (e) {
    await sendTelegramMessage(chatId, `❌ Brief gagal: ${String(e)}`)
  }
}

async function handleResearch(chatId: string, companyId: string, topic: string): Promise<void> {
  if (!topic.trim()) {
    await sendTelegramMessage(chatId, '❓ Sila nyatakan topik.\n\nContoh: `/research peluang NDT PETRONAS 2026`', 'Markdown')
    return
  }

  await sendTelegramMessage(chatId, `🔬 *Menyelidik: "${topic}"*\n_Ini mengambil masa ~20 saat_`, 'Markdown')

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/research`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ company_id: companyId, topic }),
    })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Gagal')

    const result = data.result || ''
    const preview = result.slice(0, 1000) + (result.length > 1000 ? '\n\n_...buka NexOps > Market Intel > Penelitian untuk laporan penuh_' : '')
    await sendTelegramMessage(chatId, `🔬 *Research: ${topic}*\n\n${preview}`, 'Markdown')
  } catch (e) {
    await sendTelegramMessage(chatId, `❌ Research gagal: ${String(e)}`)
  }
}

async function handleStatus(chatId: string, companyId: string): Promise<void> {
  const supabase = await createAdminClient()
  const [
    { count: totalTenders },
    { count: highMatch },
    { count: saved },
    { data: lastDigest },
  ] = await Promise.all([
    supabase.from('tender_cache').select('*', { count: 'exact', head: true }).eq('company_id', companyId),
    supabase.from('tender_cache').select('*', { count: 'exact', head: true }).eq('company_id', companyId).gte('relevance_score', 80),
    supabase.from('tender_cache').select('*', { count: 'exact', head: true }).eq('company_id', companyId).eq('status', 'saved'),
    supabase.from('market_digests').select('created_at').eq('company_id', companyId).order('created_at', { ascending: false }).limit(1).maybeSingle(),
  ])

  const lastDigestTime = lastDigest?.created_at
    ? new Date(lastDigest.created_at).toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
    : 'Belum ada'

  const msg = `📊 *NexOps Status*\n\n🎯 Total Tender: *${totalTenders ?? 0}*\n🟢 High Match (≥80): *${highMatch ?? 0}*\n🔖 Disimpan: *${saved ?? 0}*\n\n📰 Digest Terakhir: _${lastDigestTime}_\n\n_Guna /tender, /market, /brief atau /research [topik]_`
  await sendTelegramMessage(chatId, msg, 'Markdown')
}

const HELP_MSG = `🤖 *NexOps AI Bot — Commands*

/tender — Scan tender terbaru & top 5 high match
/market — Jana market intel digest (Malaysia)
/market global — Jana market intel digest (Global)
/brief — AI opportunity brief sekarang
/research [topik] — Deep research sebarang topik
/status — Stats semasa NexOps
/help — Tunjuk senarai commands ini

*Contoh:*
\`/research peluang NDT sektor LNG 2026\`
\`/research pipeline inspection Sarawak\`

_Powered by DeepSeek V4 Flash | NexOps by Fazmi Group_`

// ── Main Webhook Handler ──────────────────────────────────────

export async function POST(request: NextRequest) {
  try {
    const update: TelegramUpdate = await request.json()
    const message = update.message
    if (!message?.text) return NextResponse.json({ ok: true })

    const chatId = String(message.chat.id)
    const text = message.text.trim()
    const firstName = message.from.first_name || 'Wan'

    // Security check
    if (!isAllowedChat(chatId)) {
      await sendTelegramMessage(chatId, '⛔ Akses tidak dibenarkan.')
      return NextResponse.json({ ok: true })
    }

    const companyId = await getCompanyId()
    if (!companyId) {
      await sendTelegramMessage(chatId, '❌ Company ID tidak dikonfigurasi. Setup NexOps dahulu.')
      return NextResponse.json({ ok: true })
    }

    // Parse command
    const [cmd, ...args] = text.split(' ')
    const command = cmd.toLowerCase().replace('@', '').split('@')[0]
    const argument = args.join(' ').trim()

    console.log(`[Telegram] Chat ${chatId} (${firstName}): ${text}`)

    // Route to handler
    switch (command) {
      case '/start':
        await sendTelegramMessage(chatId, `👋 Selamat datang, *${firstName}*!\n\n${HELP_MSG}`, 'Markdown')
        break
      case '/help':
        await sendTelegramMessage(chatId, HELP_MSG, 'Markdown')
        break
      case '/tender':
      case '/scan':
        await handleTender(chatId, companyId)
        break
      case '/market':
        await handleMarket(chatId, companyId, argument === 'global' ? 'global' : 'malaysia')
        break
      case '/brief':
        await handleBrief(chatId, companyId)
        break
      case '/research':
        await handleResearch(chatId, companyId, argument)
        break
      case '/status':
        await handleStatus(chatId, companyId)
        break
      default:
        // Try AI intent routing for free-text messages
        if (!text.startsWith('/')) {
          const intent = await routeIntent(text)
          switch (intent) {
            case 'TENDER': await handleTender(chatId, companyId); break
            case 'MARKET': await handleMarket(chatId, companyId); break
            case 'BRIEF': await handleBrief(chatId, companyId); break
            case 'RESEARCH': await handleResearch(chatId, companyId, text); break
            default:
              await sendTelegramMessage(chatId, `🤔 Tak pasti maksud arahan. Taip /help untuk senarai commands.`)
          }
        } else {
          await sendTelegramMessage(chatId, `❓ Command tidak dikenali. Taip /help untuk senarai commands.`)
        }
    }

    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('[Telegram Webhook] Error:', error)
    return NextResponse.json({ ok: true }) // Always return 200 to Telegram
  }
}

// GET — verify webhook is alive
export async function GET() {
  return NextResponse.json({
    status: 'NexOps Telegram Webhook active',
    commands: ['/tender', '/market', '/market global', '/brief', '/research [topic]', '/status', '/help'],
  })
}
