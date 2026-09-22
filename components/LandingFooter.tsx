"use client";

import React from "react";
import {
  Sparkles,
  Phone,
  Code2,
  ExternalLink,
  ShieldCheck,
  ArrowRight,
  Heart,
  Globe2,
} from "lucide-react";

interface LandingFooterProps {
  onOpenAuth?: (mode?: "signin" | "signup") => void;
}

export default function LandingFooter({ onOpenAuth }: LandingFooterProps) {
  return (
    <footer className="bg-[#05080e] border-t border-slate-800/80 pt-16 pb-12 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Call to Action Banner */}
        <div
          className="rounded-2xl bg-gradient-to-r from-emerald-950/80 via-slate-900 to-cyan-950/80 border border-emerald-500/40 p-8 sm:p-12 mb-16 text-center relative overflow-hidden shadow-2xl"
          style={{ backgroundImage: "radial-gradient(circle at 90% 10%, rgba(16, 185, 129, 0.15) 0%, transparent 60%)" }}
        >
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/50 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>COMMERCIAL ONBOARDING OPEN</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
              Ready to automate your business calls with sub-second AI?
            </h2>
            <p className="text-slate-200 text-sm sm:text-base leading-relaxed font-normal">
              Eliminate missed calls and scale customer intake across 8 industry verticals. Speak directly with the architect to claim your dedicated phone line today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://t.me/Samarth1306"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-sm shadow-[0_0_25px_rgba(16,185,129,0.35)] hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Chat on Telegram (@Samarth1306)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="px-5 py-3.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-sm hover:border-slate-500 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Create Free Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-800/80">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/vaniedge-logo.png"
                alt="VaniEdge Logo"
                className="h-8 w-8 rounded-lg object-cover border border-cyan-500/40"
              />
              <span className="font-black text-lg text-white tracking-tight">
                VaniEdge Voice Platform
              </span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed max-w-sm">
              The sovereign multi-lingual telephony &amp; voice agent platform. Built with Next.js 16 Turbopack, Cloudflare edge streaming, sub-1,200ms failover watchdogs, and embedded SutraDB vector memory.
            </p>
            <div className="pt-1 text-[11px] font-mono text-slate-400">
              MIT License • Built by Samarth Nimangre
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-3">
              Platform &amp; Architecture
            </span>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#studio" className="hover:text-cyan-400 transition-colors">
                  Interactive Live Studio
                </a>
              </li>
              <li>
                <a href="#industries" className="hover:text-cyan-400 transition-colors">
                  8 Industry Verticals
                </a>
              </li>
              <li>
                <a href="#architecture" className="hover:text-cyan-400 transition-colors">
                  Vani + Edge Paradigm
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-cyan-400 transition-colors">
                  Commercial Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-cyan-400 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200 block mb-3">
              Developer Endpoints
            </span>
            <ul className="space-y-2 text-xs font-mono">
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>/api/health</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="/api/metrics?format=prometheus"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-emerald-400 transition-colors flex items-center gap-1"
                >
                  <span>/api/metrics</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sam-CodesAI/VaniEdge-Voice-Platform"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
              <li>
                <a
                  href="https://sam-codes.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>Architect Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-slate-600" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 font-mono">
          <div>
            &copy; {new Date().getFullYear()} VaniEdge Voice Platform (वाणीEdge). All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Sovereign Voice Telephony</span>
            <span>•</span>
            <span>Zero Dropped Calls</span>
            <span>•</span>
            <span>Sub-Second TTFT</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
