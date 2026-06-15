# NexOps

## Project Description
NexOps — AI-Powered Operations & Business Intelligence Platform 
for Fazmi Group Sdn Bhd (FG Inspection)

COMPANY CONTEXT:
Fazmi Group Sdn Bhd (202501005174 / 1606588-X) is a 100% 
Bumiputera-owned Malaysian engineering company operating under 
the brand "FG Inspection" (TR0242378-W). Core services include 
Non-Destructive Testing (NDT), industrial manpower supply, steel 
fabrication, pipeline installation, and equipment supply for 
Oil & Gas, Construction, Petrochemical, and Infrastructure 
sectors. Major completed projects include ECRL (STN01–STN08), 
MRT, KLCC, Petronas, Intel, Samsung C&T, and Air Selangor. 
Director: Nor Fazmi Hazwan bin Rozikin. CIDB Grade G2 registered 
(B04, CE21). Collaboration with SIRIM Berhad for Mechanical 
Testing Lab.

PROJECT OVERVIEW:
NexOps is a full-stack, serverless, multi-tenant SaaS web 
application that serves as the complete operations command 
center for Fazmi Group and eventually other NDT/engineering 
companies in Malaysia. The system is controlled entirely via 
Telegram bot commands and a web dashboard. It replaces all 
manual admin workflows — from document signing to invoice 
generation, tender scouting to market intelligence — into one 
unified AI-powered platform.

TECH STACK (LOCKED — DO NOT CHANGE):
- Framework: Next.js 14 App Router + TypeScript
- UI: shadcn/ui + Tailwind CSS
- Auth + Database + Storage: Supabase (PostgreSQL + RLS)
- PDF Stamping: pdf-lib (client-side, zero server)
- PDF Generation: @react-pdf/renderer
- Word Templates: docxtemplater
- Email: Resend.com
- Deployment: Vercel (serverless)
- Automation: n8n (self-hosted on Hostinger VPS)
- Telegram: Telegram Bot API
- AI/LLM: DeepSeek V4 Flash ONLY 
  (model: deepseek-chat, endpoint: api.deepseek.com/v1)
  ALL agents use DeepSeek V4 Flash — no other LLM providers
- Web Scraping: Playwright (Tier 2) + simple fetch (Tier 1)

MULTI-TENANT ARCHITECTURE:
Every table has company_id. Row Level Security (RLS) enforced 
via Supabase. Each NDT company = separate tenant. 
User roles: admin | manager | viewer.

CORE MODULES:

1. DOCUMENT AUTO-SIGN MODULE
   Company cop (circular blue stamp) and director signature 
   (PNG transparent) are pre-uploaded in settings. System uses 
   pdf-lib client-side to stamp cop + signature onto any 
   uploaded PDF at saved coordinate positions. Supports 
   document types: NDT reports, timesheets, work orders, 
   delivery orders. Template positions saved per document type 
   for one-click future signing. Signed PDFs stored in 
   Supabase Storage.

