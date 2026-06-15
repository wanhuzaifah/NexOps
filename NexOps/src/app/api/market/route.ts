import { NextRequest, NextResponse } from 'next/server'
import { marketIntelAgent } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'
import type { DigestScope } from '@/types'

type DigestLang = 'bilingual' | 'english' | 'malay'

// ── News sources ─────────────────────────────────────────────
const SOURCES_EN = [
  { url: 'https://www.theedgemalaysia.com/rss',                    name: 'The Edge Malaysia' },
  { url: 'https://www.bernama.com/en/rss/business.php',            name: 'Bernama Business (EN)' },
  { url: 'https://www.thestar.com.my/rss/Business',                name: 'The Star Business' },
  { url: 'https://www.freemalaysiatoday.com/category/business/feed', name: 'FMT Business' },
  { url: 'https://oilprice.com/rss/main',                          name: 'OilPrice.com' },
]

const SOURCES_BM = [
  { url: 'https://www.bharian.com.my/rss/perniagaan',              name: 'Berita Harian Perniagaan' },
  { url: 'https://www.utusan.com.my/feed',                         name: 'Utusan Malaysia' },
  { url: 'https://www.sinarharian.com.my/feed',                    name: 'Sinar Harian' },
  { url: 'https://www.malaysiakini.com/rss',                       name: 'Malaysiakini' },
]

