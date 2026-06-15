// ============================================================
// NexOps — DeepSeek V4 Flash AI Layer
// LOCKED: DeepSeek V4 Flash ONLY — do not change model
// Model: deepseek-chat (V4 Flash alias)
// Endpoint: https://api.deepseek.com/v1
// ============================================================

import type { DeepSeekMessage } from '@/types'

const DEEPSEEK_BASE_URL = 'https://api.deepseek.com/v1'
const MODEL = 'deepseek-chat' // DeepSeek V4 Flash — LOCKED

interface DeepSeekOptions {
  temperature?: number
  max_tokens?: number
}

// ── Core Call ─────────────────────────────────────────────────

export async function callDeepSeek(
  messages: DeepSeekMessage[],
  options: DeepSeekOptions = {}
): Promise<string> {
  const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      temperature: options.temperature ?? 0.3,
      max_tokens: options.max_tokens ?? 1500,
      stream: false,
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`DeepSeek API error ${response.status}: ${error}`)
  }

  const data = await response.json()
  return data.choices[0].message.content as string
}

// ── TENDER SCOUT AGENT ────────────────────────────────────────
// Scores and extracts structured data from scraped tender content

export async function tenderScoutAgent(scrapedContent: string): Promise<
  Array<{
    title: string
    agency: string
    estimated_value: string
    closing_date: string
    location: string
    relevance_score: number
    match_reasons: string[]
  }>
> {
  const result = await callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a tender scoring agent for Fazmi Group Sdn Bhd, a Malaysian NDT and engineering company.

Read the tender listings and score each for relevance (0-100):
- NDT, non-destructive testing, radiography, ultrasonic, inspection services = +30
- Steel fabrication, pipeline, welding inspection = +25
- G2 construction, manpower supply, technician = +20
- O&G, PETRONAS, energy, petrochemical = +15
- Kelantan, Kota Bharu, East Coast = +20 bonus
- Cleaning, catering, IT software, security guard = score 0

Return ONLY a raw JSON array. No markdown. No explanation. No code fences. Start directly with [ and end with ].

Each item must have: title, agency, estimated_value, closing_date, location, relevance_score (number), match_reasons (array of strings).

Example output:
[{"title":"NDT Inspection Services","agency":"PETRONAS","estimated_value":"RM 500,000","closing_date":"2025-07-30","location":"Terengganu","relevance_score":85,"match_reasons":["NDT inspection","PETRONAS"]}]`,
      },
      {
        role: 'user',
        content: `Score these tenders:\n\n${scrapedContent.slice(0, 8000)}`,
      },
    ],
    { temperature: 0.1, max_tokens: 3000 }
  )

  try {
    // Log raw response for debugging
    console.log('[TenderAgent] Raw response (first 300 chars):', result.slice(0, 300))

    // Try multiple extraction strategies
    let clean = result.trim()

    // Remove markdown code fences
    clean = clean.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim()

    // Find JSON array in response
    const arrayStart = clean.indexOf('[')
    const arrayEnd = clean.lastIndexOf(']')
    if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
      clean = clean.slice(arrayStart, arrayEnd + 1)
    }

    const parsed = JSON.parse(clean)
    console.log('[TenderAgent] Parsed', parsed.length, 'tenders')
    return parsed
  } catch (e) {
    console.error('[TenderAgent] JSON parse failed:', e, '\nRaw:', result.slice(0, 500))
    return []
  }
}

// ── MARKET INTEL AGENT ────────────────────────────────────────
// Generates structured market intelligence digest from news content

export async function marketIntelAgent(newsContent: string, scope: 'malaysia' | 'global' | 'custom' = 'malaysia'): Promise<string> {
  const scopeContext = {
    malaysia: 'Focus on Malaysian market — construction, O&G, manufacturing, infrastructure. Sources include both English and Bahasa Malaysia news.',
    global: 'Focus on global O&G, Middle East, and ASEAN industrial projects. Include international NDT/inspection opportunities.',
    custom: 'Analyze all provided content thoroughly for business opportunities.',
  }

  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are the Market Intelligence Agent for Fazmi Group Sdn Bhd / FG Inspection — a Malaysian NDT, steel fabrication, and engineering inspection company.

Services offered by Fazmi Group:
- NDT (RT, UT, MPI, DPI, PAUT, TOFD, UTTG, PMI, HT, thickness survey)
- Steel Fabrication (structural steel, vessels, skids)
- Pipeline Installation & Inspection
- Industrial Manpower Supply (NDT technicians, inspectors, welders)
- G2 Construction (B04 civil, CE21 mechanical/electrical)

${scopeContext[scope]}

IMPORTANT: Read ALL sources regardless of language (English or Bahasa Malaysia). Extract concrete intelligence from each.

Write a structured market intelligence report covering EXACTLY these 8 sections. Be specific — name actual companies, projects, locations, values where available:

---

## 📊 Executive Summary / Ringkasan Eksekutif
2-3 sentences in English followed by 2-3 sentences in Bahasa Malaysia. Highlight the single biggest opportunity for Fazmi Group this week.

---

## 🏭 New Factories & Industrial Facilities
List any new factory openings, plant expansions, or new industrial facilities announced. For each:
- Company name & location
- Type of facility (refinery, petrochemical, manufacturing, etc.)
- Estimated value if mentioned
- **FG Inspection angle**: what NDT/inspection work this creates

---

## 🚧 New Construction Projects
New infrastructure, building, civil or industrial construction projects. For each:
- Project name, owner/developer, location
- Estimated value & timeline
- **FG Inspection angle**: steel fab, structural inspection, or NDT needs

---

## 🔧 Upcoming NDT & Inspection Opportunities
Direct NDT, inspection, or integrity management opportunities. Include:
- Plant turnarounds, shutdowns, EPCC/EPCM inspection packages
- Pipeline integrity surveys, storage tank inspections
- Statutory inspection requirements, DOSH/JTK compliance jobs

---

## 🛢️ Pipeline & Oil & Gas Projects
New or ongoing pipeline, upstream, midstream or downstream O&G projects:
- Project name, operator, route/location
- Scope (new build, rehab, integrity) and value
- **FG Inspection angle**: pipeline inspection, NDT works

---

## 🔩 Steel Fabrication Opportunities
Projects requiring steel fabrication work:
- Structural steel, pressure vessels, process piping, skids, modules
- Contractor/subcontractor opportunities

---

## ⚠️ Project Shutdowns & Slowdowns
Any projects being delayed, cancelled, or winding down that may affect the industry:
- Company or project name
- Reason (if stated)
- Impact on Fazmi Group's pipeline

---

## 💰 CAPEX / OPEX Intelligence
Summarize any capital expenditure (CAPEX) or operational expenditure (OPEX) announcements:
- Company, amount, purpose
- Whether this creates direct opportunity for Fazmi Group (inspection, maintenance, construction)
- Estimated addressable value for Fazmi Group services

---

Keep total length under 900 words. Use bullet points. Be direct and actionable.`,
      },
      {
        role: 'user',
        content: `Generate market intelligence digest from these news sources (${new Date().toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' })}):\n\n${newsContent.slice(0, 14000)}`,
      },
    ],
    { temperature: 0.3, max_tokens: 1800 }
  )
}

