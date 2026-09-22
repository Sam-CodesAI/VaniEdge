"use client";

import React from "react";
import {
  Phone,
  Sparkles,
  Zap,
  ShieldCheck,
  Globe2,
  ArrowRight,
  Bot,
  Flame,
  Activity,
} from "lucide-react";

interface LandingHeroProps {
  onScrollToStudio: () => void;
}

export default function LandingHero({ onScrollToStudio }: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-800/80">
      {/* Ambient Radial Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[350px] sm:h-[450px] bg-gradient-to-tr from-cyan-500/15 via-emerald-500/10 to-indigo-500/15 blur-[120px] pointer-events-none rounded-full" />
      <div className="absolute -top-10 left-10 w-72 h-72 bg-cyan-500/10 blur-[90px] pointer-events-none rounded-full" />
      <div className="absolute top-40 right-10 w-80 h-80 bg-emerald-500/10 blur-[100px] pointer-events-none rounded-full" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Top Innovation Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6 hover:border-emerald-400/60 transition-all cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">SUB-SECOND TELEPHONY &amp; SUTRADB RAG • ZERO DROPPED CALLS</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15] sm:leading-[1.12]">
          The Sovereign Voice AI &amp; Telephony Engine for{" "}
          <span className="bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Local &amp; Enterprise Commerce
          </span>
        </h1>

        {/* Vedic Etymology & Philosophy Badge */}
        <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
          <span className="text-cyan-400 font-bold">वाणी (Vāṇī)</span>: Sacred Speech &amp; Human Voice
          <span className="text-slate-600">•</span>
          <span className="text-emerald-400 font-bold">Edge</span>: Sub-Second Telephony, Zero Cloud Hops
        </div>

        {/* Subtitle */}
        <p className="mt-6 text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Never lose a customer to missed calls, busy tones, or language barriers. VaniEdge combines{" "}
          <strong className="text-white font-semibold">Cloudflare edge streaming</strong>, an atomic{" "}
          <strong className="text-white font-semibold">&lt;1,200ms failover watchdog</strong>, and embedded{" "}
          <strong className="text-white font-semibold">SutraDB vector memory</strong> across 8 turnkey industry vertical agents.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onScrollToStudio}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 via-emerald-500 to-teal-400 text-slate-950 font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.35)] hover:shadow-[0_0_40px_rgba(16,185,129,0.5)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-4 h-4" />
            <span>Launch Interactive Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="tel:+18149613703"
            className="px-5 py-3.5 rounded-xl bg-slate-900/90 border border-emerald-500/40 text-emerald-300 font-mono text-sm hover:bg-slate-800/90 hover:border-emerald-400 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Phone className="w-4 h-4 text-emerald-400" />
            <span>Dial Live Demo: +1 (814) 961-3703</span>
          </a>

          <a
            href="https://t.me/Samarth1306"
            target="_blank"
            rel="noreferrer"
            className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-sm font-semibold hover:border-slate-500 hover:text-white transition-all flex items-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Claim Dedicated Line</span>
          </a>
        </div>

        {/* Live Performance Metric Badges */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">11.8ms</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">SutraDB Edge RAG</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">&lt; 1.2s</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Turn-Taking TTFT</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Zero Dropped Calls</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80">
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">6+</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Languages &amp; Indic Scripts</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-900/50 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">8</div>
            <div className="text-[11px] text-slate-400 font-medium mt-0.5">Turnkey Vertical Personas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
