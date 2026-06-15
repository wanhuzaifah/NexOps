'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export function TelegramBriefButton({ companyId }: { companyId: string }) {
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  async function sendBrief() {
    if (!companyId) {
      toast.error('Company ID tidak dijumpai')
      return
    }
    setSending(true)
    toast.loading('AI menjana brief & menghantar ke Telegram...', { id: 'tg-brief' })
    try {
      const res = await fetch('/api/hourly-brief', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')

      if (data.telegram_sent > 0) {
        toast.success(`Brief dihantar ke ${data.telegram_sent} Telegram chat!`, { id: 'tg-brief' })
        setSent(true)
        setTimeout(() => setSent(false), 5000)
      } else {
        toast.warning('Brief dijana tapi Telegram tidak dikonfigurasi. Setup bot token dalam Settings.', { id: 'tg-brief' })
      }
    } catch (e) {
      toast.error(`Gagal: ${String(e)}`, { id: 'tg-brief' })
    }
    setSending(false)
  }

  return (
    <button
      onClick={sendBrief}
      disabled={sending}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-50 ${
        sent
          ? 'bg-emerald-500 text-white'
          : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700 dark:hover:bg-slate-600'
      }`}
    >
      {sending ? (
        <Loader2 size={15} className="animate-spin" />
      ) : sent ? (
        <CheckCircle size={15} />
      ) : (
        <MessageSquare size={15} />
      )}
      {sending ? 'Menghantar...' : sent ? 'Dihantar!' : 'Brief ke Telegram'}
    </button>
  )
}