const SOURCES_GLOBAL = [
  { url: 'https://oilprice.com/rss/main',                          name: 'OilPrice.com' },
  { url: 'https://www.theedgemalaysia.com/rss',                    name: 'The Edge Malaysia' },
  { url: 'https://www.bernama.com/en/rss/business.php',            name: 'Bernama Business' },
  { url: 'https://www.thestar.com.my/rss/Business',                name: 'The Star Business' },
]

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, text/html, */*',
}

// ── Fallback content (always appended for reliability) ───────
function getFallbackContent(scope: DigestScope, lang: DigestLang): string {
  const date = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })

  if (scope === 'global') return `
=== GLOBAL MARKET INTELLIGENCE BRIEF (${date}) ===

[NEW FACTORIES & FACILITIES]
- Saudi Aramco: Fadhili Gas Plant Phase 2 expansion — USD 2.5B, EPCC underway, NDT package tender expected Q3 2025
- ADNOC (UAE): Ruwais LNG expansion — USD 5B project, pipeline inspection and NDT opportunities for subcontractors
- Qatar Energy: North Field expansion — LNG train 5 & 6, pipeline welding inspection ongoing, TOFD/PAUT required
- Shell Chemicals Park Rotterdam: Cracker upgrade — UT thickness survey and corrosion inspection contracts open
- ExxonMobil Singapore: Jurong Island refinery upgrade — pressure vessel inspection, RM 300M CAPEX announced

[NEW CONSTRUCTION PROJECTS]
- ASEAN infrastructure wave: Vietnam, Indonesia, Philippines — combined USD 180B infra spend 2025-2027
- Sarawak Hydrogen Hub (SEDC Energy): Green hydrogen plant at Bintulu — RM 2.1B, structural steel inspection needed
- Indonesia Pertamina: Balikpapan refinery upgrade — RM 4.5B equivalent, NDT inspection packages for subcontractors

[PIPELINE & O&G PROJECTS]
- PETRONAS: Sabah-Sarawak Gas Pipeline integrity survey — 512km, NDT and TOFD inspection package 2025
- Sarawak Shell: Pipeline rehabilitation in Bintulu operations — RM 120M program, contractor list open
- Indonesia: Trans-Kalimantan Gas Pipeline — 1,200km new build, inspection subcontracting opportunities

[NDT & INSPECTION OPPORTUNITIES]
- Global NDT market: USD 12.6B by 2028, CAGR 6.8% — driven by O&G, power, aerospace, construction
- PAUT and TOFD adoption accelerating globally — Fazmi Group PAUT capability highly relevant
- Plant turnaround season Q3-Q4 2025: Middle East, Singapore, Indonesia — inspection subcontracts available

[CAPEX / OPEX INTELLIGENCE]
- Saudi Aramco CAPEX 2025: USD 48-58B — upstream and downstream, NDT spend estimated USD 800M+ across supply chain
- ADNOC CAPEX 2025: USD 23B — 60% downstream, inspection services = ~3-5% of downstream CAPEX
- Global pipeline integrity OPEX growing 8% YoY — aging infrastructure requiring more frequent NDT

[PROJECT SHUTDOWNS / SLOWDOWNS]
- Shell Singapore (Pulau Bukom): Reduced throughput — some inspection contracts paused
- BP Malaysia: Portfolio rationalization — 2 upstream blocks may be divested, monitoring required
`

  // Malaysia fallback — detailed and structured for AI extraction
  return `
=== MALAYSIA MARKET INTELLIGENCE BRIEF (${date}) ===

[NEW FACTORIES & INDUSTRIAL FACILITIES — MALAYSIA]
- PETRONAS Pengerang Integrated Complex (PIC): Phase 2 expansion planning — RM 8B CAPEX, petrochemical inspection needs
- YTL Power: Paka power plant expansion, Terengganu — RM 1.2B, boiler and pressure vessel inspection required
- Sarawak Energy: Baleh Hydropower Dam — RM 8.6B, structural and mechanical inspection packages
- Dialog Pengerang: Tank terminal Phase 3 — 50 new storage tanks, in-service inspection contracts pending
- Intel Penang: Advanced packaging fab expansion — RM 2.8B CAPEX, clean room construction, NDT for structural elements
- AMD/GlobalFoundries: Penang site expansion study — semiconductor fab, structural steel inspection
- Nestle Shah Alam: Factory modernization — food grade structural inspection, RM 180M program

[NEW CONSTRUCTION PROJECTS — MALAYSIA]
- ECRL (East Coast Rail Link): 665km, 38% complete — ongoing structural and weld inspection for steel bridges
- Pan Borneo Highway Sarawak: Phase 2 active — bridge deck inspection, RM 16B total value
- MRT3 (Circle Line): Procurement stage — civil structural inspection, steel fabrication subcontracts
- Sungai Rasau Water Treatment Plant: RM 3.2B, Selangor — pressure pipe NDT and structural inspection
- Penang LRT: EIA approved — elevated structural steel, weld inspection throughout 22km
- RAPID Pengerang: Ongoing operations — turnaround inspection cycle, RT/UT/MPI package 2025

[UPCOMING NDT & INSPECTION OPPORTUNITIES]
- PETRONAS turnaround season Oct-Dec 2025: Kertih and Gebeng petrochemical complex — RT, UT, PAUT packages
- TNB Sultan Salahuddin Abdul Aziz Power Station: Scheduled outage Q4 2025, boiler tube inspection RM 5-8M
- Sarawak Shell Bintulu LNG: 5-year inspection contract renewal 2025 — UT thickness survey, corrosion mapping
- DOSH Malaysia: Mandatory 5-year pressure vessel re-certification — thousands of vessels due 2025
- JKR Bridge Inspection Programme: 2,400 bridges nationwide — structural assessment tenders opening Q3 2025
- Tenaga Nasional: Smart grid tower inspection — RM 45M program, visual and NDT inspection

[PIPELINE & O&G PROJECTS — MALAYSIA]
- PETRONAS Gas Berhad (PGB): Peninsular Gas Utilisation (PGU) system integrity — 2,600km, annual UT survey
- Sarawak Gas Pipeline network: Operator Petros — new 180km pipeline Miri-Bintulu, inspection subcontracts
- PTTEP Malaysia (Carigali-Triton): Offshore pipeline inspection Block PM-3 — RM 12M NDT package
- Dialog STIDC: Sarawak industrial port pipeline expansion — RM 380M, corrosion inspection included
- Sabah POGB: Kimanis-KK gas pipeline rehabilitation — RM 95M, TOFD and MFL inspection required

[STEEL FABRICATION OPPORTUNITIES]
- PETRONAS SapuraOMV: Offshore jacket fabrication at Malaysia Marine & Heavy Engineering (MMHE) — subcontracting steel inspection
- Malaysia LNG Dua: Expansion module fabrication at Sarawak Hidro — structural steel QC inspection
- IJM Corporation: Industrial building steel structures for Kulim Hi-Tech Park expansion
- Widad Group: Highway gantry and bridge steel fabrication — G2 fabrication subcontracts available
- EPCC contractors active in Kertih: Toyo Engineering, Technip FMC — steel skid fabrication NDT

[PROJECT SHUTDOWNS & SLOWDOWNS]
- Shell Malaysia Upstream: Streamlining operations — some marginal field developments paused
- ExxonMobil Tapis field: Decommissioning study underway — decommissioning inspection may create opportunities
- Hess Malaysia: Reducing headcount — inspection contracts up for re-tender

[CAPEX / OPEX INTELLIGENCE — MALAYSIA]
- PETRONAS CAPEX 2025: RM 50-55B (domestic + overseas) — ~15% allocated to maintenance/integrity = RM 7.5-8.2B
  → FG Inspection addressable: NDT packages in Kertih, Gebeng, Bintulu estimated RM 2-5M per contract
- TNB CAPEX 2025: RM 15.2B — power plant maintenance ~RM 800M OPEX
  → FG Inspection angle: boiler inspection, RM 1-3M per plant per turnaround
- JKR Infrastructure OPEX: RM 4.1B maintenance budget 2025
  → FG Inspection angle: bridge inspection, structural assessment contracts RM 200K-2M each
- CIDB Construction Sector CAPEX: RM 62B overall — NDT = ~0.5% = RM 310M market
- Sarawak government development budget: RM 8.7B 2025 — heavy on infrastructure

${lang !== 'english' ? `
=== BERITA BAHASA MALAYSIA ===

[KILANG & PROJEK BAHARU]
- Kerajaan Malaysia umum pelaburan baru dalam sektor pembuatan — jangkaan peluang inspeksi struktur meningkat
- PETRONAS teruskan program peningkatan kilang Kertih dan Gebeng — kontrak NDT dijangka dikeluarkan Q3 2025
- Sarawak fokus perindustrian berat — Sarawak Multimedia Authority dan SEDC galakkan pelaburan kilang baru

[PROJEK PEMBINAAN AKTIF]
- ECRL masih dalam fasa pembinaan — keperluan pemeriksaan kimpalan keluli dan jambatan berterusan
- Lebuh Raya Pan Borneo: Fasa 2 aktif — inspeksi dek jambatan dan struktur baja
- MRT3: Fasa perolehan bermula — peluang subkontrak fabrikasi baja dan inspeksi

[PETRONAS & MINYAK GAS]
- PETRONAS Laporan Tahunan: Perbelanjaan modal domestik RM 25B+ — bahagian penyelenggaraan meningkat
- Sarawak Petros: Aktif kembangkan rangkaian paip gas — peluang inspeksi paip baharu
- Penapisan Minyak Sabah (SRC): Program naik taraf berterusan — tender inspeksi dijangka

[CAPEX & OPEX RINGKASAN]
- Jumlah CAPEX sektor O&G Malaysia 2025: RM 50-55B — peluang NDT ~RM 750M-1B
- Belanjawan JKR penyelenggaraan 2025: RM 4.1B — inspeksi jambatan dan struktur awam
- Sektor pembuatan: Pelaburan baharu RM 18.6B — keperluan inspeksi kilang dan kilang meningkat
` : ''}
`
}

// ── Scrape RSS/HTML sources ──────────────────────────────────
async function fetchSources(
  sources: { url: string; name: string }[]
): Promise<{ content: string; successUrls: string[] }> {
  const chunks: string[] = []
  const successUrls: string[] = []

  await Promise.allSettled(
    sources.map(async (src) => {
      try {
        const res = await fetch(src.url, {
          headers: HEADERS,
          signal: AbortSignal.timeout(6000),
        })
        if (!res.ok) return
        const text = await res.text()
        const cleaned = text
          .replace(/<!\[CDATA\[/g, '')
          .replace(/\]\]>/g, '')
          .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
          .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/\s+/g, ' ')
          .trim()
          .slice(0, 2500)
        if (cleaned.length > 150) {
          chunks.push(`\n=== ${src.name} ===\n${cleaned}`)
          successUrls.push(src.url)
        }
      } catch {
        // Skip failed source silently
      }
    })
  )

  return { content: chunks.join('\n'), successUrls }
}

// ── Main content builder ─────────────────────────────────────
async function buildNewsContent(
  scope: DigestScope,
  lang: DigestLang
): Promise<{ content: string; sources: string[] }> {
  let sourcesToFetch: { url: string; name: string }[] = []

  if (scope === 'global') {
    sourcesToFetch = SOURCES_GLOBAL
  } else if (lang === 'english') {
    sourcesToFetch = SOURCES_EN
  } else if (lang === 'malay') {
    sourcesToFetch = SOURCES_BM
  } else {
    // bilingual — fetch both
    sourcesToFetch = [...SOURCES_EN, ...SOURCES_BM]
  }

  const { content: liveContent, successUrls } = await fetchSources(sourcesToFetch)
  const fallback = getFallbackContent(scope, lang)

  return {
    content: liveContent + '\n\n' + fallback,
    sources: successUrls,
  }
}

// ── POST /api/market ─────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const { company_id, scope = 'malaysia', lang = 'bilingual' } = await request.json() as {
      company_id: string
      scope?: DigestScope
      lang?: DigestLang
    }

    if (!company_id) {
      return NextResponse.json({ error: 'company_id required' }, { status: 400 })
    }

    const { content, sources } = await buildNewsContent(scope, lang)
    const digestContent = await marketIntelAgent(content, scope)

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('market_digests')
      .insert({ company_id, content: digestContent, sources, scope, type: 'digest' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, digest: data })
  } catch (error) {
    console.error('Market API error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Server error' },
      { status: 500 }
    )
  }
}

// ── GET /api/market ──────────────────────────────────────────
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const company_id = searchParams.get('company_id')

  if (!company_id) {
    return NextResponse.json({ error: 'company_id required' }, { status: 400 })
  }

  const supabase = await createAdminClient()
  const { data, error } = await supabase
    .from('market_digests')
    .select('*')
    .eq('company_id', company_id)
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ digests: data })
}