2. NDT REPORT GENERATOR (9 report types — CRITICAL MODULE)
   Each NDT method has completely different data fields, 
   standards, and acceptance criteria. System must handle all:
   
   - RT (Radiography Testing): ASME V Art.2, API 1104
     Fields: Source (Ir-192/Se-75), film brand, IQI type, 
     SFD, exposure time, film density (2.0-4.0), technique 
     (SWSI/DWSI/DWDI), findings table with weld/location/film 
     no/indication/accept-reject
   
   - UT (Ultrasonic Testing): ASME V Art.4, AWS D1.1  
     Fields: Equipment model (Olympus), probe frequency, probe 
     angle (45/60/70°), calibration block (IIW/V2), scanning 
     level dB, indication table with depth/length/amplitude
   
   - MPI (Magnetic Particle): ASME V Art.7, ASTM E709
     Fields: Technique (wet fluorescent), current type 
     (AC/DC/HWDC), yoke lifting power, UV intensity, 
     field indicator, indication direction/length table
   
   - DPI (Dye Penetrant): ASME V Art.6, ASTM E165
     Fields: Penetrant type (I/II), dwell times (penetrant 
     ≥10min, developer ≥7min), developer type, light intensity
   
   - PMI (Positive Material Identification): ASTM A751
     Fields: XRF equipment (Olympus Vanta), material grade 
     required, element composition table (C/Mn/Si/Cr/Ni/Mo%)
   
   - HT (Hardness Testing): ASME IX, ASTM E110
     Fields: Scale (HV/HB/HRC), acceptance criteria (≤248HV), 
     readings at BM/HAZ/WM per joint
   
   - PAUT (Phased Array UT): ASME V Art.4, ASTM E2700
     Fields: Equipment (Olympus OmniScan), probe type 
     (5L64-A12), wedge type, angular range (40-70°), 
     focal law, encoder used
   
   - UTTG (Ultrasonic Thickness Gauge): Company procedure
     Fields: Equipment (Olympus 38DL), probe, nominal vs 
     actual thickness survey table per measurement point
   
   - WQT (Welding Qualification Test): ASME IX, AWS D1.1
   
   Report numbering: FG-[METHOD]-[YEAR]-[SEQ]
   Examples: FG-RT-2026-001, FG-UT-2026-001
   
   PDF output: FG Inspection letterhead, company logo, 
   all relevant fields, findings table, inspector cert details, 
   director signature + Fazmi Group Sdn Bhd cop on last page.
   Director: Nor Fazmi Hazwan bin Rozikin, Managing Director.

3. INVOICE + QUOTATION GENERATOR
   Auto-generate invoice number: FG-INV-[YEAR]-[SEQ]
   Auto-generate quotation number: FG-QUO-[YEAR]-[SEQ]
   Fields: Client selection (dropdown), line items 
   (description/qty/unit price/amount), SST 6%, total in RM.
   AI feature: User types scope of work in plain text → 
   DeepSeek V4 Flash generates professional NDT line items.
   PDF includes: FG Inspection letterhead, Bank Islam Malaysia 
   Berhad bank details, cop + signature.
   One-click email to client via Resend.
   
   NDT rate card pre-loaded:
   RT: RM45/shot, UT weld: RM35/joint, MPI: RM25/joint,
   DPI: RM20/joint, PAUT: RM120/joint, UTTG: RM10/point
   Manpower: UT Tech Lv2 RM400/day, Safety Officer RM280/day,
   Welder RM250/day, General Worker RM120/day

4. AR/AP PAYMENT TRACKER DASHBOARD
   Real-time view: Total outstanding, overdue (>30 days), 
   due this month, paid this month — all in RM.
   Invoice status: draft | sent | paid | overdue | partial.
   Auto weekly summary email to boss every Monday 8:30am 
   via Supabase Edge Function + Resend.
   Summary formatted by DeepSeek V4 Flash.

5. CRM + EMAIL STATUS TRACKER
   Track email threads per client: pending | replied | overdue.
   Alert if no reply within 48 hours → Telegram notification.
   Manual input initially, Gmail API integration later.

6. MANPOWER + TIMESHEET MODULE
   Personnel database: name, IC, position, certification type 
   (PCN/CSWIP/ASNT SNT-TC-1A), cert level (I/II/III), 
   cert number, cert expiry date, daily rate.
   Timesheet: date/time-in/time-out/normal hours/OT hours.
   Timesheet PDF with cop + signature.
   Timesheet numbering: FG-TS-[YEAR]-[SEQ]
   Auto-alert for technician cert expiry approaching.

7. EQUIPMENT TRACKING
   NDT/Welding/Painting equipment database.
   Track calibration dates and expiry.
   Alert when calibration due.

