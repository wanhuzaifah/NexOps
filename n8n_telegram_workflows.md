# NexOps — n8n Telegram Bot Workflows
# Setup guide for all 5 AI agents via n8n
# All agents use DeepSeek V4 Flash (deepseek-chat)

## ═══════════════════════════════════════
## SETUP
## ═══════════════════════════════════════

### Prerequisites
- n8n installed on Hostinger VPS (RM20/month)
- Telegram Bot created via @BotFather
- NexOps deployed on Vercel
- DeepSeek API key ready

### Environment Variables in n8n
Settings → n8n Settings → Environment Variables:
```
DEEPSEEK_API_KEY     = sk-xxxxxxxxxxxx
SUPABASE_URL         = https://xxx.supabase.co
SUPABASE_KEY         = eyJxxx...  (service role key)
TELEGRAM_BOT_TOKEN   = 123456:ABCxxx...
TELEGRAM_CHAT_ID     = your_personal_chat_id
NEXOPS_URL           = https://nexops.vercel.app
```

## ═══════════════════════════════════════
## WORKFLOW 1: COMMANDER (Webhook Trigger)
## ═══════════════════════════════════════

This is the MAIN entry point. All Telegram messages go here first.

### Nodes:
1. **Telegram Trigger (Webhook)**
   - Type: Telegram Trigger
   - Updates: message
   - Webhook URL: https://your-n8n.com/webhook/nexops-commander

2. **Security Check (Code Node)**
```javascript
const allowedIds = ['{{ $env.TELEGRAM_CHAT_ID }}']
const chatId = $input.first().json.message?.chat?.id?.toString()
const text = $input.first().json.message?.text || ''

if (!allowedIds.includes(chatId)) {
  return [{ json: { authorized: false, chatId, text } }]
}
return [{ json: { authorized: true, chatId, text } }]
```

3. **IF — Authorized?**
   - True → Route Intent
   - False → Send "Unauthorized" message and stop

4. **Route Intent (HTTP Request — DeepSeek)**
   - URL: https://api.deepseek.com/v1/chat/completions
   - Method: POST
   - Auth: Bearer {{ $env.DEEPSEEK_API_KEY }}
   - Body:
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are a command router for NexOps. Classify the message into ONE word: FINANCE | TENDER | MARKET | OPS | DOCUMENT | UNKNOWN. Return ONLY the word."
    },
    {
      "role": "user",
      "content": "={{ $json.text }}"
    }
  ],
  "max_tokens": 10,
  "temperature": 0
}
```

5. **Extract Intent (Code Node)**
```javascript
const content = $input.first().json.choices[0].message.content.trim().toUpperCase()
const validIntents = ['FINANCE', 'TENDER', 'MARKET', 'OPS', 'DOCUMENT']
const intent = validIntents.includes(content) ? content : 'UNKNOWN'
return [{ json: { intent, originalText: $('Security Check').first().json.text, chatId: $('Security Check').first().json.chatId }}]
```

6. **Switch — Route by Intent**
   - FINANCE → Execute Finance Workflow
   - TENDER → Execute Tender Workflow
   - MARKET → Execute Market Workflow
   - OPS → Execute Ops Workflow
   - DOCUMENT → Execute Document Workflow
   - UNKNOWN → Send help message

## ═══════════════════════════════════════
## WORKFLOW 2: FINANCE AGENT
## ═══════════════════════════════════════

### Nodes:
1. **Get AR Data (HTTP Request — Supabase)**
   - URL: {{ $env.SUPABASE_URL }}/rest/v1/invoices?select=*,clients(name)&status=neq.paid&company_id=eq.YOUR_COMPANY_ID
   - Headers: apikey: {{ $env.SUPABASE_KEY }}, Authorization: Bearer {{ $env.SUPABASE_KEY }}

2. **Finance Agent (HTTP Request — DeepSeek)**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are Finance Agent for Fazmi Group Sdn Bhd. Handle AR queries, invoice status, payment tracking. Currency: RM. Reply in BM if user writes BM, English otherwise. Max 25 lines. Use emoji.\n\nCurrent AR data: ={{ JSON.stringify($('Get AR Data').first().json) }}"
    },
    {
      "role": "user",
      "content": "={{ $('Commander').first().json.originalText }}"
    }
  ],
  "max_tokens": 800,
  "temperature": 0.2
}
```

3. **Send Telegram Reply**
   - Chat ID: {{ $('Commander').first().json.chatId }}
   - Text: {{ $json.choices[0].message.content }}
   - Parse Mode: Markdown

### Supported Commands:
- /ar → Total outstanding summary
- /ar_overdue → Overdue invoices list
- /ar_today → Payments due today
- /reminder [client] → Generate reminder message

## ═══════════════════════════════════════
## WORKFLOW 3: TENDER SCOUT (Cron + Alert)
## ═══════════════════════════════════════

### Cron Schedule: 0 8,14,20,2 * * * (every 6 hours)

### Nodes:
1. **Cron Trigger**
   - Expression: 0 8,14,20,2 * * *

2. **Scrape JKR (HTTP Request)**
   - URL: https://tender.jkr.gov.my/kenyataan/tender
   - Method: GET
   - Headers: User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36

3. **Scrape MyProcurement (HTTP Request)**
   - URL: https://myprocurement.treasury.gov.my/iklan/tender/
   - Method: GET

4. **Merge Scraped Content (Code Node)**
```javascript
const jkrContent = $('Scrape JKR').first().json.data?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 5000) || ''
const myProcContent = $('Scrape MyProcurement').first().json.data?.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').slice(0, 5000) || ''
return [{ json: { combined: `JKR TENDERS:\n${jkrContent}\n\nMYPROCUREMENT:\n${myProcContent}` }}]
```

