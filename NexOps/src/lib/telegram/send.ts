// ============================================================
// NexOps — Telegram Bot Sender
// Uses Telegram Bot API to push messages to allowed chat IDs
// ============================================================

const TELEGRAM_API = 'https://api.telegram.org'

export interface TelegramResult {
  ok: boolean
  chat_id: string
  error?: string
}

// ── Send a single message to one chat ID ─────────────────────
export async function sendTelegramMessage(
  chatId: string,
  text: string,
  parseMode: 'Markdown' | 'HTML' | 'MarkdownV2' = 'Markdown'
): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN
  if (!token || token.includes('123456789')) {
    return { ok: false, chat_id: chatId, error: 'Bot token not configured' }
  }

  // Telegram Markdown has length limit of 4096 chars
  const truncated = text.length > 4000 ? text.slice(0, 3900) + '\n\n_...baca penuh di NexOps_' : text

  try {
    const res = await fetch(`${TELEGRAM_API}/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: truncated,
        parse_mode: parseMode,
        disable_web_page_preview: true,
      }),
      signal: AbortSignal.timeout(10000),
    })

    const data = await res.json()
    if (!data.ok) {
      return { ok: false, chat_id: chatId, error: data.description }
    }
    return { ok: true, chat_id: chatId }
  } catch (e) {
    return { ok: false, chat_id: chatId, error: String(e) }
  }
}

// ── Broadcast to ALL allowed chat IDs ────────────────────────
export async function broadcastTelegram(
  text: string,
  chatIds?: string[]
): Promise<TelegramResult[]> {
  // Use provided chat IDs or fall back to env variable
  const ids = chatIds?.length
    ? chatIds
    : (process.env.TELEGRAM_ALLOWED_CHAT_IDS || '')
        .split(',')
        .map(id => id.trim())
        .filter(Boolean)

  if (ids.length === 0) {
    return [{ ok: false, chat_id: 'none', error: 'No chat IDs configured' }]
  }

  return Promise.all(ids.map(id => sendTelegramMessage(id, text)))
}

// ── Format helpers ────────────────────────────────────────────

export function formatTenderBrief(tenders: Array<{
  title: string | null
  agency: string | null
  relevance_score: number | null
  closing_date: string | null
  location: string | null
}>): string {
  if (!tenders.length) return '_Tiada tender high match hari ini_'

  return tenders
    .slice(0, 5)
    .map((t, i) => {
      const score = t.relevance_score || 0
      const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '⚪'
      const days = t.closing_date
        ? Math.ceil((new Date(t.closing_date).getTime() - Date.now()) / 86400000)
        : null
      const urgency = days !== null && days <= 7 ? ` ⚠️ *${days}h lagi*` : days !== null ? ` (${days}h)` : ''
      return `${i + 1}. ${emoji} *${t.title?.slice(0, 60) || 'Untitled'}*\n   ${t.agency || '—'} | ${t.location || '—'}${urgency}`
    })
    .join('\n\n')
}

export function escapeMarkdown(text: string): string {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, '\\$&')
}
