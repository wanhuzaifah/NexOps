# NexOps — FG Inspection Operations Platform

AI-Powered Operations & Business Intelligence Platform for **Fazmi Group Sdn Bhd** (FG Inspection)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Variables

Copy `.env.local` and fill in your actual values:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DEEPSEEK_API_KEY=sk-your-deepseek-key
RESEND_API_KEY=re_your-resend-key
TELEGRAM_BOT_TOKEN=your-bot-token
TELEGRAM_ALLOWED_CHAT_IDS=your_chat_id
```

### 3. Supabase Setup

1. Create new project at [supabase.com](https://supabase.com)
2. Go to SQL Editor
3. Run the complete schema: **`supabase_schema.sql`**
4. Create Storage buckets:
   - `company-assets` (Public)
   - `documents` (Private)
   - `ndt-reports` (Private)
   - `invoices` (Private)
   - `calibration-certs` (Private)

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📦 Tech Stack (LOCKED — DO NOT CHANGE)

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) + TypeScript |
| UI | shadcn/ui + Tailwind CSS |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| PDF Stamp | pdf-lib (client-side) |
| PDF Generate | @react-pdf/renderer |
| Email | Resend |
| Deploy | Vercel |
| Automation | n8n (self-hosted, Hostinger VPS) |
| AI (ALL agents) | **DeepSeek V4 Flash** — `deepseek-chat` |

**LLM is LOCKED to DeepSeek V4 Flash. Do not change.**

---

## 🗂️ Project Structure

```
src/
├── app/
│   ├── (auth)/login, register
│   ├── (dashboard)/
│   │   ├── page.tsx              ← Main dashboard
│   │   ├── invoices/             ← Invoice management
│   │   ├── quotations/           ← Quotations
│   │   ├── reports/              ← NDT Reports (9 methods)
│   │   ├── documents/sign/       ← Auto-sign with cop+signature
│   │   ├── timesheets/           ← Manpower timesheets
│   │   ├── clients/              ← Client database
│   │   ├── emails/               ← Email tracker
│   │   ├── equipment/            ← Equipment + calibration
│   │   ├── personnel/            ← Technicians + certs
│   │   ├── tenders/              ← Tender scout (auto-scrape)
│   │   ├── market/               ← Market intelligence
│   │   └── settings/             ← Company settings + assets
│   └── api/
│       ├── ai/route.ts           ← DeepSeek V4 Flash (all agents)
│       ├── email/route.ts        ← Resend emails
│       └── tender/route.ts       ← Tender scraping
├── components/
├── lib/
│   ├── ai/deepseek.ts            ← All 5 AI agents (DeepSeek V4 Flash)
│   ├── pdf/stamper.ts            ← PDF cop+signature stamping
│   ├── email/resend.ts           ← Email templates
│   └── supabase/                 ← DB clients
└── types/index.ts                ← All TypeScript types
```

---

## 🤖 AI Agents (All DeepSeek V4 Flash)

| Agent | Function | Trigger |
|---|---|---|
| Commander | Route Telegram commands | Any message |
| Finance | AR, invoices, payments | `/ar`, `/inv`, `/paid` |
| Tender Scout | Scrape + score tenders | Cron every 6h |
| Market Intel | News + opportunities | Cron 7am daily |
| Ops Manager | Daily briefing | Cron 8:30am daily |
| Document | PDF signing queue | `/sign_pending` |

---

## 📄 NDT Report Types

| Method | Standard | Report Prefix |
|---|---|---|
| RT (Radiography) | ASME V Art.2, API 1104 | FG-RT |
| UT (Ultrasonic) | ASME V Art.4, AWS D1.1 | FG-UT |
| MPI (Magnetic Particle) | ASME V Art.7, ASTM E709 | FG-MPI |
| DPI (Dye Penetrant) | ASME V Art.6, ASTM E165 | FG-DPI |
| PMI (Material ID) | ASTM A751 | FG-PMI |
| HT (Hardness) | ASME IX, ASTM E110 | FG-HT |
| PAUT (Phased Array) | ASME V Art.4, ASTM E2700 | FG-PAUT |
| UTTG (Thickness) | Company Procedure | FG-UTTG |
| WQT (Welding Qual) | ASME IX, AWS D1.1 | FG-WQT |

---

## 🌐 Telegram Commands

```
/ar                    → AR summary
/ar_overdue            → Overdue invoices only
/brief                 → Daily ops briefing
/tenders               → Latest tenders
/inv [client] [amount] → Create invoice
/paid [inv_no] [amount]→ Mark as paid
/reminder [client]     → Send payment reminder
/sign_pending          → Sign pending documents
/reports_unsigned      → List unsigned reports
/market                → Market intel digest
/technicians           → Technician status
/certs_expiry          → Certs expiring soon
```

---

## 💰 Monthly Cost

| Item | Cost |
|---|---|
| Vercel (deploy) | FREE |
| Supabase (DB+Storage) | FREE |
| n8n (Hostinger VPS) | ~RM20 |
| DeepSeek V4 Flash | ~RM1 |
| Resend (email) | FREE |
| Telegram Bot | FREE |
| **Total** | **~RM21/bulan** |

---

## 🏢 Company (Pre-loaded)

- **Fazmi Group Sdn Bhd** — 202501005174 (1606588-X)
- **FG Inspection** — TR0242378-W
- Director: Nor Fazmi Hazwan bin Rozikin
- CIDB: G2 B04, G2 CE21
- Bank: Bank Islam Malaysia Berhad
- Contact: +6011-2690 7066 | fazmigroup@gmail.com

---

## 📝 License

Private — Fazmi Group Sdn Bhd. All rights reserved.
