-- ============================================================
-- NexOps — Supabase Schema
-- Fazmi Group Sdn Bhd / FG Inspection
-- Single-tenant, admin-only private app
-- ============================================================
-- Run this in Supabase SQL Editor (Project > SQL Editor > New Query)
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- COMPANIES (single row for Fazmi Group)
-- ============================================================
CREATE TABLE IF NOT EXISTS companies (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name              TEXT NOT NULL DEFAULT 'FAZMI GROUP SDN BHD',
  ssm_no            TEXT DEFAULT '202501005174 (1606588-X)',
  cidb_no           TEXT DEFAULT 'G2 B04, G2 CE21',
  brand_name        TEXT DEFAULT 'FG INSPECTION',
  brand_reg         TEXT DEFAULT 'TR0242378-W',
  address           TEXT DEFAULT 'Suite 33-01, 33rd Floor, Menara Keck Seng, 203 Jalan Bukit Bintang, 55100 WP Kuala Lumpur',
  phone             TEXT DEFAULT '+6011-2690 7066',
  phone2            TEXT DEFAULT '+603-2116 9727',
  email             TEXT DEFAULT 'fazmigroup@gmail.com',
  website           TEXT DEFAULT 'www.fginspections.com',
  bank_name         TEXT DEFAULT 'Bank Islam Malaysia Berhad',
  bank_account      TEXT,
  bank_holder       TEXT DEFAULT 'FAZMI GROUP SDN BHD',
  director_name     TEXT DEFAULT 'Nor Fazmi Hazwan bin Rozikin',
  director_title    TEXT DEFAULT 'Managing Director',
  logo_url          TEXT,
  cop_url           TEXT,
  signature_url     TEXT,
  letterhead_url    TEXT,
  stamp_positions   JSONB DEFAULT '{}',
  boss_email        TEXT DEFAULT 'fazmigroup@gmail.com',
  telegram_chat_ids TEXT[] DEFAULT '{}',
  settings          JSONB DEFAULT '{"cert_reminder_days":30,"invoice_due_days":30,"sst_rate":6,"tender_min_score":60}',
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PROFILES (single admin user)
-- ============================================================
CREATE TABLE IF NOT EXISTS profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id  UUID REFERENCES companies(id) ON DELETE SET NULL,
  full_name   TEXT DEFAULT 'Wan',
  role        TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'manager', 'viewer')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- CLIENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS clients (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  pic_name    TEXT,
  email       TEXT,
  phone       TEXT,
  address     TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- DOCUMENTS (for auto-sign queue)
-- ============================================================
CREATE TABLE IF NOT EXISTS documents (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  type         TEXT DEFAULT 'other' CHECK (type IN ('report','timesheet','work_order','delivery_order','other')),
  title        TEXT,
  status       TEXT DEFAULT 'unsigned' CHECK (status IN ('unsigned','signed','sent','archived')),
  original_url TEXT,
  signed_url   TEXT,
  notes        TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  signed_at    TIMESTAMPTZ,
  sent_at      TIMESTAMPTZ
);

-- ============================================================
-- NDT REPORTS
-- ============================================================
CREATE TABLE IF NOT EXISTS ndt_reports (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id             UUID REFERENCES clients(id) ON DELETE SET NULL,
  method                TEXT NOT NULL CHECK (method IN ('RT','UT','MPI','DPI','PMI','HT','PAUT','UTTG','WQT')),
  report_no             TEXT UNIQUE,
  project_name          TEXT,
  project_no            TEXT,
  po_no                 TEXT,
  location              TEXT,
  date_of_inspection    DATE NOT NULL DEFAULT CURRENT_DATE,
  procedure_no          TEXT,
  drawing_no            TEXT,
  material              TEXT,
  material_grade        TEXT,
  material_thickness    NUMERIC,
  weld_process          TEXT,
  joint_type            TEXT,
  surface_condition     TEXT,
  surface_temp          NUMERIC,
  method_data           JSONB DEFAULT '{}',
  findings              JSONB DEFAULT '[]',
  overall_result        TEXT CHECK (overall_result IN ('ACCEPT','REJECT','CONDITIONAL')),
  remarks               TEXT,
  inspector_name        TEXT,
  inspector_cert_type   TEXT,
  inspector_cert_no     TEXT,
  inspector_cert_level  TEXT,
  inspector_cert_expiry DATE,
  status                TEXT DEFAULT 'unsigned' CHECK (status IN ('unsigned','signed','sent','archived')),
  original_url          TEXT,
  signed_url            TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW(),
  signed_at             TIMESTAMPTZ
);

-- ============================================================
-- INVOICES
-- ============================================================
CREATE TABLE IF NOT EXISTS invoices (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id    UUID REFERENCES clients(id) ON DELETE SET NULL,
  inv_number   TEXT UNIQUE,
  issue_date   DATE NOT NULL DEFAULT CURRENT_DATE,
  due_date     DATE,
  status       TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','paid','overdue','partial')),
  subtotal     NUMERIC(12,2) DEFAULT 0,
  tax_rate     NUMERIC(5,2) DEFAULT 6,
  tax_amount   NUMERIC(12,2) DEFAULT 0,
  total        NUMERIC(12,2) DEFAULT 0,
  amount_paid  NUMERIC(12,2) DEFAULT 0,
  balance      NUMERIC(12,2) DEFAULT 0,
  notes        TEXT,
  pdf_url      TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  sent_at      TIMESTAMPTZ,
  paid_at      TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS invoice_items (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id  UUID REFERENCES invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  qty         NUMERIC(10,2) DEFAULT 1,
  unit_price  NUMERIC(12,2) DEFAULT 0,
  amount      NUMERIC(12,2) DEFAULT 0,
  sort_order  INTEGER DEFAULT 0
);

-- ============================================================
-- QUOTATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS quotations (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id               UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id                UUID REFERENCES clients(id) ON DELETE SET NULL,
  quo_number               TEXT UNIQUE,
  issue_date               DATE NOT NULL DEFAULT CURRENT_DATE,
  valid_until              DATE,
  status                   TEXT DEFAULT 'draft' CHECK (status IN ('draft','sent','accepted','rejected','expired')),
  subtotal                 NUMERIC(12,2) DEFAULT 0,
  tax_rate                 NUMERIC(5,2) DEFAULT 6,
  tax_amount               NUMERIC(12,2) DEFAULT 0,
  total                    NUMERIC(12,2) DEFAULT 0,
  notes                    TEXT,
  pdf_url                  TEXT,
  converted_to_invoice_id  UUID REFERENCES invoices(id) ON DELETE SET NULL,
  created_at               TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS quotation_items (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quotation_id  UUID REFERENCES quotations(id) ON DELETE CASCADE,
  description   TEXT NOT NULL,
  qty           NUMERIC(10,2) DEFAULT 1,
  unit_price    NUMERIC(12,2) DEFAULT 0,
  amount        NUMERIC(12,2) DEFAULT 0,
  sort_order    INTEGER DEFAULT 0
);

-- ============================================================
-- PAYMENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS payments (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id    UUID REFERENCES invoices(id) ON DELETE CASCADE,
  amount        NUMERIC(12,2) NOT NULL,
  payment_date  DATE NOT NULL DEFAULT CURRENT_DATE,
  method        TEXT,
  reference     TEXT,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- PERSONNEL
-- ============================================================
CREATE TABLE IF NOT EXISTS personnel (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id   UUID REFERENCES companies(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  ic_no        TEXT,
  position     TEXT,
  cert_type    TEXT CHECK (cert_type IN ('PCN','CSWIP','ASNT SNT-TC-1A','DOSH','CIDB','Other')),
  cert_no      TEXT,
  cert_level   TEXT CHECK (cert_level IN ('Level I','Level II','Level III')),
  cert_expiry  DATE,
  daily_rate   NUMERIC(10,2),
  status       TEXT DEFAULT 'available' CHECK (status IN ('available','deployed','leave')),
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TIMESHEETS
-- ============================================================
CREATE TABLE IF NOT EXISTS timesheets (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id           UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id            UUID REFERENCES clients(id) ON DELETE SET NULL,
  personnel_id         UUID REFERENCES personnel(id) ON DELETE SET NULL,
  project_name         TEXT,
  project_location     TEXT,
  month_year           TEXT NOT NULL,
  entries              JSONB DEFAULT '[]',
  total_normal_hours   NUMERIC(8,2) DEFAULT 0,
  total_ot_hours       NUMERIC(8,2) DEFAULT 0,
  daily_rate           NUMERIC(10,2) DEFAULT 0,
  ot_rate_multiplier   NUMERIC(4,2) DEFAULT 1.5,
  total_amount         NUMERIC(12,2) DEFAULT 0,
  status               TEXT DEFAULT 'unsigned' CHECK (status IN ('unsigned','signed','sent','archived')),
  signed_url           TEXT,
  ts_number            TEXT UNIQUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EQUIPMENT
-- ============================================================
CREATE TABLE IF NOT EXISTS equipment (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id            UUID REFERENCES companies(id) ON DELETE CASCADE,
  name                  TEXT NOT NULL,
  type                  TEXT DEFAULT 'NDT' CHECK (type IN ('NDT','Welding','Painting','Safety','Other')),
  serial_no             TEXT,
  calibration_date      DATE,
  calibration_due       DATE,
  calibration_cert_url  TEXT,
  status                TEXT DEFAULT 'available' CHECK (status IN ('available','deployed','calibration_due','out_of_service')),
  assigned_to_project   TEXT,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- EMAIL THREADS (CRM)
-- ============================================================
CREATE TABLE IF NOT EXISTS email_threads (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id     UUID REFERENCES companies(id) ON DELETE CASCADE,
  client_id      UUID REFERENCES clients(id) ON DELETE SET NULL,
  subject        TEXT,
  status         TEXT DEFAULT 'pending' CHECK (status IN ('pending','replied','overdue')),
  last_sent_at   TIMESTAMPTZ,
  last_reply_at  TIMESTAMPTZ,
  notes          TEXT,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- TENDER CACHE
-- ============================================================
CREATE TABLE IF NOT EXISTS tender_cache (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id          UUID REFERENCES companies(id) ON DELETE CASCADE,
  source              TEXT NOT NULL,
  source_url          TEXT,
  tender_id_external  TEXT,
  title               TEXT,
  agency              TEXT,
  estimated_value     TEXT,
  closing_date        DATE,
  tender_type         TEXT,
  location            TEXT,
  relevance_score     INTEGER DEFAULT 0,
  match_reasons       TEXT[] DEFAULT '{}',
  raw_content         TEXT,
  status              TEXT DEFAULT 'new' CHECK (status IN ('new','saved','ignored','applied')),
  tender_posted_at    TIMESTAMPTZ,
  scraped_at          TIMESTAMPTZ DEFAULT NOW(),
  notified_at         TIMESTAMPTZ
);

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_invoices_company    ON invoices(company_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status     ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date   ON invoices(due_date);
CREATE INDEX IF NOT EXISTS idx_ndt_reports_company ON ndt_reports(company_id);
CREATE INDEX IF NOT EXISTS idx_ndt_reports_method  ON ndt_reports(method);
CREATE INDEX IF NOT EXISTS idx_personnel_company   ON personnel(company_id);
CREATE INDEX IF NOT EXISTS idx_personnel_status    ON personnel(status);
CREATE INDEX IF NOT EXISTS idx_equipment_company   ON equipment(company_id);
CREATE INDEX IF NOT EXISTS idx_tender_cache_score  ON tender_cache(relevance_score DESC);
CREATE INDEX IF NOT EXISTS idx_tender_cache_scraped ON tender_cache(scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_threads_status ON email_threads(status);

-- ============================================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE companies      ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients        ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents      ENABLE ROW LEVEL SECURITY;
ALTER TABLE ndt_reports    ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices       ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_items  ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotations     ENABLE ROW LEVEL SECURITY;
ALTER TABLE quotation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments       ENABLE ROW LEVEL SECURITY;
ALTER TABLE personnel      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timesheets     ENABLE ROW LEVEL SECURITY;
ALTER TABLE equipment      ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_threads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE tender_cache   ENABLE ROW LEVEL SECURITY;

-- Helper function: get company_id of current user
CREATE OR REPLACE FUNCTION get_my_company_id()
RETURNS UUID AS $$
  SELECT company_id FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- RLS Policies: users can only access their own company's data
CREATE POLICY "company_isolation" ON companies
  FOR ALL USING (id = get_my_company_id());

CREATE POLICY "profile_own" ON profiles
  FOR ALL USING (id = auth.uid());

CREATE POLICY "company_clients" ON clients
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_documents" ON documents
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_ndt_reports" ON ndt_reports
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_invoices" ON invoices
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_invoice_items" ON invoice_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE company_id = get_my_company_id())
  );

CREATE POLICY "company_quotations" ON quotations
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_quotation_items" ON quotation_items
  FOR ALL USING (
    quotation_id IN (SELECT id FROM quotations WHERE company_id = get_my_company_id())
  );

CREATE POLICY "company_payments" ON payments
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE company_id = get_my_company_id())
  );

CREATE POLICY "company_personnel" ON personnel
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_timesheets" ON timesheets
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_equipment" ON equipment
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_email_threads" ON email_threads
  FOR ALL USING (company_id = get_my_company_id());

CREATE POLICY "company_tender_cache" ON tender_cache
  FOR ALL USING (company_id = get_my_company_id());

-- ============================================================
-- SEQUENCE FUNCTIONS (auto-increment document numbers)
-- ============================================================

CREATE OR REPLACE FUNCTION get_next_invoice_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM invoices
  WHERE company_id = p_company_id
    AND TO_CHAR(created_at, 'YYYY') = v_year;
  RETURN 'FG-INV-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_next_quotation_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM quotations
  WHERE company_id = p_company_id
    AND TO_CHAR(created_at, 'YYYY') = v_year;
  RETURN 'FG-QUO-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_next_report_number(p_company_id UUID, p_method TEXT)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM ndt_reports
  WHERE company_id = p_company_id
    AND method = p_method
    AND TO_CHAR(created_at, 'YYYY') = v_year;
  RETURN 'FG-' || p_method || '-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_next_timesheet_number(p_company_id UUID)
RETURNS TEXT AS $$
DECLARE
  v_year TEXT := TO_CHAR(NOW(), 'YYYY');
  v_seq  INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO v_seq
  FROM timesheets
  WHERE company_id = p_company_id
    AND TO_CHAR(created_at, 'YYYY') = v_year;
  RETURN 'FG-TS-' || v_year || '-' || LPAD(v_seq::TEXT, 3, '0');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- STORAGE BUCKETS (run in Supabase Dashboard > Storage)
-- ============================================================
-- Create these buckets manually in the Supabase Dashboard:
--   1. "documents"  — for original and signed PDFs
--   2. "reports"    — for NDT report PDFs
--   3. "timesheets" — for timesheet PDFs
--   4. "settings"   — for logo, cop, signature, letterhead

-- ============================================================
-- SEED DATA — Pre-load Fazmi Group company record
-- ============================================================
-- Run this AFTER creating your first auth user via Supabase Dashboard
-- Replace 'YOUR_USER_UUID' with the actual UUID from auth.users

-- Step 1: Insert company
INSERT INTO companies (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'FAZMI GROUP SDN BHD')
ON CONFLICT (id) DO NOTHING;

-- Step 2: After signing up your admin user, link their profile:
-- UPDATE profiles SET company_id = '00000000-0000-0000-0000-000000000001', full_name = 'Wan', role = 'admin'
-- WHERE id = 'YOUR_USER_UUID';

-- Step 3: Seed existing clients
-- (Run after inserting company)
INSERT INTO clients (company_id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'Petronas Chemicals Group'),
  ('00000000-0000-0000-0000-000000000001', 'PETRONAS Gas Berhad'),
  ('00000000-0000-0000-0000-000000000001', 'MRT Corporation'),
  ('00000000-0000-0000-0000-000000000001', 'Malaysia Rail Link (MRLB)'),
  ('00000000-0000-0000-0000-000000000001', 'Preserver Engineering Sdn Bhd'),
  ('00000000-0000-0000-0000-000000000001', 'Samsung C&T'),
  ('00000000-0000-0000-0000-000000000001', 'Intel'),
  ('00000000-0000-0000-0000-000000000001', 'KLCC Property Holdings Berhad'),
  ('00000000-0000-0000-0000-000000000001', 'Air Selangor'),
  ('00000000-0000-0000-0000-000000000001', 'VME Companies Ltd'),
  ('00000000-0000-0000-0000-000000000001', 'MHE-Jebsen & Jessen'),
  ('00000000-0000-0000-0000-000000000001', 'NOV (National Oilwell Varco)'),
  ('00000000-0000-0000-0000-000000000001', 'WCE Sdn Bhd'),
  ('00000000-0000-0000-0000-000000000001', 'CCCC (China Communications Construction Co)'),
  ('00000000-0000-0000-0000-000000000001', 'Sunway'),
  ('00000000-0000-0000-0000-000000000001', 'Caltex'),
  ('00000000-0000-0000-0000-000000000001', 'LRT3'),
  ('00000000-0000-0000-0000-000000000001', 'Widad Group Berhad'),
  ('00000000-0000-0000-0000-000000000001', 'Pembinaan Tetap Teguh Sdn Bhd')
ON CONFLICT DO NOTHING;

-- ============================================================
-- MARKET DIGESTS (AI-generated daily market intelligence)
-- ============================================================
CREATE TABLE IF NOT EXISTS market_digests (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  sources     TEXT[] DEFAULT '{}',
  scope       TEXT DEFAULT 'malaysia' CHECK (scope IN ('malaysia','global','custom')),
  topic       TEXT,
  type        TEXT DEFAULT 'digest' CHECK (type IN ('digest','research')),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_market_digests_company ON market_digests(company_id);
CREATE INDEX IF NOT EXISTS idx_market_digests_created ON market_digests(created_at DESC);

ALTER TABLE market_digests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_market_digests" ON market_digests
  FOR ALL USING (company_id = get_my_company_id());

-- ============================================================
-- RESEARCH HISTORY (on-demand AI research)
-- ============================================================
CREATE TABLE IF NOT EXISTS research_history (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company_id  UUID REFERENCES companies(id) ON DELETE CASCADE,
  topic       TEXT NOT NULL,
  result      TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_research_history_company ON research_history(company_id);
CREATE INDEX IF NOT EXISTS idx_research_history_created ON research_history(created_at DESC);

ALTER TABLE research_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "company_research_history" ON research_history
  FOR ALL USING (company_id = get_my_company_id());
