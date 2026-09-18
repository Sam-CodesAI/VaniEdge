# 🎙️ VaniEdge AI (वाणी Edge)
### Sub-Second Edge-Native Voice AI Telephony & Multi-Lingual Dispatcher for Small Businesses with SutraDB RAG

[![Vitest Tests](https://img.shields.io/badge/Vitest-15%2F15%20Passing-brightgreen?style=flat-square&logo=vitest)](tests/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20v5.7-blue?style=flat-square&logo=typescript)](tsconfig.json)
[![Edge Runtime](https://img.shields.io/badge/Edge%20Runtime-Cloudflare%20Workers-orange?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3%20Turbopack-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Live Demo](https://img.shields.io/badge/Live%20Mission%20Control-Online-emerald?style=flat-square)](https://sam-codes.vercel.app/vaniedge)

> **Built for Hack Devengers 2.0 (Unstop Open Innovation)**  
> **Live Dialable Telephony Line:** `+1 (814) 961-3703`  
> **Mission Control UI:** [sam-codes.vercel.app/vaniedge](https://sam-codes.vercel.app/vaniedge)

---

## 🌟 Overview

Small businesses across India and emerging markets lose over **35% of inbound customers** due to missed calls, busy signals, and language friction during peak hours. Traditional cloud-based voice agents suffer from **2.5 to 5+ second latency** and expensive vector database subscription fees ($70+/month for Pinecone/Weaviate).

**VaniEdge AI** is a zero-downtime, edge-native telephony and multi-lingual voice agent that:
1. **Answers incoming PSTN phone calls within 350ms** via bidirectional 8kHz μ-law WebSocket streaming on Cloudflare Workers edge nodes.
2. **Speaks and understands Indian languages** (English, Hindi हिंदी, and Kannada ಕನ್ನಡ).
3. **Embeds SutraDB In-Memory RAG**: A zero-dependency hybrid vector database (BM25 lexical + dense character n-gram embeddings) that executes local semantic document queries in **under 10ms with zero SaaS subscription fees**.
4. **Autonomous Booking & Ticket Dispatch**: Automatically extracts caller intent, schedules clinic appointments or food delivery orders, generates cryptographic ticket IDs, and dispatches SMS confirmations.
5. **Sub-Second Failover Watchdog**: Protects live conversations with a strict **1,200ms connection and 1,500ms TTFT deadline**. If upstream AI providers degrade, calls are mid-call redirected to backup queues with **zero dropped calls**.

---

## 🏗️ System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Caller as 📞 Customer Phone
    participant Twilio as 🌐 Twilio Voice Gateway
    participant Edge as ⚡ Cloudflare Worker (VaniEdge)
    participant Sutra as 🧠 SutraDB In-Memory RAG
    participant ConvAI as 🎙️ ElevenLabs / Speech API
    participant Watchdog as 🛡️ Sub-Second Watchdog
    participant Dispatch as 📋 Booking & Ticket Dispatch

    Caller->>Twilio: Inbound Phone Call (+1 814 961-3703)
    Twilio->>Edge: HTTP POST Webhook (/voice/incoming)
    Edge-->>Twilio: TwiML 200 OK (<Connect><Stream>)
    Twilio->>Edge: Bidirectional 8kHz μ-law WebSocket

    par Telephony Streaming & Watchdog
        Edge->>Watchdog: Arm 1,200ms Connection Deadline
        Edge->>ConvAI: WebSocket Media Stream Handshake
        ConvAI-->>Edge: Handshake Confirmed
        Edge->>Watchdog: Disarm Connect Timer, Arm 1,500ms TTFT
    and RAG Semantic Retrieval
        Edge->>Sutra: Query Context (BM25 + Vector Fusion)
        Sutra-->>Edge: Top-1 Fact Retrieved (<10ms)
    end

    ConvAI-->>Edge: Audio Chunk (First Packet in 340ms)
    Edge->>Watchdog: Disarm TTFT Timer (Health Confirmed)
    Edge->>Twilio: 8kHz μ-law Audio Frames
    Twilio->>Caller: Natural Multi-Lingual Speech Response

    opt Intent Detected (Appointment / Order)
        Edge->>Dispatch: Extract Name, Phone, Service & Slot
        Dispatch-->>Caller: Instant SMS Confirmation + Cryptographic Ticket ID
    end

    opt Upstream Glitch (>1,200ms)
        Watchdog->>Twilio: Mid-Call REST Redirection (/voice/fallback)
        Twilio->>Caller: Seamless Transfer to Human / Backup PSTN Queue
    end
```

---

## ⚡ Technical Highlights

### 1. SutraDB Hybrid Vector & Lexical Engine
* **Pure TypeScript/Node zero-dependency engine** ported from Python SutraDB.
* Combines **BM25 Okapi** ($k_1=1.5, b=0.75$) with normalized **64-dimensional character n-gram dense semantic hashing**.
* Blended using **Reciprocal Rank Fusion (RRF)**:
  $$\text{Fused Score} = 0.60 \times \text{Dense Vector Score} + 0.40 \times \text{Normalized BM25 Score}$$
* **Benchmark:** Sub-10ms query latency over 1,000 documents in memory.

### 2. Sub-Second Watchdog Failover (Zero Dropped Calls)
* Standard phone users hang up if latency exceeds **2.0 seconds**.
* VaniEdge runs an active edge watchdog:
  * **1,200ms Connection Timeout**: If the speech WebSocket handshake exceeds 1,200ms, watchdog triggers mid-call Twilio REST redirection.
  * **1,500ms TTFT Timeout**: If the first synthesized audio packet fails to arrive within 1,500ms, call is gracefully handed to backup queues.

---

## 🧪 Test Suite & Verification

VaniEdge is rigorously tested with automated Vitest suites covering retrieval accuracy, failover timers, and cryptographic dispatch integrity:

```bash
$ npx vitest run

 ✓ tests/sutradb.test.ts (7 tests) 14ms
 ✓ tests/watchdog.test.ts (4 tests) 16ms
 ✓ tests/dispatch.test.ts (4 tests) 10ms

 Test Files  3 passed (3)
      Tests  15 passed (15)
   Duration  1.29s
```

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/Sam-CodesAI/VaniEdge-AI.git
cd VaniEdge-AI
npm install
```

### 2. Run Test Suite
```bash
npm run test
```

### 3. Typecheck
```bash
npm run typecheck
```

---

## 👨‍💻 Author & Attribution

* **Developer:** **Samarth Nimangre**
* **Portfolio:** [sam-codes.vercel.app](https://sam-codes.vercel.app)
* **Telegram:** [@Samarth1306](https://t.me/Samarth1306)
* **GitHub:** [SamarthNimangre](https://github.com/SamarthNimangre)
* **License:** MIT