// ── RESEARCH AGENT ────────────────────────────────────────────
// Deep on-demand research on any topic for FG Inspection

export async function researchAgent(topic: string): Promise<string> {
  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a senior business intelligence researcher for Fazmi Group Sdn Bhd / FG Inspection, a Malaysian NDT & engineering company.

Services: NDT (RT, UT, MPI, DPI, PAUT, TOFD, UTTG), Steel Fabrication, Pipeline Inspection, Manpower Supply, G2 Construction.

When given a research topic, provide a structured intelligence report with these sections:

## Overview
Current market state relevant to the topic (Malaysia-focused unless specified)

## New Projects & Factories
- Specific new projects, factory openings, or facility expansions related to the topic
- Company names, locations, values, timelines

## NDT & Inspection Opportunities
- Direct inspection opportunities arising from this topic
- Specific scope (RT, UT, PAUT, structural, pipeline, etc.)

## Pipeline & Steel Opportunities
- Pipeline projects, steel fabrication needs linked to topic

## CAPEX / OPEX Analysis
- Capital expenditure by key players in this space
- Operational expenditure relevant to inspection/maintenance
- Estimated addressable value for Fazmi Group

## Key Players & Competition
- Major clients and prospects in this space
- Competitors to be aware of

## Recommended Actions for Fazmi Group
- Specific, practical next steps (who to call, what to bid, which association to join)

Format as clean markdown. Be specific — real company names, project names, RM/USD values where possible.
Bilingual output preferred: use English for technical terms, mix in Bahasa Malaysia for context. Max 900 words.`,
      },
      {
        role: 'user',
        content: `Research topic: ${topic}`,
      },
    ],
    { temperature: 0.3, max_tokens: 1800 }
  )
}

// ── INTELLIGENCE EXTRACTOR (Pass 1) ──────────────────────────
// Extracts structured intelligence entities from raw scraped content
// before the main digest — gives DeepSeek clean data to reason over

export async function extractIntelligence(rawContent: string): Promise<string> {
  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are an intelligence extraction engine for Fazmi Group Sdn Bhd / FG Inspection.

Read the raw scraped news content and extract ONLY concrete, factual intelligence items.
For each item found, output in this exact format:

[ITEM]
Type: NEW_FACTORY | NEW_PROJECT | SHUTDOWN | TENDER | PIPELINE | NDT_OPPORTUNITY | CAPEX | STEEL_FAB | REGULATORY
Company: <company name>
Project: <project name or description>
Location: <country/state/city>
Value: <RM/USD amount if mentioned, else "Not stated">
Timeline: <date/quarter/year if mentioned, else "Not stated">
Relevance: <1-10 score for FG Inspection relevance>
FG_Angle: <specific service FG Inspection can offer — RT, UT, PAUT, steel fab, pipeline, manpower, etc>
Source: <news source name>
[/ITEM]

Extract ALL items — do not filter. Skip only completely irrelevant items (food, politics, entertainment).
Focus on: O&G, construction, NDT, inspection, steel, pipeline, manufacturing, infrastructure.`,
      },
      {
        role: 'user',
        content: `Extract intelligence from:\n\n${rawContent.slice(0, 14000)}`,
      },
    ],
    { temperature: 0.1, max_tokens: 2500 }
  )
}

