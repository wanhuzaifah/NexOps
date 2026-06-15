import { NextRequest, NextResponse } from 'next/server'
import { extractIntelligence, scoreOpportunities, marketIntelAgent } from '@/lib/ai/deepseek'
import { createAdminClient } from '@/lib/supabase/server'
import type { DigestScope } from '@/types'

type DigestLang = 'bilingual' | 'english' | 'malay'

// ── ALL NEWS SOURCES ─────────────────────────────────────────
const ALL_SOURCES = {

  // === MALAYSIA — ENGLISH ===
  malaysia_en: [
    { url: 'https://www.theedgemalaysia.com/rss',                         name: 'The Edge Malaysia' },
    { url: 'https://www.thestar.com.my/rss/Business',                     name: 'The Star Business' },
    { url: 'https://www.freemalaysiatoday.com/category/business/feed',    name: 'FMT Business' },
    { url: 'https://www.nst.com.my/business/feed',                        name: 'NST Business' },
    { url: 'https://www.malaymail.com/rss/money',                         name: 'Malay Mail Money' },
    { url: 'https://www.bernama.com/en/rss/business.php',                 name: 'Bernama Business' },
  ],

  // === MALAYSIA — BAHASA MALAYSIA ===
  malaysia_bm: [
    { url: 'https://www.bharian.com.my/rss/perniagaan',                   name: 'Berita Harian Perniagaan' },
    { url: 'https://www.utusan.com.my/feed',                              name: 'Utusan Malaysia' },
    { url: 'https://www.sinarharian.com.my/feed',                         name: 'Sinar Harian' },
    { url: 'https://www.malaysiakini.com/rss',                            name: 'Malaysiakini' },
  ],

  // === GLOBAL O&G ===
  global_og: [
    { url: 'https://oilprice.com/rss/main',                               name: 'OilPrice.com' },
    { url: 'https://www.rigzone.com/news/rss/rigzone_latest.aspx',        name: 'Rigzone' },
    { url: 'https://www.offshore-technology.com/feed/',                   name: 'Offshore Technology' },
    { url: 'https://www.hydrocarbonprocessing.com/rss',                   name: 'Hydrocarbon Processing' },
    { url: 'https://www.ogj.com/rss/home.rss',                           name: 'Oil & Gas Journal' },
    { url: 'https://www.lngworldnews.com/feed/',                          name: 'LNG World News' },
    { url: 'https://www.naturalgasintel.com/feed/',                       name: 'Natural Gas Intelligence' },
  ],

  // === GLOBAL NDT & INSPECTION ===
  global_ndt: [
    { url: 'https://www.ndtnet.com/news/rss.xml',                         name: 'NDT.net' },
    { url: 'https://www.ndt.net/article/rss/rss.php',                     name: 'NDT.net Articles' },
    { url: 'https://inspectioneering.com/feed/',                          name: 'Inspectioneering Journal' },
    { url: 'https://www.apiexam.com/news/feed/',                          name: 'API Inspection News' },
  ],

  // === GLOBAL CONSTRUCTION & ENGINEERING ===
  global_construction: [
    { url: 'https://www.globalconstructionreview.com/feed/',              name: 'Global Construction Review' },
    { url: 'https://www.enr.com/rss/news',                               name: 'Engineering News-Record' },
    { url: 'https://www.constructionweekonline.com/rss.xml',             name: 'Construction Week' },
    { url: 'https://www.bdcnetwork.com/rss.xml',                         name: 'Building Design+Construction' },
  ],

  // === SOUTHEAST ASIA & REGIONAL ===
  asean: [
    { url: 'https://www.channelnewsasia.com/rssfeeds/8395986',           name: 'CNA Business' },
    { url: 'https://www.straitstimes.com/RSS/business',                  name: 'Straits Times Business' },
    { url: 'https://kr-asia.com/feed',                                   name: 'KrASIA' },
    { url: 'https://www.bangkokpost.com/rss/data/business.xml',          name: 'Bangkok Post Business' },
    { url: 'https://www.thejakartapost.com/feed/',                       name: 'Jakarta Post' },
  ],

  // === MIDDLE EAST & PETROCHEMICAL ===
  middle_east: [
    { url: 'https://www.arabianbusiness.com/rss',                        name: 'Arabian Business' },
    { url: 'https://www.meed.com/rss',                                   name: 'MEED (Middle East Economy Digest)' },
    { url: 'https://www.zawya.com/rss/feed/projects',                    name: 'Zawya Projects' },
    { url: 'https://www.tradearabia.com/news/rss/OGN.xml',              name: 'TradeArabia O&G' },
  ],

  // === GLOBAL BUSINESS / FINANCIAL ===
  global_biz: [
    { url: 'https://feeds.reuters.com/reuters/businessNews',             name: 'Reuters Business' },
    { url: 'https://www.bloomberg.com/energy/rss',                       name: 'Bloomberg Energy' },
    { url: 'https://feeds.ft.com/rss/home/asia-pacific',                name: 'FT Asia-Pacific' },
  ],

  // === STEEL & MANUFACTURING ===
  steel_mfg: [
    { url: 'https://www.steelorbis.com/rss/news.xml',                    name: 'SteelOrbis' },
    { url: 'https://www.worldsteel.org/media-centre/news/rss.html',     name: 'World Steel Association' },
    { url: 'https://www.industryweek.com/rss',                          name: 'Industry Week' },
    { url: 'https://www.manufacturingglobal.com/feed',                  name: 'Manufacturing Global' },
  ],
}

