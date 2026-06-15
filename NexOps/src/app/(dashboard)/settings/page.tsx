'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  Settings, MessageSquare, Bot, Save, Plus, Trash2,
  Building2, Shield, Sliders, Globe,
} from 'lucide-react'

const COMPANY_INFO = {
  'Company Name': 'FAZMI GROUP SDN BHD',
  'Brand / Trade': 'FG INSPECTION (TR0242378-W)',
  'SSM No.': '202501005174 (1606588-X)',
  'CIDB Grade': 'G2 B04, G2 CE21',
  'Address': 'Suite 33-01, 33rd Floor, Menara Keck Seng, 203 Jalan Bukit Bintang, 55100 WP KL',
  'Phone': '+6011-2690 7066 / +603-2116 9727',
  'Email': 'fazmigroup@gmail.com',
  'Director': 'Nor Fazmi Hazwan bin Rozikin (Managing Director)',
}

function SectionHeader({ icon: Icon, title, subtitle, badge }: {
  icon: React.ElementType
  title: string
  subtitle?: string
  badge?: string
}) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-2">
        <Icon size={16} className="text-brand-gold" />
        <div>
          <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {badge && (
        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">
          {badge}
        </span>
      )}
    </div>
  )
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
  const [digestLang, setDigestLang] = useState<'bilingual' | 'english' | 'malay'>('bilingual')

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
        if (s?.digest_lang) setDigestLang(String(s.digest_lang) as 'bilingual' | 'english' | 'malay')
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
          digest_lang: digestLang,
        },
      })
      .eq('id', companyId)
    if (error) {
      toast.error('Save failed: ' + error.message)
    } else {
      toast.success('Settings saved!')
    }
    setSaving(false)
  }

  function addTelegramId() {
    const id = newTgId.trim()
    if (!id) return
    if (telegramIds.includes(id)) { toast.error('ID already added'); return }
    setTelegramIds([...telegramIds, id])
    setNewTgId('')
  }

  function removeTelegramId(id: string) {
    setTelegramIds(telegramIds.filter(t => t !== id))
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Settings</h1>
        <p className="text-slate-500 text-sm mt-1">Configure Telegram alerts, AI thresholds & company info</p>
      </div>

      {/* Company Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionHeader
          icon={Building2}
          title="Company Info"
          subtitle="Maklumat syarikat — read only"
          badge="Fixed / Tetap"
        />
        <div className="space-y-2">
          {Object.entries(COMPANY_INFO).map(([key, val]) => (
            <div key={key} className="flex gap-3 text-sm">
              <span className="text-slate-400 dark:text-slate-500 w-28 flex-shrink-0 text-xs">{key}</span>
              <span className="text-slate-700 dark:text-slate-300 text-xs">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Telegram Config */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionHeader
          icon={MessageSquare}
          title="Telegram Notifications"
          subtitle="Allowed chat IDs untuk terima alerts & hantar arahan ke bot"
        />
        <p className="text-xs text-slate-400 mb-4">
          Get your Chat ID via <strong>@userinfobot</strong> on Telegram. Add multiple IDs for team members.
        </p>

        <div className="space-y-2 mb-3">
          {telegramIds.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No chat IDs added yet.</p>
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

        <div className="flex gap-2">
          <input
            type="text"
            value={newTgId}
            onChange={e => setNewTgId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addTelegramId()}
            placeholder="e.g. 123456789"
            className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
          />
          <button
            onClick={addTelegramId}
            className="flex items-center gap-1.5 px-3 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:border-brand-gold hover:text-brand-gold transition"
          >
            <Plus size={14} />
            Add
          </button>
        </div>
      </div>

      {/* AI Agent Config */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionHeader
          icon={Sliders}
          title="AI Agent Configuration"
          subtitle="Tetapan untuk Tender Scout & Market Intel"
        />

        <div className="space-y-5">
          {/* Tender alert threshold */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Tender Alert Threshold <span className="text-slate-400 font-normal">(minimum score untuk notify)</span>
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
              Tenders with score ≥ {tenderMinScore} will be sent to Telegram automatically.
            </p>
          </div>

          {/* Market digest language */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Market Digest Language <span className="text-slate-400 font-normal">(bahasa laporan AI)</span>
            </label>
            <div className="flex gap-2">
              {([
                { value: 'bilingual', label: '🇲🇾 + 🇬🇧 Bilingual', desc: 'Malay + English news' },
                { value: 'english', label: '🇬🇧 English only', desc: 'English sources only' },
                { value: 'malay', label: '🇲🇾 Malay only', desc: 'BM sources only' },
              ] as { value: 'bilingual' | 'english' | 'malay'; label: string; desc: string }[]).map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setDigestLang(opt.value)}
                  title={opt.desc}
                  className={`flex-1 px-3 py-2 rounded-lg text-xs font-medium border transition text-center ${
                    digestLang === opt.value
                      ? 'border-brand-gold bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold'
                      : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-xs text-slate-400 mt-1.5">
              {digestLang === 'bilingual' && 'Scrape both The Edge, Bernama (EN) + Utusan, Berita Harian (BM)'}
              {digestLang === 'english' && 'Scrape The Edge Malaysia, Bernama English, Star Biz, FMT Business'}
              {digestLang === 'malay' && 'Scrape Utusan Malaysia, Berita Harian, Sinar Harian, BH Online'}
            </p>
          </div>

          {/* Daily digest schedule */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Auto Digest Schedule <span className="text-slate-400 font-normal">(via n8n cron)</span>
            </label>
            <input
              type="time"
              value={digestTime}
              onChange={e => setDigestTime(e.target.value)}
              className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
            />
            <p className="text-xs text-slate-400 mt-1">
              n8n will call /api/market automatically at this time every day.
            </p>
          </div>

          {/* Report email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Weekly Report Email <span className="text-slate-400 font-normal">(emel laporan mingguan)</span>
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

      {/* News Sources Info */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionHeader
          icon={Globe}
          title="News Sources"
          subtitle="Sumber berita yang di-scrape untuk Market Intel"
        />
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">🇬🇧 English</p>
            <div className="space-y-1.5">
              {[
                'The Edge Malaysia',
                'Bernama (EN)',
                'The Star Business',
                'Free Malaysia Today',
                'OilPrice.com',
              ].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2">🇲🇾 Bahasa Malaysia</p>
            <div className="space-y-1.5">
              {[
                'Berita Harian',
                'Utusan Malaysia',
                'Sinar Harian',
                'Malaysiakini (BM)',
                'MalayMail Online',
              ].map(s => (
                <div key={s} className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />
                  <span className="text-xs text-slate-600 dark:text-slate-400">{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* AI Model */}
      <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
        <SectionHeader
          icon={Bot}
          title="AI Model"
          subtitle="Model yang digunakan — locked"
          badge="Locked"
        />
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
            <span className="text-xs text-slate-500">Active</span>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 gold-gradient text-brand-navy px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
        >
          <Save size={15} />
          {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  )
}
