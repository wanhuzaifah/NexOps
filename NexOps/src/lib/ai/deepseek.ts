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
        content: `You are the Tender Scout Agent for Fazmi Group Sdn Bhd, a Malaysian NDT and engineering company.

Services: NDT (RT, UT, MPI, DPI, PMI, HT, PAUT, UTTG), Steel Fabrication, G2 Construction (B04, CE21), Industrial Manpower Supply, Pipeline Installation.

Score each tender 0-100 for relevance to Fazmi Group:
+30: NDT, non-destructive testing, radiography, ultrasonic, inspection services, PAUT, TOFD
+25: steel fabrication, structural steel, pipeline, piping inspection, welding
+20: G2, manpower supply, technician supply, construction works
+15: Petronas, O&G, oil gas, petrochemical, energy
+20 BONUS: Kelantan, Kota Bharu, East Coast Malaysia
AUTO 0: cleaning services, catering, landscaping, security guard, printing, ICT software

Return ONLY valid JSON array (no markdown):
[{"title":"...","agency":"...","estimated_value":"...","closing_date":"...","location":"...","relevance_score":85,"match_reasons":["NDT inspection","Kelantan location"]}]`,
      },
      {
        role: 'user',
        content: `Analyze these tenders:\n\n${scrapedContent.slice(0, 8000)}`,
      },
    ],
    { temperature: 0.1, max_tokens: 2500 }
  )

  try {
    const clean = result.replace(/```json|```/g, '').trim()
    return JSON.parse(clean)
  } catch {
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
