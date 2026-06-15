'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Search, RefreshCw, Bookmark, CheckCircle2, XCircle,
  MapPin, Calendar, Building2, TrendingUp, Filter,
  Clock, ExternalLink, AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TenderCache, TenderStatus } from '@/types'

type FilterTab = 'all' | 'high' | 'saved' | 'applied' | 'ignored'

function ScoreBadge({ score }: { score: number }) {
  if (score >= 80) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-700">
      <TrendingUp size={11} />
      {score}
    </span>
  )
  if (score >= 60) return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
      {score}
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400">
      {score}
    </span>
  )
}

function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = Math.ceil((new Date(dateStr).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
  return diff
}

export default function TendersPage() {
  const supabase = createClient()
  const [companyId, setCompanyId] = useState('')
  const [tenders, setTenders] = useState<TenderCache[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const [lastScanned, setLastScanned] = useState<string | null>(null)

  const loadTenders = useCallback(async (cid: string) => {
    const { data } = await supabase
      .from('tender_cache')
      .select('*')
      .eq('company_id', cid)
      .order('relevance_score', { ascending: false })
      .order('scraped_at', { ascending: false })
    setTenders((data || []) as TenderCache[])

    // Last scan time
    const latest = (data || []).sort((a: TenderCache, b: TenderCache) =>
      new Date(b.scraped_at).getTime() - new Date(a.scraped_at).getTime()
    )[0]
    if (latest) setLastScanned(latest.scraped_at)
  }, [])

  useEffect(() => {
    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const { data: profile } = await supabase.from('profiles').select('company_id').eq('id', user.id).single()
      if (!profile?.company_id) return
      setCompanyId(profile.company_id)
      await loadTenders(profile.company_id)
      setLoading(false)
    }
    init()
  }, [loadTenders])

  async function handleScan() {
    if (!companyId) return
    setScanning(true)
    toast.loading('Mengimbas tender...', { id: 'scan' })
    try {
      const res = await fetch('/api/tender', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company_id: companyId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Scan gagal')
      toast.success(`${data.count || 0} tender ditemui!`, { id: 'scan' })
      await loadTenders(companyId)
    } catch (e) {
      toast.error(String(e), { id: 'scan' })
    }
    setScanning(false)
  }

  async function updateStatus(id: string, status: TenderStatus) {
    await supabase.from('tender_cache').update({ status }).eq('id', id)
    setTenders(prev => prev.map(t => t.id === id ? { ...t, status } : t))
    const labels: Record<string, string> = { saved: 'Disimpan', applied: 'Ditandakan mohon', ignored: 'Diabaikan', new: 'Diset semula' }
    toast.success(labels[status] || 'Dikemaskini')
  }

  const filtered = tenders.filter(t => {
    if (activeTab === 'high') return (t.relevance_score || 0) >= 80
    if (activeTab === 'saved') return t.status === 'saved'
    if (activeTab === 'applied') return t.status === 'applied'
    if (activeTab === 'ignored') return t.status === 'ignored'
    return t.status !== 'ignored'
  })

  const counts = {
    all: tenders.filter(t => t.status !== 'ignored').length,
    high: tenders.filter(t => (t.relevance_score || 0) >= 80).length,
    saved: tenders.filter(t => t.status === 'saved').length,
    applied: tenders.filter(t => t.status === 'applied').length,
    ignored: tenders.filter(t => t.status === 'ignored').length,
  }

  const tabs: { key: FilterTab; label: string; color?: string }[] = [
    { key: 'all', label: `Semua (${counts.all})` },
    { key: 'high', label: `High Match (${counts.high})`, color: 'text-emerald-600' },
    { key: 'saved', label: `Disimpan (${counts.saved})`, color: 'text-blue-600' },
    { key: 'applied', label: `Mohon (${counts.applied})`, color: 'text-purple-600' },
    { key: 'ignored', label: `Diabai (${counts.ignored})` },
  ]

  return (
    <div className="space-y-5 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Tender Scout</h1>
          <p className="text-slate-500 text-sm mt-1">
            Imbas tender kerajaan Malaysia — AI skor & analisis relevansi
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastScanned && (
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock size={12} />
              Scan terakhir: {new Date(lastScanned).toLocaleString('ms-MY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </div>
          )}
          <button
            onClick={handleScan}
            disabled={scanning}
            className="flex items-center gap-2 gold-gradient text-brand-navy px-4 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
          >
            <RefreshCw size={15} className={scanning ? 'animate-spin' : ''} />
            {scanning ? 'Mengimbas...' : 'Scan Sekarang'}
          </button>
        </div>
      </div>

      {/* Score legend */}
      <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-emerald-400 inline-block" /> Skor ≥80 — Sangat relevan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-amber-400 inline-block" /> Skor 60–79 — Relevan
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-slate-300 inline-block" /> Skor &lt;60 — Kurang relevan
        </span>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 w-fit">
        {tabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white dark:bg-slate-700 text-slate-800 dark:text-white shadow-sm'
                : `text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 ${tab.color || ''}`
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tender Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 animate-pulse">
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-1/2 mb-2" />
              <div className="h-3 bg-slate-100 dark:bg-slate-700/50 rounded w-2/3" />
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
          <Search size={40} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
          <p className="text-slate-500 font-medium text-sm">
            {activeTab === 'all' ? 'Belum ada tender. Klik "Scan Sekarang".' : `Tiada tender dalam kategori ini.`}
          </p>
          {activeTab === 'all' && (
            <button
              onClick={handleScan}
              disabled={scanning}
              className="mt-4 flex items-center gap-2 mx-auto gold-gradient text-brand-navy px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
              Scan Sekarang
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((tender) => {
            const days = daysUntil(tender.closing_date)
            const isUrgent = days !== null && days <= 7 && days >= 0
            const isExpired = days !== null && days < 0

            return (
              <div
                key={tender.id}
                className={`bg-white dark:bg-slate-800 rounded-xl border transition group ${
                  tender.status === 'saved'
                    ? 'border-blue-200 dark:border-blue-800'
                    : tender.status === 'applied'
                    ? 'border-purple-200 dark:border-purple-800'
                    : isUrgent
                    ? 'border-amber-200 dark:border-amber-800'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                } p-5`}
              >
                {/* Top row */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <ScoreBadge score={tender.relevance_score || 0} />
                      {tender.status === 'saved' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 font-medium">
                          Disimpan
                        </span>
                      )}
                      {tender.status === 'applied' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 font-medium">
                          Mohon
                        </span>
                      )}
                      {isUrgent && (
                        <span className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 font-medium">
                          <AlertTriangle size={10} />
                          {days}h lagi
                        </span>
                      )}
                      {isExpired && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                          Tamat
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-semibold text-slate-800 dark:text-white leading-snug line-clamp-2">
                      {tender.title || 'Tajuk tidak tersedia'}
                    </h3>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3">
                  {tender.agency && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Building2 size={12} className="flex-shrink-0" />
                      <span className="truncate">{tender.agency}</span>
                    </div>
                  )}
                  {tender.location && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <MapPin size={12} className="flex-shrink-0" />
                      <span>{tender.location}</span>
                    </div>
                  )}
                  {tender.closing_date && (
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                      <Calendar size={12} className="flex-shrink-0" />
                      <span>Tutup: {new Date(tender.closing_date).toLocaleDateString('ms-MY', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      {tender.estimated_value && <span className="text-slate-400">· {tender.estimated_value}</span>}
                    </div>
                  )}
                </div>

                {/* Match reasons */}
                {tender.match_reasons?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {tender.match_reasons.slice(0, 4).map((r, i) => (
                      <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-brand-gold/10 text-brand-gold-dark dark:text-brand-gold border border-brand-gold/20">
                        {r}
                      </span>
                    ))}
                  </div>
                )}

                {/* Source + Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">{tender.source}</span>
                    {tender.source_url && (
                      <a href={tender.source_url} target="_blank" rel="noopener noreferrer"
                        className="text-slate-300 hover:text-brand-gold transition">
                        <ExternalLink size={11} />
                      </a>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {tender.status !== 'saved' && (
                      <button
                        onClick={() => updateStatus(tender.id, 'saved')}
                        title="Simpan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                      >
                        <Bookmark size={15} />
                      </button>
                    )}
                    {tender.status !== 'applied' && (
                      <button
                        onClick={() => updateStatus(tender.id, 'applied')}
                        title="Tandakan Mohon"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                      >
                        <CheckCircle2 size={15} />
                      </button>
                    )}
                    {tender.status !== 'ignored' && (
                      <button
                        onClick={() => updateStatus(tender.id, 'ignored')}
                        title="Abaikan"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                      >
                        <XCircle size={15} />
                      </button>
                    )}
                    {tender.status !== 'new' && (
                      <button
                        onClick={() => updateStatus(tender.id, 'new')}
                        title="Set semula"
                        className="p-1.5 rounded-lg text-slate-300 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
                      >
                        <Filter size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
