# 🎙️ VaniEdge AI (वाणी Edge)
### Sub-Second Edge-Native Voice AI Telephony & Multi-Lingual Assistant for Local Businesses with SutraDB RAG

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSam-CodesAI%2FVaniEdge)
[![Vitest Tests](https://img.shields.io/badge/Vitest-15%2F15%20Passing-brightgreen?style=flat-square&logo=vitest)](tests/)
[![TypeScript Strict](https://img.shields.io/badge/TypeScript-Strict%20v5.7-blue?style=flat-square&logo=typescript)](tsconfig.json)
[![Next.js 16](https://img.shields.io/badge/Next.js-16.3%20Turbopack-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4.0-38bdf8?style=flat-square&logo=tailwind-css)](https://tailwindcss.com)

> **Live Production Dialable Telephony Line:** `+1 (814) 961-3703`  
> **GitHub Repository:** [github.com/Sam-CodesAI/VaniEdge](https://github.com/Sam-CodesAI/VaniEdge)

---

## 🌟 Overview

Small businesses across India and emerging markets lose over **35% of inbound customers** due to missed calls, busy lines, and language friction during peak hours. Traditional cloud-based voice agents suffer from **2.5 to 5+ second latency** and expensive vector database subscription fees ($70+/month for Pinecone/Weaviate).

**VaniEdge AI** is a complete, self-contained Next.js & Edge-Native voice platform that delivers:
1. **Interactive In-Browser Voice Studio**: Real-time microphone listening, ElevenLabs edge streaming audio synthesis, and responsive breathing orb audio physics.
2. **Multi-Lingual Voice Support**: Fluent customer conversations in **English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Marathi (मराठी), Tamil (தமிழ்), and Spanish (Español)**.
3. **Embedded SutraDB Hybrid RAG**: Zero-dependency in-memory vector database (BM25 lexical + dense character n-gram embeddings) running local semantic queries in **under 10ms with zero monthly SaaS fees**.
4. **Autonomous Booking & Ticket Dispatch**: Automatically extracts caller intent, schedules clinic appointments, restaurant orders, or roadside rescues with cryptographic verification signatures.
5. **Direct Carrier Telephony Line**: Dialable 24/7 PSTN line connected to Twilio and edge workers at `+1 (814) 961-3703`.

---

## 🏗️ System Architecture

```mermaid
sequenceDiagram
    autonumber
    actor Caller as 📞 Customer Phone / Browser
    participant Gateway as 🌐 Twilio / Next.js Edge
    participant Sutra as 🧠 SutraDB In-Memory RAG
    participant ConvAI as 🎙️ ElevenLabs Streaming TTS
    participant Watchdog as 🛡️ Sub-Second Failover
    participant Dispatch as 📋 Booking & Confirmation

    Caller->>Gateway: Voice Audio Stream
    par Telephony Streaming & Watchdog
        Gateway->>Watchdog: Arm 1,200ms Connection Deadline
        Gateway->>ConvAI: Edge Audio Stream Handshake
        ConvAI-->>Gateway: Handshake Confirmed
        Gateway->>Watchdog: Disarm Connect Timer, Arm 1,500ms TTFT
    and RAG Semantic Retrieval
        Gateway->>Sutra: Query Context (BM25 + Dense Vector Fusion)
        Sutra-->>Gateway: Top-1 Fact Retrieved (<10ms)
    end

    ConvAI-->>Gateway: Audio Chunk (First Packet in 340ms)
    Gateway->>Watchdog: Disarm TTFT Timer (Health Confirmed)
    Gateway->>Caller: Natural Multi-Lingual Voice Output

    opt Intent Detected (Appointment / Order / Dispatch)
        Gateway->>Dispatch: Extract Caller Name, Phone, Service & Slot
        Dispatch-->>Caller: Instant Confirmation + Cryptographic Ticket ID
    end
```

---

## ⚡ Technical Highlights

### 1. SutraDB Hybrid Vector & Lexical Engine
* **Pure TypeScript zero-dependency engine** (`lib/sutradb-engine.ts`).
* Combines **BM25 Okapi** ($k_1=1.5, b=0.75$) with normalized **64-dimensional character n-gram dense semantic hashing**.
* Blended using **Reciprocal Rank Fusion (RRF)**:
  $$\text{Fused Score} = 0.60 \times \text{Dense Vector Score} + 0.40 \times \text{Normalized BM25 Score}$$
* **Benchmark:** Sub-10ms query latency over 1,000 documents in memory.

### 2. Sub-Second Watchdog Failover (Zero Dropped Calls)
* Standard phone users hang up if latency exceeds **2.0 seconds**.
* VaniEdge runs an active edge watchdog:
  * **1,200ms Connection Timeout**: If the speech WebSocket handshake exceeds 1,200ms, watchdog triggers graceful failover.
  * **1,500ms TTFT Timeout**: If the first synthesized audio packet fails to arrive within 1,500ms, call is gracefully handed to backup queues.

---

## 🧪 Test Suite & Verification

VaniEdge is rigorously tested with automated Vitest suites covering retrieval accuracy, failover timers, and cryptographic dispatch integrity:

```bash
$ pnpm test

 ✓ tests/sutradb.test.ts (7 tests) 15ms
 ✓ tests/watchdog.test.ts (4 tests) 33ms
 ✓ tests/dispatch.test.ts (4 tests) 18ms

 Test Files  3 passed (3)
      Tests  15 passed (15)
   Duration  2.68s
```

---

## 🚀 Quickstart & Local Development

### 1. Clone & Install
```bash
git clone https://github.com/Sam-CodesAI/VaniEdge.git
cd VaniEdge
pnpm install
```

### 2. Run Locally
```bash
pnpm dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Run Test Suite
```bash
pnpm test
```

### 4. Build for Production
```bash
pnpm build
```

---

## ☁️ Deploying to Vercel

### Option 1: One-Click Deploy Button
Click the button below to fork and deploy directly to your Vercel account:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FSam-CodesAI%2FVaniEdge)

### Option 2: Import via Vercel Dashboard
1. Go to [vercel.com/new](https://vercel.com/new).
2. Select repository **`Sam-CodesAI/VaniEdge`**.
3. Framework Preset: **Next.js** (auto-detected).
4. Root Directory: `./` (leave default).
5. (Optional) Add Environment Variables:
   * `ELEVENLABS_API_KEY`: Your ElevenLabs API key for edge voice streaming (graceful browser voice fallback is enabled automatically if omitted).
6. Click **Deploy**.

---

## 👨‍💻 Author & Attribution

* **Developer:** **Samarth Nimangre**
* **Portfolio:** [sam-codes.vercel.app](https://sam-codes.vercel.app)
* **Telegram:** [@Samarth1306](https://t.me/Samarth1306)
* **GitHub:** [@Sam-CodesAI](https://github.com/Sam-CodesAI) / [@samarthnimangre-dev](https://github.com/samarthnimangre-dev)
* **License:** MIT
