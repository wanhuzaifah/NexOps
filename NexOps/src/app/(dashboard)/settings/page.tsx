'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Settings, MessageSquare, Bot, Save, Plus, Trash2,
  Building2, Shield, Sliders,
} from 'lucide-react'

const COMPANY_INFO = {
  name: 'FAZMI GROUP SDN BHD',
  brand: 'FG INSPECTION (TR0242378-W)',
  ssm: '202501005174 (1606588-X)',
  cidb: 'G2 B04, G2 CE21',
  address: 'Suite 33-01, 33rd Floor, Menara Keck Seng, 203 Jalan Bukit Bintang, 55100 WP KL',
  phone: '+6011-2690 7066 / +603-2116 9727',
  email: 'fazmigroup@gmail.com',
  director: 'Nor Fazmi Hazwan bin Rozikin (Managing Director)',
}

export default function SettingsPage() {
  const supabase = createClient()
  const [companyId, setCompanyId] = useState('')
  const [saving, setSaving] = useState(false)

  const [telegramIds, setTelegramIds] = useState<string[]>([])
  const [newTgId, setNewTgId] = useState('')
  const [tenderMinScore, setTenderMinScore] = useState(60)
  const [digestTime, setDigestTime] = useState('07:00')
  const [bossEmail, setBossEmail] = useState('')

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
      if (!profile?.company_id) return
      setCompanyId(profile.company_id)
      const { data: co } = await supabase
        .from('companies')
        .select('telegram_chat_ids, settings, boss_email')
        .eq('id', profile.company_id)
        .single()
      if (co) {
        setTelegramIds(co.telegram_chat_ids || [])
        setBossEmail(co.boss_email || '')
        const s = co.settings as Record<string, unknown>
        if (s?.tender_min_score) setTenderMinScore(Number(s.tender_min_score))
        if (s?.market_digest_time) setDigestTime(String(s.market_digest_time))
      }
    }
    load()
  }, [])

  async function handleSave() {
    if (!companyId) return
    setSaving(true)
    const { error } = await supabase
      .from('companies')
      .update({
        telegram_chat_ids: telegramIds,
        boss_email: bossEmail,
        settings: {
          tender_min_score: tenderMinScore,
          market_digest_time: digestTime,
        },
      })
      .eq('id', companyId)
    if (error) {
      toast.error('Gagal menyimpan: ' + error.message)
    } else {
      toast.success('Tetapan disimpan!')
    }
    setSaving(false)
  }

  function addTelegramId() {
    const id = newTgId.trim()
    if (!id) return
    if (telegramIds.includes(id)) { toast.error('ID sudah ada'); return }
    setTelegramIds([...telegramIds, id])
    setNewTgId('')
  }

  function removeTelegramId(id: string) {
    setTelegramIds(telegramIds.filter(t => t !== id))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tetapan</h1>
        <p className="text-slate-500 text-sm mt-1">Konfigurasi Telegram, ambang skor, dan maklumat syarikat</p>
      </div>

      {/* Company Info (read-only) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Building2 size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Maklumat Syarikat</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 ml-auto">
            Tetap
          </span>
        </div>
        <div className="space-y-2">
          {Object.entries(COMPANY_INFO).map(([key, val]) => (
            <div key={key} className="flex gap-3 text-sm">
              <span className="text-slate-400 dark:text-slate-500 w-20 flex-shrink-0 capitalize">{key}:</span>
              <span className="text-slate-700 dark:text-slate-300">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Config */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <MessageSquare size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Telegram Bot</h2>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Chat ID yang dibenarkan untuk menerima notifikasi dan menghantar arahan ke bot.
          Dapatkan ID anda melalui <strong>@userinfobot</strong> di Telegram.
        </p>

        {/* Existing IDs */}
        <div className="space-y-2 mb-3">
          {telegramIds.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Tiada chat ID lagi.</p>
          ) : (
            telegramIds.map(id => (
              <div key={id} className="flex items-center justify-between px-3 py-2 bg-slate-50 dark:bg-slate-700 rounded-lg">
                <div className="flex items-center gap-2">
                  <Shield size={13} className="text-emerald-500" />
                  <span className="text-sm font-mono text-slate-700 dark:text-slate-300">{id}</span>
                </div>
                <button onClick={() => removeTelegramId(id)} className="text-slate-300 hover:text-red-400 transition">
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Add new */}
        <div className="flex gap-2">
          <input
            type="text"
            value={newTgId}
            onChange={e => setNewTgId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTelegramId()}
            placeholder="Contoh: 123456789"
            className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
          <button
            onClick={addTelegramId}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:border-brand-gold hover:text-brand-gold transition"
          >
            <Plus size={14} />
            Tambah
          </button>
        </div>
      </div>

      {/* AI Agent Config */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-4">
          <Sliders size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Konfigurasi Agen AI</h2>
        </div>

        <div className="space-y-4">
          {/* Tender min score */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Ambang Notifikasi Tender (Skor Minimum)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={40}
                max={90}
                step={5}
                value={tenderMinScore}
                onChange={e => setTenderMinScore(Number(e.target.value))}
                className="flex-1 accent-brand-gold"
              />
              <span className={`text-sm font-bold w-12 text-center ${
                tenderMinScore >= 80 ? 'text-emerald-500' :
                tenderMinScore >= 60 ? 'text-amber-500' : 'text-slate-500'
              }`}>
                {tenderMinScore}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Tender dengan skor ≥ {tenderMinScore} akan dinotifikasi via Telegram
            </p>
          </div>

          {/* Digest time */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Masa Digest Pasaran Harian (via n8n)
            </label>
            <input
              type="time"
              value={digestTime}
              onChange={e => setDigestTime(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
            <p className="text-xs text-slate-400 mt-1">
              n8n akan panggil /api/market secara automatik pada masa ini
            </p>
          </div>

          {/* Boss email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Emel Laporan Mingguan
            </label>
            <input
              type="email"
              value={bossEmail}
              onChange={e => setBossEmail(e.target.value)}
              placeholder="fazmigroup@gmail.com"
              className="w-full border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
          </div>
        </div>
      </div>

      {/* AI Model Info (locked) */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-center gap-2 mb-3">
          <Bot size={16} className="text-brand-gold" />
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Model AI</h2>
          <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 ml-auto">
            Terkunci
          </span>
        </div>
        <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
          <div className="w-8 h-8 rounded-lg gold-gradient flex items-center justify-center">
            <Bot size={14} className="text-brand-navy" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">DeepSeek V4 Flash</p>
            <p className="text-xs text-slate-400">deepseek-chat · api.deepseek.com/v1</p>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs text-slate-500">Aktif</span>
          </div>
        </div>
      </div>

      {/* Save */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 gold-gradient text-brand-navy px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Menyimpan...' : 'Simpan Tetapan'}
        </button>
      </div>
    </div>
  )
}