8. TELEGRAM COMMAND CENTER (5 AI AGENTS via n8n)
   ALL agents use DeepSeek V4 Flash exclusively.
   
   COMMANDER AGENT: Classifies user intent, routes to 
   correct agent. Returns: FINANCE|TENDER|MARKET|OPS|DOCUMENT.
   
   FINANCE AGENT: Handles AR queries, invoice creation, 
   payment tracking, quotation. Commands: /ar, /ar_overdue, 
   /inv [client] [amount] [scope], /paid [inv_no] [amount], 
   /reminder [client], /quo [client] [scope]
   
   TENDER SCOUT AGENT: Scrapes Malaysian government tender 
   portals every 6 hours. Sources: JKR (tender.jkr.gov.my) 
   via simple HTTP fetch, MyProcurement 
   (myprocurement.treasury.gov.my) via simple HTTP fetch, 
   CIDB (cidb.gov.my) via Playwright headless browser, 
   TenderDirect via Playwright, GlobalTenders.com via HTTP.
   Scores tenders 0-100 for Fazmi Group relevance.
   Keywords: NDT, non-destructive testing, radiography, 
   ultrasonic, inspection services, steel fabrication, 
   structural steel, G2, manpower supply, PAUT, TOFD, 
   piping inspection, Kelantan (location bonus +20pts).
   Sends Telegram alert for new tenders scoring >60.
   Commands: /tenders, /tenders_today, /tender_save [id]
   
   MARKET INTEL AGENT: Daily digest at 7am. Monitors 
   Malaysian construction/O&G news, MIDA investments, 
   PETRONAS projects, JKR budget allocation, UAE/Middle East 
   O&G opportunities. Commands: /market, /market_malaysia, 
   /market_global
   
   OPS MANAGER AGENT: Daily briefing at 8:30am. Shows 
   pending unsigned docs, overdue invoices, unread emails, 
   technician deployment status, upcoming deadlines, 
   cert expiry alerts. Auto-morning brief without command.
   Commands: /brief, /technicians, /certs_expiry
   
   DOCUMENT AGENT: Handles PDF signing queue and report 
   generation. Commands: /sign_pending, /reports_unsigned, 
   /report_new [method]
   
   Security: All commands check whitelist of allowed 
   Telegram chat IDs before processing.

9. SETTINGS MODULE
   Upload: company logo, cop PNG (transparent), 
   director signature PNG (transparent), letterhead PDF/PNG.
   Company info: SSM no, CIDB no, bank details.
   Stamp position templates per document type.
   Boss email for weekly summaries.
   Telegram chat ID whitelist.
   Cert renewal reminder settings.

COMPANY DATA (Pre-loaded):
Name: FAZMI GROUP SDN BHD
Reg: 202501005174 (1606588-X)  
FG Inspection Reg: TR0242378-W
Address: Suite 33-01, 33rd Floor, Menara Keck Seng,
         203 Jalan Bukit Bintang, 55100 WP Kuala Lumpur
Phone: +6011-2690 7066
Email: fazmigroup@gmail.com
Website: www.fginspections.com
Bank: Bank Islam Malaysia Berhad
Director: Nor Fazmi Hazwan bin Rozikin
CIDB PPPK: G2 B04, G2 CE21
CIDB SPKK: G2 B (Pembinaan Bangunan), G2 CE (Kejuruteraan Awam)
SCORE: 2-Star (SD090143)
SIRIM collaboration: Mechanical Testing Lab

EXISTING CLIENTS (for autocomplete):
Petronas Chemicals Group, PETRONAS Gas Berhad,
MRT Corporation, Malaysia Rail Link (MRLB),
Preserver Engineering Sdn Bhd, Samsung C&T,
Intel, KLCC Property Holdings Berhad, Air Selangor,
VME Companies Ltd, MHE-Jebsen & Jessen,
NOV (National Oilwell Varco), WCE Sdn Bhd,
CCCC (China Communications Construction Co),
Sunway, Caltex, LRT3, Widad Group Berhad,
Pembinaan Tetap Teguh Sdn Bhd

ONGOING PROJECT:
ECRL East Coast Rail Link (STN01-STN08): 2024-2026
Owner: Malaysia Rail Link (MRLB)
Main Contractor: CCCC

MONETIZATION:
SaaS model for other NDT companies in Malaysia.
Free tier: 1 user, 5 invoices/month.
Starter: RM199/month — unlimited invoices, auto-sign, 
email tracker.
Pro: RM399/month — all features, Telegram agents, 
tender scout, boss auto-report.

TARGET USERS:
Primary: Fazmi Group admin (Wan Gpt) — internal use.
Secondary: Other Malaysian NDT companies, inspection 
firms, engineering consultancies as paying SaaS customers.

## Product Requirements Document
Not available

## Technology Stack
Not available

## Project Structure
Not available

## Database Schema Design
Not available

## User Flow
Not available

## Styling Guidelines
Not available