5. **Score Tenders (HTTP Request — DeepSeek)**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are Tender Scout for Fazmi Group (NDT, steel fab, G2, manpower). Score tenders 0-100. +30 NDT/inspection, +25 steel fab, +20 G2/manpower, +20 Kelantan bonus. Disqualify: cleaning, catering, ICT, security. Return JSON array only: [{\"title\",\"agency\",\"value\",\"closing\",\"location\",\"score\",\"reasons\":[]}]"
    },
    {
      "role": "user", 
      "content": "={{ $json.combined }}"
    }
  ],
  "max_tokens": 2000,
  "temperature": 0.1
}
```

6. **Filter High Match (Code Node)**
```javascript
const raw = $input.first().json.choices[0].message.content.replace(/```json|```/g, '').trim()
try {
  const tenders = JSON.parse(raw)
  const highMatch = tenders.filter(t => t.score >= 60)
  return highMatch.map(t => ({ json: t }))
} catch {
  return [{ json: { error: 'Parse failed', raw }}]
}
```

7. **IF — Any High Match?**
   - Condition: {{ $json.score }} >= 60

8. **Send Telegram Alert**
   - Text: 
```
🎯 *TENDER BARU DITEMUI*

📋 {{ $json.title }}
🏢 {{ $json.agency }}
📍 {{ $json.location }}
💰 {{ $json.value }}
📅 Tutup: {{ $json.closing }}
⭐ Skor: {{ $json.score }}/100
✅ Match: {{ $json.reasons.join(', ') }}
```

## ═══════════════════════════════════════
## WORKFLOW 4: MARKET INTEL (Daily 7am)
## ═══════════════════════════════════════

### Cron: 0 7 * * *

### Nodes:
1. **Cron Trigger**: 0 7 * * *

2. **Fetch Malaysia Construction News (HTTP Request)**
   - URL: https://newsapi.org/v2/everything?q=Malaysia+construction+NDT+inspection&language=en&sortBy=publishedAt&pageSize=5&apiKey=YOUR_NEWSAPI_KEY

3. **Market Intel Agent (DeepSeek)**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are Market Intel Agent for Fazmi Group (NDT, O&G, construction). Analyze news and identify business opportunities. Format for Telegram. Use 🇲🇾 Malaysia, 🌍 global, ⚠️ urgent, 💡 opportunity. Max 30 lines. Reply in BM."
    },
    {
      "role": "user",
      "content": "={{ JSON.stringify($('Fetch News').first().json.articles?.map(a => a.title + ': ' + a.description).join('\n')) }}"
    }
  ],
  "max_tokens": 1000,
  "temperature": 0.4
}
```

4. **Send Telegram Daily Digest**
   - Chat ID: {{ $env.TELEGRAM_CHAT_ID }}
   - Text: 📰 *MARKET INTEL HARIAN*\n\n{{ $json.choices[0].message.content }}

## ═══════════════════════════════════════
## WORKFLOW 5: OPS BRIEFING (Daily 8:30am)
## ═══════════════════════════════════════

### Cron: 30 8 * * *

### Nodes:
1. **Cron Trigger**: 30 8 * * *

2. **Fetch Ops Data (HTTP Request — Supabase)**
Fetch all dashboard stats (invoices, documents, emails, personnel, tenders)

3. **Ops Manager Agent (DeepSeek)**
```json
{
  "model": "deepseek-chat",
  "messages": [
    {
      "role": "system",
      "content": "You are Ops Manager for Fazmi Group. Generate daily briefing in BM for Telegram. Use emoji. Max 35 lines.\n\nFormat:\n☀️ BRIEFING — [date]\n\n💰 KEWANGAN\n📋 DOKUMEN\n📧 EMAIL\n👷 TECHNICIAN\n⚠️ ALERT\n🎯 TENDER"
    },
    {
      "role": "user",
      "content": "Data: ={{ JSON.stringify($('Fetch Ops Data').first().json) }}"
    }
  ],
  "max_tokens": 800,
  "temperature": 0.3
}
```

4. **Send Morning Brief**
   - Chat ID: {{ $env.TELEGRAM_CHAT_ID }}
   - Text: {{ $json.choices[0].message.content }}

## ═══════════════════════════════════════
## WEEKLY AR SUMMARY (Monday 8am)
## ═══════════════════════════════════════

### Cron: 0 8 * * 1 (Every Monday 8am)

1. Fetch all unpaid invoices from Supabase
2. Generate summary with DeepSeek
3. Send email via NexOps API: POST /api/email { type: 'weekly_ar', ... }

## ═══════════════════════════════════════
## TELEGRAM COMMANDS REFERENCE
## ═══════════════════════════════════════

/ar                  → AR summary (Finance Agent)
/ar_overdue          → Overdue invoices
/brief               → Ops briefing sekarang (bypass cron)
/tenders             → Latest high-match tenders
/tenders_today       → Tenders found today
/market              → Market intel sekarang
/technicians         → Technician status
/certs_expiry        → Certs expiring <30 days
/sign_pending        → Pending unsigned docs count
/help                → Command list

## ═══════════════════════════════════════
## REGISTER WEBHOOK WITH TELEGRAM
## ═══════════════════════════════════════

Run this once to register your n8n webhook:

curl "https://api.telegram.org/bot<YOUR_TOKEN>/setWebhook?url=https://your-n8n.com/webhook/nexops-commander"

Verify:
curl "https://api.telegram.org/bot<YOUR_TOKEN>/getWebhookInfo"
