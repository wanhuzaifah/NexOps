// ============================================================
// NexOps — TypeScript Types (AI Platform Edition)
// Fazmi Group Sdn Bhd / FG Inspection
// ============================================================

export type UserRole = 'admin' | 'manager' | 'viewer'
export type TenderStatus = 'new' | 'saved' | 'ignored' | 'applied'
export type DigestType = 'digest' | 'research'
export type DigestScope = 'malaysia' | 'global' | 'custom'

// ── Company ──────────────────────────────────────────────────

export interface Company {
  id: string
  name: string
  ssm_no: string | null
  cidb_no: string | null
  brand_name: string | null
  brand_reg: string | null
  address: string | null
  phone: string | null
  phone2: string | null
  email: string | null
  website: string | null
  bank_name: string | null
  director_name: string | null
  director_title: string | null
  logo_url: string | null
  boss_email: string | null
  telegram_chat_ids: string[]
  settings: CompanySettings
  created_at: string
}

export interface CompanySettings {
  tender_min_score: number    // min score to notify via Telegram (default 60)
  market_digest_time: string  // e.g. "07:00" — daily auto-digest time
  cert_reminder_days?: number
  invoice_due_days?: number
  sst_rate?: number
}

export interface Profile {
  id: string
  company_id: string | null
  full_name: string | null
  role: UserRole
  created_at: string
}

// ── Tender Scout ─────────────────────────────────────────────

export interface TenderCache {
  id: string
  company_id: string | null
  source: string
  source_url: string | null
  tender_id_external: string | null
  title: string | null
  agency: string | null
  estimated_value: string | null
  closing_date: string | null
  tender_type: string | null
  location: string | null
  relevance_score: number | null
  match_reasons: string[]
  raw_content: string | null
  status: TenderStatus
  tender_posted_at: string | null
  scraped_at: string
  notified_at: string | null
}

// ── Market Intel ─────────────────────────────────────────────

export interface MarketDigest {
  id: string
  company_id: string | null
  content: string
  sources: string[]
  scope: DigestScope
  topic: string | null
  type: DigestType
  created_at: string
}

export interface ResearchHistory {
  id: string
  company_id: string | null
  topic: string
  result: string
  created_at: string
}

// ── AI / DeepSeek ────────────────────────────────────────────

export interface DeepSeekMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

// ── Dashboard ────────────────────────────────────────────────

export interface DashboardStats {
  tenders_today: number
  tenders_high_match: number
  tenders_saved: number
  tenders_applied: number
  tenders_closing_this_week: number
  latest_digest: MarketDigest | null
  last_scan: string | null
}

// ── Tender Scoring Keywords ──────────────────────────────────

export const TENDER_KEYWORDS = {
  HIGH: ['NDT', 'non-destructive testing', 'radiography', 'ultrasonic', 'inspection services', 'PAUT', 'TOFD', 'thickness survey'],
  MEDIUM: ['steel fabrication', 'structural steel', 'pipeline', 'piping inspection', 'welding', 'G2', 'manpower supply', 'technician supply'],
  LOW: ['construction', 'maintenance', 'engineering service', 'industrial'],
  LOCATION_BONUS: ['Kelantan', 'Kota Bharu', 'East Coast', 'Pantai Timur'],
  DISQUALIFY: ['cleaning services', 'catering', 'landscaping', 'security guard', 'printing', 'ICT software', 'food'],
} as const

export const EXISTING_CLIENTS = [
  'Petronas Chemicals Group',
  'PETRONAS Gas Berhad',
  'MRT Corporation',
  'Malaysia Rail Link (MRLB)',
  'Preserver Engineering Sdn Bhd',
  'Samsung C&T',
  'Intel',
  'KLCC Property Holdings Berhad',
  'Air Selangor',
  'VME Companies Ltd',
  'MHE-Jebsen & Jessen',
  'NOV (National Oilwell Varco)',
  'WCE Sdn Bhd',
  'CCCC (China Communications Construction Co)',
  'Sunway',
  'Caltex',
  'LRT3',
  'Widad Group Berhad',
  'Pembinaan Tetap Teguh Sdn Bhd',
] as const