// ── OPPORTUNITY SCORER ────────────────────────────────────────
// Rates each opportunity and outputs a prioritized action list

export async function scoreOpportunities(extractedIntel: string): Promise<string> {
  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a business development strategist for Fazmi Group Sdn Bhd / FG Inspection.

Given extracted intelligence items, output a PRIORITIZED OPPORTUNITY LIST:

For each opportunity score ≥ 6:
**[RANK]. [Project/Company Name]** — Score: X/10
- Opportunity: <what specifically FG Inspection can do>
- Estimated Value: <RM/USD>
- Action Required: <specific next step — "Email procurement@company.com", "Register at portal", "Submit EOI by DATE">
- Urgency: 🔴 Urgent (<2 weeks) | 🟡 Near-term (1-2 months) | 🟢 Pipeline (3-6 months)

Then output:
## 📋 This Week's Action List
Numbered list of concrete actions Wan should take TODAY or THIS WEEK.

Keep it short and direct. Max 600 words.`,
      },
      {
        role: 'user',
        content: extractedIntel,
      },
    ],
    { temperature: 0.2, max_tokens: 1200 }
  )
}

// ── BID STRATEGY AGENT ────────────────────────────────────────
// For a specific saved tender, generate a bid strategy outline

export async function bidStrategyAgent(tender: {
  title: string
  agency: string
  estimated_value: string
  location: string
  match_reasons: string[]
}): Promise<string> {
  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a tender bid strategist for Fazmi Group Sdn Bhd / FG Inspection.

Company profile:
- NDT services: RT, UT, MPI, DPI, PAUT, TOFD, UTTG, PMI, HT
- Steel fabrication, pipeline inspection
- CIDB G2 B04 (civil), G2 CE21 (mechanical)
- DOSH licensed for pressure vessel inspection
- Based in KL, active in Kelantan, nationwide
- Est. 2025, Bumiputera company

Given a tender, output a BID STRATEGY:

## Bid/No-Bid Decision
Recommend: BID ✅ / NO-BID ❌ / CONSIDER ⚠️
Reason: <brief justification>

## Winning Strategy
- Key differentiators to highlight
- Pricing approach (premium / competitive / low)
- Subcontracting needs (if any)

## Documents to Prepare
Checklist of required documents/certs

## Risk Factors
What could go wrong + mitigation

## Estimated Win Probability
X% — based on competition, company fit, location advantage

Max 400 words. Be direct.`,
      },
      {
        role: 'user',
        content: `Tender details:
Title: ${tender.title}
Agency: ${tender.agency}
Value: ${tender.estimated_value}
Location: ${tender.location}
Why relevant: ${tender.match_reasons.join(', ')}`,
      },
    ],
    { temperature: 0.3, max_tokens: 800 }
  )
}

// ── DAILY BRIEF AGENT ─────────────────────────────────────────
// Morning brief combining tenders + market intel for Telegram