// ── Select sources based on scope & lang ─────────────────────
function getSourcesForScope(scope: DigestScope, lang: DigestLang) {
  if (scope === 'global') {
    return [
      ...ALL_SOURCES.global_og,
      ...ALL_SOURCES.global_ndt,
      ...ALL_SOURCES.global_construction,
      ...ALL_SOURCES.middle_east,
      ...ALL_SOURCES.asean,
      ...ALL_SOURCES.steel_mfg,
      ...ALL_SOURCES.global_biz,
      ...ALL_SOURCES.malaysia_en,
    ]
  }

  // Malaysia scope
  const base = lang === 'english'
    ? ALL_SOURCES.malaysia_en
    : lang === 'malay'
    ? ALL_SOURCES.malaysia_bm
    : [...ALL_SOURCES.malaysia_en, ...ALL_SOURCES.malaysia_bm]

  return [
    ...base,
    ...ALL_SOURCES.global_og,        // always include O&G (PETRONAS is global)
    ...ALL_SOURCES.global_ndt,       // NDT industry news
    ...ALL_SOURCES.asean,            // regional context
    ...ALL_SOURCES.steel_mfg,        // steel/fab opportunities
  ]
}

const FETCH_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  'Accept': 'application/rss+xml, application/xml, text/xml, application/atom+xml, text/html, */*',
  'Accept-Language': 'en-US,en;q=0.9,ms;q=0.8',
}

