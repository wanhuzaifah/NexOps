import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import {
  Search,
  BarChart2,
  AlertTriangle,
  TrendingUp,
  CheckCircle,
  Clock,
  Bookmark,
  Send,
  RefreshCw,
} from 'lucide-react'
import type { MarketDigest } from '@/types'
import { TelegramBriefButton } from '@/components/TelegramBriefButton'

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color,
  alert,
  href,
}: {
  title: string
  value: string
  subtitle?: string
  icon: React.ElementType
  color: string
  alert?: boolean
  href?: string
}) {
  const card = (
    <div className={`bg-white dark:bg-slate-800 rounded-xl border ${alert ? 'border-amber-200 dark:border-amber-800' : 'border-slate-200 dark:border-slate-700'} p-5 ${href ? 'hover:border-brand-gold/40 hover:shadow-sm transition cursor-pointer' : ''}`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wide">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${alert ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-white'}`}>
            {value}
          </p>
          {subtitle && <p className="text-slate-400 text-xs mt-0.5">{subtitle}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
  return href ? <Link href={href}>{card}</Link> : card
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Use maybeSingle() — returns null instead of throwing 404 when no row found
  const { data: profile } = await supabase
    .from('profiles').select('company_id').eq('id', user?.id ?? '').maybeSingle()
  const companyId = profile?.company_id ?? null

  const now = new Date()
  const today = now.toISOString().split('T')[0]
  const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  const todayStart = new Date(now.setHours(0, 0, 0, 0)).toISOString()

  // Only query if companyId exists
  const [
    { data: allTenders },
    { data: todayTenders },
    { data: latestDigests },
  ] = companyId
    ? await Promise.all([
        supabase.from('tender_cache').select('relevance_score, status, closing_date').eq('company_id', companyId),
        supabase.from('tender_cache').select('id').eq('company_id', companyId).gte('scraped_at', todayStart),
        supabase.from('market_digests').select('*').eq('company_id', companyId).eq('type', 'digest').order('created_at', { ascending: false }).limit(1),
      ])
    : [{ data: null }, { data: null }, { data: null }]

  const highMatch = allTenders?.filter((t) => (t.relevance_score || 0) >= 80) || []
  const saved = allTenders?.filter((t) => t.status === 'saved') || []
  const applied = allTenders?.filter((t) => t.status === 'applied') || []
  const closingSoon = allTenders?.filter((t) => {
    if (!t.closing_date) return false
    return t.closing_date >= today && t.closing_date <= weekFromNow
  }) || []

  const latestDigest = latestDigests?.[0] as MarketDigest | null

  const greeting =
    new Date().getHours() < 12 ? 'Selamat Pagi' :
    new Date().getHours() < 17 ? 'Selamat Tengahari' : 'Selamat Petang'

  // Show setup screen if company not linked yet
  if (!companyId) {
    return (
      <div className="max-w-lg mx-auto mt-16 text-center">
        <div className="w-14 h-14 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-brand-navy" />
        </div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Setup Required</h2>
        <p className="text-slate-500 text-sm mb-6">
          Profile anda belum dikonfigurasi. Jalankan SQL berikut dalam Supabase SQL Editor:
        </p>
        <div className="bg-slate-900 rounded-xl p-4 text-left text-xs font-mono text-emerald-400 mb-6 space-y-1">
          <p>INSERT INTO companies (name)</p>
          <p>{'  '}VALUES (&apos;FAZMI GROUP SDN BHD&apos;);</p>
          <p className="text-slate-500 mt-2">-- Then:</p>
          <p>UPDATE profiles</p>
          <p>{'  '}SET company_id = (SELECT id FROM companies LIMIT 1)</p>
          <p>WHERE id = (SELECT id FROM auth.users LIMIT 1);</p>
        </div>
        <p className="text-slate-400 text-xs">Lepas run SQL, refresh halaman ini.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white">{greeting}, Wan 👋</h1>
          <p className="text-slate-500 text-sm mt-1">
            Paparan perisikan AI Fazmi Group — {new Date().toLocaleDateString('ms-MY', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Link
            href="/tenders"
            className="flex items-center gap-2 px-4 py-2 gold-gradient text-brand-navy rounded-lg text-sm font-semibold hover:opacity-90 transition"
          >
            <Search size={15} />
            Scan Tender
          </Link>
          <Link
            href="/market"
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 dark:bg-slate-700 text-white rounded-lg text-sm font-medium hover:bg-slate-700 dark:hover:bg-slate-600 transition"
          >
            <BarChart2 size={15} />
            Market Intel
          </Link>
          <TelegramBriefButton companyId={companyId || ''} />
        </div>
      </div>

      {/* Alert: tenders closing soon */}
      {closingSoon.length > 0 && (
        <div className="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-amber-700 dark:text-amber-300 text-sm">
            <strong>{closingSoon.length} tender</strong> akan tutup dalam 7 hari — semak segera
          </p>
          <Link href="/tenders" className="ml-auto text-amber-600 dark:text-amber-400 text-xs font-medium hover:underline">
            Lihat →
          </Link>
        </div>
      )}

      {/* Tender Stats */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Tender Scout
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Scan Hari Ini"
            value={String(todayTenders?.length || 0)}
            subtitle="tender ditemui"
            icon={Search}
            color="bg-indigo-500"
            href="/tenders"
          />
          <StatCard
            title="High Match"
            value={String(highMatch.length)}
            subtitle="skor ≥ 80"
            icon={TrendingUp}
            color="bg-emerald-500"
            href="/tenders"
            alert={highMatch.length > 0}
          />
          <StatCard
            title="Disimpan"
            value={String(saved.length)}
            subtitle="untuk semak lanjut"
            icon={Bookmark}
            color="bg-blue-500"
            href="/tenders"
          />
          <StatCard
            title="Telah Mohon"
            value={String(applied.length)}
            subtitle="tender dihantar"
            icon={Send}
            color="bg-purple-500"
            href="/tenders"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">
          Tindakan Pantas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Scan Tender Baru', href: '/tenders', icon: RefreshCw, color: 'bg-indigo-500 hover:bg-indigo-600' },
            { label: 'Tender Disimpan', href: '/tenders?filter=saved', icon: Bookmark, color: 'bg-blue-500 hover:bg-blue-600' },
            { label: 'Digest Pasaran', href: '/market', icon: BarChart2, color: 'bg-emerald-500 hover:bg-emerald-600' },
            { label: 'Research Topik', href: '/market?tab=research', icon: Search, color: 'bg-amber-500 hover:bg-amber-600' },
          ].map((a) => (
            <Link
              key={a.href}
              href={a.href}
              className={`${a.color} text-white rounded-xl p-4 flex flex-col gap-2 transition`}
            >
              <a.icon size={20} className="opacity-90" />
              <span className="text-sm font-medium">{a.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest Market Digest */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
            Digest Pasaran Terkini
          </h2>
          <Link href="/market" className="text-brand-gold text-xs hover:underline">
            Lihat semua →
          </Link>
        </div>

        {latestDigest ? (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                  <CheckCircle size={13} className="text-emerald-500" />
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  {new Date(latestDigest.created_at).toLocaleDateString('ms-MY', {
                    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  latestDigest.scope === 'global'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                }`}>
                  {latestDigest.scope === 'global' ? 'Global' : 'Malaysia'}
                </span>
              </div>
            </div>
            <div className="prose prose-sm dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 line-clamp-6 text-sm leading-relaxed whitespace-pre-wrap">
              {latestDigest.content.slice(0, 800)}{latestDigest.content.length > 800 ? '...' : ''}
            </div>
            <Link href="/market" className="inline-block mt-3 text-brand-gold text-xs hover:underline">
              Baca penuh →
            </Link>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 p-8 text-center">
            <BarChart2 size={32} className="text-slate-200 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Belum ada digest pasaran</p>
            <p className="text-slate-400 text-xs mt-1">Pergi ke Market Intel untuk jana digest pertama</p>
            <Link
              href="/market"
              className="inline-flex items-center gap-2 mt-4 px-4 py-2 gold-gradient text-brand-navy rounded-lg text-sm font-semibold hover:opacity-90 transition"
            >
              <BarChart2 size={14} />
              Jana Digest Sekarang
            </Link>
          </div>
        )}
      </div>

      {/* Closing Soon */}
      {closingSoon.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center gap-2">
            <Clock size={15} className="text-amber-500" />
            <h2 className="font-semibold text-slate-800 dark:text-white text-sm">
              Tender Tutup Minggu Ini ({closingSoon.length})
            </h2>
          </div>
          <div className="p-4 text-sm text-slate-500 dark:text-slate-400 italic">
            <Link href="/tenders" className="text-brand-gold hover:underline">
              Lihat dalam Tender Scout →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