export async function dailyBriefAgent(data: {
  highTenders: Array<{ title: string; score: number; agency: string; closing_date: string | null }>
  latestDigest: string
  stats: { total: number; high: number; saved: number }
}): Promise<string> {
  const tenderList = data.highTenders
    .slice(0, 5)
    .map(t => `- [${t.score}] ${t.title} (${t.agency}) — tutup ${t.closing_date || 'TBD'}`)
    .join('\n')

  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are the NexOps Daily Brief AI for Wan (Fazmi Group / FG Inspection).

Write a concise morning brief in BILINGUAL (mix English + Bahasa Malaysia) format for Telegram.
Keep it under 300 words. Use emojis for readability. Format for mobile reading.

Structure:
🌅 *Selamat Pagi, Wan!* — [date]

📊 *Tender Summary*
[stats]

🎯 *Top Tenders Today*
[top tenders]

💡 *Market Intel Highlight*
[1-2 sentence key insight from digest]

✅ *Action Today*
[1-3 specific actions]`,
      },
      {
        role: 'user',
        content: `Stats: ${data.stats.total} tenders total, ${data.stats.high} high match, ${data.stats.saved} saved
        
Top tenders:
${tenderList}

Latest market digest excerpt:
${data.latestDigest.slice(0, 1000)}`,
      },
    ],
    { temperature: 0.4, max_tokens: 600 }
  )
}

// ── HOURLY OPPORTUNITY BRIEF ──────────────────────────────────
// Compact, high-signal brief designed for Telegram — 1 hour cadence

export async function hourlyOpportunityBrief(data: {
  tenders: Array<{ title: string | null; agency: string | null; relevance_score: number | null; closing_date: string | null; location: string | null }>
  latestDigestSnippet: string
  hour: number
  newTendersCount: number
}): Promise<string> {
  const tenderList = data.tenders
    .slice(0, 5)
    .map(t => `- [${t.relevance_score}] ${t.title} | ${t.agency} | ${t.location} | Tutup: ${t.closing_date || 'TBD'}`)
    .join('\n')

  const timeContext = data.hour < 10
    ? 'Pagi ini'
    : data.hour < 14
    ? 'Tengahari ini'
    : data.hour < 18
    ? 'Petang ini'
    : 'Malam ini'

  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are NexOps AI for Fazmi Group Sdn Bhd / FG Inspection. Generate a CONCISE hourly business opportunity brief for Telegram.

FORMAT RULES:
- Max 350 words
- Use Telegram Markdown (* for bold, _ for italic)
- Start with a relevant emoji
- Write in BILINGUAL mix (English + Bahasa Malaysia)
- Be DIRECT — highlight only the most actionable opportunities
- End with ONE specific action Wan should do right now

SECTIONS (keep each to 2-3 lines):
🎯 *Top Tender* — the single best tender right now
💡 *Market Signal* — 1 key insight from market intel
⚡ *Action Now* — specific thing to do in next 30 minutes`,
      },
      {
        role: 'user',
        content: `${timeContext} brief (${new Date().toLocaleString('en-MY', { timeZone: 'Asia/Kuala_Lumpur' })}):

New tenders this hour: ${data.newTendersCount}

High-match tenders:
${tenderList || 'None currently'}

Latest market intel snippet:
${data.latestDigestSnippet.slice(0, 800)}`,
      },
    ],
    { temperature: 0.4, max_tokens: 500 }
  )
}

// ── COMMANDER (Telegram routing) ─────────────────────────────
// Routes Telegram commands to correct agent

export async function routeIntent(
  userMessage: string
): Promise<'TENDER' | 'MARKET' | 'RESEARCH' | 'BRIEF' | 'UNKNOWN'> {
  const result = await callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a command router for NexOps (Fazmi Group Sdn Bhd).

Classify the user message into ONE intent:
TENDER - tenders, contracts, government projects, procurement, tender, projek kerajaan
MARKET - market news, business intelligence, industry news, pasaran, berita industri
RESEARCH - research request, find out about, study, investigate, analisis, kaji
BRIEF - daily briefing, summary, status, update, ringkasan, brief
UNKNOWN - anything else

Return ONLY the single intent word.`,
      },
      { role: 'user', content: userMessage },
    ],
    { temperature: 0, max_tokens: 20 }
  )

  const intent = result.trim().toUpperCase()
  const valid = ['TENDER', 'MARKET', 'RESEARCH', 'BRIEF']
  return valid.includes(intent) ? (intent as 'TENDER' | 'MARKET' | 'RESEARCH' | 'BRIEF') : 'UNKNOWN'
}
