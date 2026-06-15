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
    malaysia: 'Focus on Malaysian construction, O&G, infrastructure, and NDT industry news.',
    global: 'Focus on global O&G, Middle East projects, and international NDT/inspection opportunities.',
    custom: 'Analyze the provided content thoroughly.',
  }

  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are the Market Intelligence Agent for Fazmi Group Sdn Bhd / FG Inspection, a Malaysian NDT engineering company.

${scopeContext[scope]}

Identify opportunities relevant to:
- NDT & Inspection services (RT, UT, MPI, DPI, PAUT)
- Oil & Gas (Malaysia + Middle East)
- Construction & Infrastructure (Malaysia)
- Steel Fabrication & Pipeline
- Industrial Manpower Supply

Format your response in clean markdown with these sections:
## Ringkasan Eksekutif
(2-3 sentence summary in Bahasa Malaysia)

## Peluang Utama
(bullet list of top 3-5 opportunities with brief explanation)

## Projek & Kontrak Baru
(specific projects/contracts mentioned)

## Risiko & Cabaran
(market risks to watch)

## Cadangan Tindakan
(what Fazmi Group should do based on this intel)

Keep it concise. Max 600 words total.`,
      },
      {
        role: 'user',
        content: `Generate market intel digest from:\n\n${newsContent.slice(0, 10000)}`,
      },
    ],
    { temperature: 0.4, max_tokens: 1200 }
  )
}

// ── RESEARCH AGENT ────────────────────────────────────────────
// Deep on-demand research on any topic for FG Inspection

export async function researchAgent(topic: string): Promise<string> {
  return callDeepSeek(
    [
      {
        role: 'system',
        content: `You are a senior business intelligence researcher for Fazmi Group Sdn Bhd / FG Inspection, a Malaysian NDT engineering company operating in O&G, construction, and infrastructure sectors.

When given a research topic, provide a comprehensive structured report covering:
1. Market overview and current state in Malaysia
2. Key players and competitors
3. Opportunities for Fazmi Group / FG Inspection
4. Relevant government projects, tenders, or contracts
5. Recommended next actions

Format as clean markdown. Use headers, bullet points, and bold text for key points.
Write in English. Be specific to the Malaysian market context. Max 800 words.`,
      },
      {
        role: 'user',
        content: `Research topic: ${topic}`,
      },
    ],
    { temperature: 0.3, max_tokens: 1500 }
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