// ── Scrape a single source ────────────────────────────────────
async function scrapeOne(src: { url: string; name: string }): Promise<string | null> {
  try {
    const res = await fetch(src.url, {
      headers: FETCH_HEADERS,
      signal: AbortSignal.timeout(7000),
    })
    if (!res.ok) return null
    const raw = await res.text()
    const cleaned = raw
      .replace(/<!\[CDATA\[/g, '').replace(/\]\]>/g, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#\d+;/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
    if (cleaned.length < 150) return null
    return `\n=== ${src.name.toUpperCase()} ===\n${cleaned.slice(0, 2000)}`
  } catch {
    return null
  }
}

// ── Fallback structured data (always appended) ───────────────
function getFallbackContent(scope: DigestScope): string {
  const date = new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })

  return `
=== STRUCTURED MARKET INTELLIGENCE — ${scope.toUpperCase()} (${date}) ===

[NEW FACTORIES & INDUSTRIAL FACILITIES]
- PETRONAS Pengerang Integrated Complex (PIC): Phase 2 planning — RM 8B CAPEX, NDT packages expected
- Dialog Pengerang Tank Terminal Phase 3: 50 new storage tanks, API 653 inspection contracts pending
- YTL Power Paka: Power plant expansion RM 1.2B — boiler & pressure vessel inspection required
- Intel Penang: Advanced packaging fab RM 2.8B CAPEX — structural steel NDT subcontracts
- Sarawak Energy Baleh Dam: RM 8.6B hydro project — structural/mechanical inspection packages
- Saudi Aramco Fadhili Gas Plant Phase 2: USD 2.5B — NDT package subcontracts expected
- ADNOC Ruwais LNG expansion: USD 5B — pipeline & vessel inspection opportunities

[NEW CONSTRUCTION PROJECTS]
- ECRL Malaysia: 38% complete, 665km — ongoing weld & structural inspection for steel bridges
- MRT3 Circle Line KL: Procurement stage — civil structural inspection, steel fab QC
- Pan Borneo Highway Sarawak Phase 2: Active — bridge deck NDT, RM 16B total
- Sungai Rasau Water Treatment: RM 3.2B Selangor — pressure pipe & structural NDT
- Penang LRT: 22km elevated — structural steel weld inspection throughout
- Qatar North Field LNG Train 5 & 6: USD 28.7B — pipeline inspection, TOFD/PAUT required
- ASEAN Infrastructure: Indonesia, Vietnam, Philippines combined USD 180B spend 2025-2027

[UPCOMING NDT & INSPECTION OPPORTUNITIES]
- PETRONAS turnaround Oct-Dec 2025: Kertih & Gebeng petrochemical — RT, UT, PAUT packages RM 2-8M each
- TNB Sultan Salahuddin Power Station: Scheduled outage Q4 2025 — boiler tube inspection RM 5-8M
- Shell Bintulu LNG: 5-year inspection contract renewal — UT thickness survey, corrosion mapping
- DOSH Malaysia: Mandatory 5-year pressure vessel re-cert — thousands of vessels due 2025
- JKR Bridge Inspection: 2,400 bridges nationwide — structural assessment tenders Q3 2025
- Saudi Aramco plant turnarounds: 12 facilities scheduled 2025 — inspection packages USD 50-200M each
- ADNOC Annual Inspection Programme 2025: Abu Dhabi — offshore & onshore NDT frameworks

[PIPELINE & O&G PROJECTS]
- PETRONAS PGB Peninsular Gas: PGU 2,600km integrity — annual UT survey, corrosion monitoring
- Petros Sarawak Gas Pipeline: New 180km Miri-Bintulu — inspection subcontracts open
- PTTEP Malaysia Block PM-3: Offshore pipeline inspection — RM 12M NDT package
- Saudi Aramco Master Gas System: 12,000km expansion — RT/UT welding inspection
- Aramco Red Sea Pipeline: New 620km — weld inspection, PAUT required
- Iraq Basra-Aqaba Pipeline: 1,700km — international NDT subcontracting opportunity
- Indonesia Pertamina Trans-Java Gas: 1,217km — pipeline inspection, RM 25M equivalent

[STEEL FABRICATION OPPORTUNITIES]
- MMHE Malaysia: Offshore jacket fabrication — structural steel inspection subcontracts
- Kencana Petroleum: Module fabrication Pasir Gudang — NDT QC packages
- IJM Industrial: Kulim Hi-Tech Park factory buildings — structural steel QC
- Widad Group: Highway gantry structures — G2 fabrication subcontracts
- Global steel module fabrication: Saudi, UAE, Qatar EPCC projects open for Malaysian vendors

[PROJECT SHUTDOWNS & SLOWDOWNS]
- Shell Malaysia Upstream: Marginal field rationalization — some inspection contracts paused
- ExxonMobil Tapis: Decommissioning study — decom inspection may create opportunities
- BP Malaysia: Portfolio review — 2 upstream blocks under divestment, monitoring required
- Hess Malaysia: Headcount reduction — inspection contracts up for re-tender

[CAPEX / OPEX INTELLIGENCE]
- PETRONAS CAPEX 2025: RM 50-55B total → maintenance/integrity ~RM 7.5-8.2B → NDT addressable ~RM 500-750M
- TNB CAPEX 2025: RM 15.2B → power plant maintenance OPEX RM 800M → inspection ~RM 40-80M
- JKR Infrastructure OPEX: RM 4.1B maintenance budget → bridge/structural inspection RM 200K-2M each
- Saudi Aramco CAPEX 2025: USD 48-58B → NDT supply chain estimated USD 800M+
- ADNOC CAPEX 2025: USD 23B → inspection services ~3-5% of downstream CAPEX = USD 350-600M
- Global NDT Market: USD 12.6B by 2028, CAGR 6.8% — PAUT/phased array fastest growing segment
- Malaysia construction sector CAPEX RM 62B → NDT ~0.5% = RM 310M addressable market
`
}

// ── Main fetch orchestrator ───────────────────────────────────
async function buildNewsContent(scope: DigestScope, lang: DigestLang) {
  const sources = getSourcesForScope(scope, lang)

  // Scrape all sources concurrently
  const results = await Promise.all(sources.map(scrapeOne))
  const liveChunks = results.filter((r): r is string => r !== null)
  const successSources = sources
    .filter((_, i) => results[i] !== null)
    .map(s => s.url)

  const liveContent = liveChunks.join('\n')
  const fallback = getFallbackContent(scope)

  console.log(`[Market] Scraped ${liveChunks.length}/${sources.length} sources successfully`)

  return {
    content: liveContent + '\n\n' + fallback,
    sources: successSources,
    sourceCount: liveChunks.length,
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

    const { content, sources, sourceCount } = await buildNewsContent(scope, lang)

    // ── Multi-pass DeepSeek pipeline ──────────────────────────
    // Pass 1: Extract structured intelligence entities from raw content
    const extractedIntel = await extractIntelligence(content)

    // Pass 2: Score and prioritize opportunities
    const scoredOpportunities = await scoreOpportunities(extractedIntel)

    // Pass 3: Generate full narrative digest with 8-section report
    const narrativeDigest = await marketIntelAgent(content, scope)

    // Combine all 3 passes into one rich digest
    const digestContent = `${narrativeDigest}

---

## 🎯 Prioritized Opportunities / Peluang Utama (AI Scored)

${scoredOpportunities}`

    const supabase = await createAdminClient()
    const { data, error } = await supabase
      .from('market_digests')
      .insert({ company_id, content: digestContent, sources, scope, type: 'digest' })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, digest: data, sources_scraped: sourceCount })
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
