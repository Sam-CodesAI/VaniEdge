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
  PhoneCall,
  Sliders,
} from "lucide-react";

interface LandingHeroProps {
  onScrollToStudio: () => void;
  onOpenAuth: (mode?: "signin" | "signup") => void;
  onOpenCustomizer?: () => void;
}

export default function LandingHero({
  onScrollToStudio,
  onOpenAuth,
  onOpenCustomizer,
}: LandingHeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200 bg-gradient-to-b from-white via-slate-50/60 to-white">
      {/* Ambient Subtle Glows */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 80% 50% at 50% 15%, rgba(16, 185, 129, 0.08) 0%, rgba(6, 182, 212, 0.05) 35%, transparent 70%),
            radial-gradient(circle at 10% 20%, rgba(16, 185, 129, 0.05) 0%, transparent 40%),
            radial-gradient(circle at 90% 40%, rgba(6, 182, 212, 0.05) 0%, transparent 40%)
          `,
        }}
      />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
        {/* Top Innovation Pill Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-emerald-600/30 text-black text-xs font-mono font-bold shadow-sm mb-6 hover:border-emerald-500 transition-all cursor-default">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
          </span>
          <span className="tracking-wide text-black uppercase font-oswald text-xs">
            Sub-Second Telephony &amp; SutraDB RAG • Zero Dropped Calls
          </span>
        </div>

        {/* Hero Headline in Oswald Font with Deep Black Text */}
        <h1 className="font-oswald text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-black max-w-4xl mx-auto leading-[1.08] uppercase">
          The Sovereign Voice AI &amp; Telephony Engine for{" "}
          <span className="inline-block bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
            Local &amp; Enterprise Commerce
          </span>
        </h1>

        {/* Vedic Etymology & Philosophy Badge */}
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-300 text-xs text-black font-mono shadow-sm">
          <span className="text-emerald-700 font-bold font-oswald text-sm">वाणी (Vāṇī)</span>: Sacred Speech &amp; Human Voice
          <span className="text-slate-400">•</span>
          <span className="text-cyan-700 font-bold font-oswald text-sm">Edge</span>: Sub-Second Telephony, Zero Cloud Hops
        </div>

        {/* Clickable Bangalore Cloud Telephony Inbound Demo Banner */}
        <div className="mt-5 flex items-center justify-center">
          <a
            href="tel:+918047361284"
            className="group inline-flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-white border-2 border-emerald-600 text-xs text-black font-mono shadow-md hover:shadow-lg transition-all cursor-pointer hover:scale-102"
            title="Click to dial Bangalore SIP Inbound Demo line directly from your phone"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
            </span>
            <PhoneCall className="w-4 h-4 text-emerald-600 group-hover:rotate-12 transition-transform" />
            <span className="text-black font-semibold">Bangalore PSTN Inbound Demo:</span>
            <strong className="text-black font-black font-oswald text-sm tracking-wider underline decoration-emerald-500 decoration-2">
              +91 80 4736 1284
            </strong>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold uppercase font-oswald">
              Live Indic Dialect
            </span>
          </a>
        </div>

        {/* Subtitle in Crisp Black Text */}
        <p className="mt-6 text-base sm:text-lg text-black max-w-2xl mx-auto leading-relaxed font-normal">
          Never lose a customer to missed calls, busy tones, or language barriers. VaniEdge combines{" "}
          <strong className="text-black font-bold">Cloudflare edge streaming</strong>, an atomic{" "}
          <strong className="text-black font-bold">&lt;1,200ms failover watchdog</strong>, and embedded{" "}
          <strong className="text-black font-bold">SutraDB vector memory</strong> across 8 turnkey industry vertical agents.
        </p>

        {/* Primary Call to Action Buttons */}
        <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
          <button
            type="button"
            onClick={onScrollToStudio}
            className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-black font-bold font-oswald text-base uppercase tracking-wider shadow-lg hover:shadow-xl hover:brightness-105 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
          >
            <Bot className="w-5 h-5" />
            <span>Launch Interactive Studio</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onOpenCustomizer && (
            <button
              type="button"
              onClick={onOpenCustomizer}
              className="px-5 py-3.5 rounded-xl bg-white border-2 border-black text-black font-bold font-oswald text-base uppercase tracking-wider shadow-sm hover:bg-slate-50 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Sliders className="w-4 h-4 text-emerald-600" />
              <span>Customize in 60s</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onOpenAuth("signup")}
            className="px-5 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold font-oswald text-base uppercase tracking-wider transition-all flex items-center gap-2.5 cursor-pointer shadow-md active:scale-95"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>Start Free with Google</span>
          </button>
        </div>

        {/* Live Performance Metric Badges in Oswald & Crisp Black Text */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-5 gap-4 text-center max-w-4xl mx-auto">
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-black font-oswald">11.8ms</div>
            <div className="text-xs text-black font-bold mt-1 uppercase font-oswald tracking-wide">SutraDB Edge RAG</div>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-black font-oswald">&lt; 1.2s</div>
            <div className="text-xs text-black font-bold mt-1 uppercase font-oswald tracking-wide">Turn-Taking TTFT</div>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-black font-oswald">100%</div>
            <div className="text-xs text-black font-bold mt-1 uppercase font-oswald tracking-wide">Zero Dropped Calls</div>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm">
            <div className="text-2xl sm:text-3xl font-bold text-black font-oswald">6+</div>
            <div className="text-xs text-black font-bold mt-1 uppercase font-oswald tracking-wide">Languages &amp; Indic</div>
          </div>
          <div className="p-4 rounded-xl bg-white border-2 border-slate-200 shadow-sm col-span-2 sm:col-span-1">
            <div className="text-2xl sm:text-3xl font-bold text-black font-oswald">8</div>
            <div className="text-xs text-black font-bold mt-1 uppercase font-oswald tracking-wide">Vertical Personas</div>
          </div>
        </div>
      </div>
    </section>
  );
}
