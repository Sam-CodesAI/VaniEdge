"use client";

import React from "react";
import {
  Cpu,
  ShieldCheck,
  Database,
  Ticket,
  Activity,
  Zap,
  Globe2,
  Lock,
  Layers,
  Radio,
} from "lucide-react";

export default function BentoArchitecture() {
  return (
    <section id="architecture" className="py-16 sm:py-24 border-b border-slate-800/80 bg-[#060910] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-medium mb-3">
            <Layers className="w-3.5 h-3.5" />
            <span>2026 DISTRIBUTED TELEPHONY ARCHITECTURE</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            The Vani + Edge Paradigm
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium">
            A zero-downtime voice engine engineered specifically to eliminate cloud latency bottlenecks and prevent dropped business calls.
          </p>
        </div>

        {/* Asymmetric 4-Card Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Vani Multi-Lingual Acoustic Engine (Col-span 2) */}
          <div
            className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-cyan-500/50 transition-all shadow-lg group relative overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 95% 95%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)" }}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                  <Globe2 className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-cyan-300 border border-slate-700 font-semibold">
                  Sovereign Acoustics
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                वाणी (Vāṇī) Multi-Lingual Speech Processing
              </h3>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed font-normal">
                Native acoustic recognition and real-time script parsing across Indian regional languages and global tongues: English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Marathi (मराठी), Tamil (தமிழ்), and Spanish (Español). Dynamic accent tolerance and cultural nuances ensure callers feel naturally understood.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-cyan-400 font-bold block text-sm">6+</span>
                <span className="text-slate-300 text-xs">Languages</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-emerald-400 font-bold block text-sm">&lt; 180ms</span>
                <span className="text-slate-300 text-xs">Edge Speech TTS</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-teal-300 font-bold block text-sm">Auto</span>
                <span className="text-slate-300 text-xs">Script Switching</span>
              </div>
            </div>
          </div>

          {/* Card 2: Sub-1,200ms Failover Watchdog (Col-span 1, Tall) */}
          <div
            className="rounded-2xl bg-gradient-to-b from-amber-950/40 via-slate-900/90 to-slate-900 border border-amber-500/40 p-6 sm:p-8 flex flex-col justify-between hover:border-amber-400/60 transition-all shadow-lg relative overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 95% 10%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)" }}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-amber-950/80 text-amber-300 border border-amber-500/50 font-semibold animate-pulse">
                  Zero Dropped Calls
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Sub-1.2s Carrier Failover Watchdog
              </h3>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed font-normal">
                If an upstream LLM, socket, or speech endpoint experiences silence exceeding 1,200ms connection deadline or 1,500ms conversational TTFT, the watchdog atomically redirects the live Twilio call to a human specialist in under 20ms. The customer never hears silence or a dead tone.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>Watchdog Tick:</span>
                <span className="text-amber-400 font-bold">100ms interval</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Failover Latency:</span>
                <span className="text-emerald-400 font-bold">&lt; 20ms REST</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Call Drop Rate:</span>
                <span className="text-amber-300 font-bold">0.00%</span>
              </div>
            </div>
          </div>

          {/* Card 3: Embedded SutraDB Vector RAG (Col-span 1) */}
          <div
            className="rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-emerald-500/50 transition-all shadow-lg relative overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 10% 95%, rgba(16, 185, 129, 0.12) 0%, transparent 60%)" }}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Database className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-500/50 font-semibold">
                  Zero SaaS Bill
                </span>
              </div>
              <h3 className="text-xl font-bold text-white tracking-tight">
                Embedded SutraDB Vector RAG
              </h3>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed font-normal">
                Zero external vector database subscription ($70+/mo Pinecone/Weaviate eliminated). Executes 60% Dense Semantic Vector + 40% BM25 Lexical reciprocal rank fusion directly on the edge in sub-12 milliseconds.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 space-y-2 font-mono text-xs">
              <div className="flex items-center justify-between text-slate-300">
                <span>RAG Latency:</span>
                <span className="text-emerald-400 font-bold">11.8ms</span>
              </div>
              <div className="flex items-center justify-between text-slate-300">
                <span>Fusion Scoring:</span>
                <span className="text-slate-100 font-semibold">0.6 Dense + 0.4 BM25</span>
              </div>
            </div>
          </div>

          {/* Card 4: Autonomous Dispatch & Cryptographic Ticketing (Col-span 2) */}
          <div
            className="md:col-span-2 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 sm:p-8 flex flex-col justify-between hover:border-indigo-500/50 transition-all shadow-lg group relative overflow-hidden"
            style={{ backgroundImage: "radial-gradient(circle at 10% 10%, rgba(99, 102, 241, 0.12) 0%, transparent 60%)" }}
          >
            <div>
              <div className="flex items-center justify-between gap-4 mb-4">
                <div className="h-12 w-12 rounded-xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                  <Ticket className="w-6 h-6" />
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-full bg-slate-800 text-indigo-300 border border-slate-700 font-semibold">
                  Instant Turnkey SLA
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                Autonomous Appointment &amp; Dispatch Pipeline
              </h3>
              <p className="mt-2 text-sm text-slate-200 leading-relaxed font-normal">
                Every voice conversation terminates in a verified, actionable business action. Automatic entity extraction creates structured tickets with cryptographic checksum verification (`VANI-CLI-...`, `VANI-RES-...`, `VANI-AUT-...`) and triggers multi-lingual SMS confirmations directly to caller and dispatch teams.
              </p>
            </div>

            <div className="mt-6 pt-6 border-t border-slate-800 grid grid-cols-3 gap-3 font-mono text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-indigo-400 font-bold block text-sm">Deterministic</span>
                <span className="text-slate-300 text-xs">8-Char Checksum</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-emerald-400 font-bold block text-sm">Instant</span>
                <span className="text-slate-300 text-xs">SMS Confirmation</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 text-center">
                <span className="text-cyan-400 font-bold block text-sm">Escalation</span>
                <span className="text-slate-300 text-xs">Urgent Alert Router</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
