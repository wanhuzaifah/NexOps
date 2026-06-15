'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  BarChart2, RefreshCw, Search, Globe, MapPin,
  Clock, ChevronDown, ChevronUp, BookOpen, Trash2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import type { MarketDigest, ResearchHistory, DigestScope } from '@/types'

type Tab = 'digest' | 'research'

function DigestCard({ digest, onDelete }: { digest: MarketDigest; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
            digest.scope === 'global' ? 'bg-blue-100 dark:bg-blue-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
          }`}>
            {digest.scope === 'global'
              ? <Globe size={15} className="text-blue-600 dark:text-blue-400" />
              : <MapPin size={15} className="text-emerald-600 dark:text-emerald-400" />
            }
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                digest.scope === 'global'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                  : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
              }`}>
                {digest.scope === 'global' ? '🌐 Global' : '🇲🇾 Malaysia'}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Clock size={11} />
                {new Date(digest.created_at).toLocaleString('ms-MY', {
                  day: 'numeric', month: 'short', year: 'numeric',
                  hour: '2-digit', minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={() => onDelete(digest.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
            title="Padam"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>

      {/* Preview / Full content */}
      <div className={`px-5 pb-5 ${!expanded ? 'border-t border-slate-100 dark:border-slate-700/50 pt-4' : ''}`}>
        {expanded ? (
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {digest.content}
          </div>
        ) : (
          <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
            {digest.content.replace(/#{1,6}\s/g, '').slice(0, 280)}...
          </p>
        )}
        {!expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-2 text-brand-gold text-xs hover:underline flex items-center gap-1"
          >
            <ChevronDown size={12} /> Baca penuh
          </button>
        )}
      </div>
    </div>
  )
}

function ResearchCard({ item, onDelete }: { item: ResearchHistory; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="px-5 py-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
            <BookOpen size={15} className="text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-white">{item.topic}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
              <Clock size={11} />
              {new Date(item.created_at).toLocaleString('ms-MY', {
                day: 'numeric', month: 'short', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
              })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 rounded-lg text-slate-300 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            <Trash2 size={13} />
          </button>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 dark:border-slate-700/50 pt-4">
          <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
            {item.result}
          </div>
        </div>
      )}
      {!expanded && (
        <div className="px-5 pb-4">
          <p className="text-slate-500 dark:text-slate-400 text-xs line-clamp-2">
            {item.result.replace(/#{1,6}\s/g, '').slice(0, 180)}...
          </p>
          <button onClick={() => setExpanded(true)} className="mt-1.5 text-brand-gold text-xs hover:underline flex items-center gap-1">
            <ChevronDown size={12} /> Baca penuh
          </button>
        </div>
      )}
    </div>
  )
}

export default function MarketIntelPage() {
  const supabase = createClient()
  const [companyId, setCompanyId] = useState('')
  const [tab, setTab] = useState<Tab>('digest')
  const [digests, setDigests] = useState<MarketDigest[]>([])
  const [researches, setResearches] = useState<ResearchHistory[]>([])
  const [loadingData, setLoadingData] = useState(true)

  // Digest state
  const [runningDigest, setRunningDigest] = useState(false)
  const [digestScope, setDigestScope] = useState<DigestScope>('malaysia')
  const [digestLang, setDigestLang] = useState<'bilingual' | 'english' | 'malay'>('bilingual')

  // Research state
  const [topic, setTopic] = useState('')
  const [researching, setResearching] = useState(false)
  const [liveResult, setLiveResult] = useState('')

  const loadData = useCallback(async (cid: string) => {
    const [{ data: d }, { data: r }] = await Promise.all([
      supabase.from('market_digests').select('*').eq('company_id', cid).eq('type', 'digest')
        .order('created_at', { ascending: false }).limit(20),
      supabase.from('research_history').select('*').eq('company_id', cid)
        .order('created_at', { ascending: false }).limit(20),
    ])
    setDigests((d || []) as MarketDigest[])
    setResearches((r || []) as ResearchHistory[])
  }, [])

  useEffect(() => {
    // Check URL tab param
    const params = new URLSearchParams(window.location.search)
    if (params.get('tab') === 'research') setTab('research')

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
      if (!profile?.company_id) return
      setCompanyId(profile.company_id)
      await loadData(profile.company_id)
      setLoadingData(false)
    }
    init()
  }, [loadData])

  async function runDigest() {
    if (!companyId) {
      toast.error('Profile tidak dikonfigurasi — sila link company_id dalam Supabase dahulu')
      return
    }
    setRunningDigest(true)
    toast.loading('Scraping berita & menjana digest AI...', { id: 'digest' })
    try {
      const res = await fetch('/api/market', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, scope: digestScope, lang: digestLang }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')
      toast.success('Digest berjaya dijana!', { id: 'digest' })
      await loadData(companyId)
    } catch (e) {
      toast.error(`Gagal: ${String(e)}`, { id: 'digest' })
    }
    setRunningDigest(false)
  }

  async function runResearch() {
    if (!topic.trim()) { toast.error('Masukkan topik penelitian'); return }
    if (!companyId) {
      toast.error('Profile tidak dikonfigurasi — sila link company_id dalam Supabase dahulu')
      return
    }
    setResearching(true)
    setLiveResult('')
    toast.loading('AI sedang menyelidik...', { id: 'research' })
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId, topic }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Gagal')
      setLiveResult(data.result)
      toast.success('Penelitian selesai!', { id: 'research' })
      setTopic('')
      await loadData(companyId)
    } catch (e) {
      toast.error(String(e), { id: 'research' })
    }
    setResearching(false)
  }

  async function deleteDigest(id: string) {
    await supabase.from('market_digests').delete().eq('id', id)
    setDigests(prev => prev.filter(d => d.id !== id))
    toast.success('Dipadam')
  }

  async function deleteResearch(id: string) {
    await supabase.from('research_history').delete().eq('id', id)
    setResearches(prev => prev.filter(r => r.id !== id))
    toast.success('Dipadam')
  }

  return (
    <div className="space-y-5 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Market Intel</h1>
        <p className="text-slate-500 text-sm mt-1">
          Perisikan pasaran AI — digest automatik & penelitian on-demand
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {([
          { key: 'digest' as Tab, label: 'Auto Digest', icon: BarChart2 },
          { key: 'research' as Tab, label: 'Penelitian', icon: Search },
        ]).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition ${
              tab === key
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* ── DIGEST TAB ── */}
      {tab === 'digest' && (
        <div className="space-y-4">
          {/* Controls */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-3">Generate New Digest</h2>
            <div className="space-y-3">
              {/* Scope */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 w-16">Scope:</span>
                <div className="flex gap-2">
                  {([
                    { value: 'malaysia' as DigestScope, label: '🇲🇾 Malaysia' },
                    { value: 'global' as DigestScope, label: '🌐 Global' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDigestScope(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition ${
                        digestScope === opt.value
                          ? 'border-brand-gold bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold'
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              {/* Language */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs text-slate-400 w-16">News:</span>
                <div className="flex gap-2">
                  {([
                    { value: 'bilingual' as const, label: '🇲🇾+🇬🇧 Bilingual' },
                    { value: 'english' as const, label: '🇬🇧 English' },
                    { value: 'malay' as const, label: '🇲🇾 BM' },
                  ]).map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setDigestLang(opt.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
                        digestLang === opt.value
                          ? 'border-brand-gold bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold'
                          : 'border-slate-200 dark:border-slate-600 text-slate-500 hover:border-slate-300'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-slate-400">
                {digestLang === 'bilingual' && 'Scrape The Edge, Bernama + Berita Harian, Utusan'}
                {digestLang === 'english' && 'Scrape The Edge, Bernama, The Star, FMT, OilPrice'}
                {digestLang === 'malay' && 'Scrape Berita Harian, Utusan, Sinar, Malaysiakini'}
              </p>
              <button
                onClick={runDigest}
                disabled={runningDigest}
                className="flex items-center gap-2 gold-gradient text-brand-navy px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
              >
                <RefreshCw size={14} className={runningDigest ? 'animate-spin' : ''} />
                {runningDigest ? 'Generating...' : 'Generate Digest'}
              </button>
            </div>
          </div>

          {/* Digest list */}
          {loadingData ? (
            <div className="space-y-3">
              {[1, 2].map(i => (
                <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
                  <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-3" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-full mb-2" />
                  <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-4/5" />
                </div>
              ))}
            </div>
          ) : digests.length === 0 ? (
            <div className="text-center py-14 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
              <BarChart2 size={36} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-slate-500 text-sm font-medium">Belum ada digest.</p>
              <p className="text-slate-400 text-xs mt-1">Klik "Jana Digest" untuk mula.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {digests.map(d => (
                <DigestCard key={d.id} digest={d} onDelete={deleteDigest} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── RESEARCH TAB ── */}
      {tab === 'research' && (
        <div className="space-y-4">
          {/* Research input */}
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles size={15} className="text-brand-gold" />
              <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">Penelitian AI On-Demand</h2>
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !researching && runResearch()}
                placeholder="Contoh: Peluang NDT sektor petrochemical Malaysia 2026..."
                className="flex-1 border border-slate-200 dark:border-slate-600 rounded-lg px-3.5 py-2.5 text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-gold/40"
              />
              <button
                onClick={runResearch}
                disabled={researching || !topic.trim()}
                className="flex items-center gap-2 gold-gradient text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50 whitespace-nowrap"
              >
                <Search size={14} className={researching ? 'animate-pulse' : ''} />
                {researching ? 'Menyelidik...' : 'Selidik'}
              </button>
            </div>
            <div className="flex gap-2 mt-2 flex-wrap">
              {[
                'Projek O&G PETRONAS 2026',
                'Tender infrastruktur Kelantan',
                'Pasaran NDT Malaysia vs ASEAN',
                'Peluang ECRL fasa 2',
              ].map(s => (
                <button
                  key={s}
                  onClick={() => setTopic(s)}
                  className="text-xs px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 dark:text-slate-400 hover:border-brand-gold hover:text-brand-gold transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Live result */}
          {liveResult && (
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-brand-gold/30 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-5 h-5 rounded-full gold-gradient flex items-center justify-center">
                  <Sparkles size={11} className="text-brand-navy" />
                </div>
                <span className="text-xs font-semibold text-brand-gold">Keputusan Terkini</span>
              </div>
              <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 whitespace-pre-wrap text-sm leading-relaxed">
                {liveResult}
              </div>
            </div>
          )}

          {/* Research history */}
          {loadingData ? null : researches.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
                Sejarah Penelitian
              </h3>
              <div className="space-y-3">
                {researches.map(r => (
                  <ResearchCard key={r.id} item={r} onDelete={deleteResearch} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
