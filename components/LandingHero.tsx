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
      {/* Ambient Radial Background Glows (Hardware-Accelerated CSS Gradients - Zero Blur Filter Overlap) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 15%, rgba(6, 182, 212, 0.12) 0%, rgba(16, 185, 129, 0.08) 35%, transparent 70%),
            radial-gradient(circle at 10% 20%, rgba(6, 182, 212, 0.08) 0%, transparent 40%),
            radial-gradient(circle at 90% 40%, rgba(16, 185, 129, 0.08) 0%, transparent 40%)
          `,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Top Innovation Pill Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold shadow-[0_0_20px_rgba(16,185,129,0.15)] mb-6 hover:border-emerald-400/80 transition-all cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="tracking-wide">SUB-SECOND TELEPHONY &amp; SUTRADB RAG • ZERO DROPPED CALLS</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-4xl mx-auto leading-[1.15] sm:leading-[1.12]">
          The Sovereign Voice AI &amp; Telephony Engine for{" "}
          <span className="inline-block bg-gradient-to-r from-cyan-300 via-emerald-300 to-teal-200 bg-clip-text text-transparent">
            Local &amp; Enterprise Commerce
          </span>
        </h1>

        {/* Vedic Etymology & Philosophy Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 font-mono">
          <span className="text-cyan-400 font-bold">वाणी (Vāṇī)</span>: Sacred Speech &amp; Human Voice
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-bold">Edge</span>: Sub-Second Telephony, Zero Cloud Hops
        </div>

        {/* Subtitle */}
        <p className="mt-6 text-base sm:text-lg text-slate-200 max-w-2xl mx-auto leading-relaxed font-normal">
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
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-cyan-400 font-mono">11.8ms</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">SutraDB Edge RAG</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-emerald-400 font-mono">&lt; 1.2s</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Turn-Taking TTFT</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">100%</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Zero Dropped Calls</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm">
            <div className="text-xl sm:text-2xl font-black text-indigo-400 font-mono">6+</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Languages &amp; Indic Scripts</div>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-xl sm:text-2xl font-black text-rose-400 font-mono">8</div>
            <div className="text-xs text-slate-300 font-semibold mt-1">Turnkey Vertical Personas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
