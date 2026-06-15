// ============================================================
// NexOps — Register Telegram Webhook
// Call this once after deployment to link your bot to NexOps
// GET /api/telegram/setup
// ============================================================

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const appUrl = process.env.NEXT_PUBLIC_APP_URL

  if (!token || token.includes('123456789')) {
    return NextResponse.json({
      error: 'TELEGRAM_BOT_TOKEN not configured in .env.local',
      fix: 'Get token from @BotFather on Telegram'
    }, { status: 400 })
  }

  if (!appUrl || appUrl.includes('localhost')) {
    return NextResponse.json({
      error: 'App URL is localhost — webhook requires a public URL',
      fix: 'Deploy to Vercel first, then update NEXT_PUBLIC_APP_URL',
      current_url: appUrl,
    }, { status: 400 })
  }

  const webhookUrl = `${appUrl}/api/telegram/webhook`

  try {
    // Register webhook with Telegram
    const res = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        url: webhookUrl,
        allowed_updates: ['message'],
        drop_pending_updates: true,
      }),
    })
    const data = await res.json()

    if (!data.ok) {
      return NextResponse.json({ error: data.description, webhook_url: webhookUrl }, { status: 400 })
    }

    // Get bot info
    const botRes = await fetch(`https://api.telegram.org/bot${token}/getMe`)
    const botData = await botRes.json()

    return NextResponse.json({
      success: true,
      message: 'Telegram webhook registered!',
      webhook_url: webhookUrl,
      bot: botData.result ? `@${botData.result.username} (${botData.result.first_name})` : 'Unknown',
    })
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 })
  }
}
