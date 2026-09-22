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
    <footer className="bg-white border-t border-slate-200 pt-16 pb-12 text-black text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Call to Action Banner in Oswald & Black Text */}
        <div className="rounded-2xl bg-slate-50 border-2 border-slate-200 p-8 sm:p-12 mb-16 text-center relative overflow-hidden shadow-lg">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-slate-300 text-black text-xs font-oswald uppercase tracking-wider font-bold">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>COMMERCIAL ONBOARDING OPEN</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-bold text-black font-oswald uppercase tracking-tight">
              Ready to automate your business calls with sub-second AI?
            </h2>
            <p className="text-black text-sm sm:text-base leading-relaxed font-medium">
              Eliminate missed calls and scale customer intake across 8 industry verticals. Speak directly with the architect to claim your dedicated phone line today.
            </p>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <a
                href="https://t.me/Samarth1306"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-black hover:bg-slate-800 text-white font-bold font-oswald uppercase tracking-wider text-sm shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Chat on Telegram (@Samarth1306)</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <button
                type="button"
                onClick={() => onOpenAuth?.("signup")}
                className="px-5 py-3.5 rounded-xl bg-white border-2 border-black text-black font-bold font-oswald uppercase tracking-wider text-sm hover:bg-slate-100 transition-all flex items-center gap-2 cursor-pointer shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Create Free Account</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-12 border-b border-slate-200">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2.5">
              <img
                src="/vaniedge-logo.png"
                alt="VaniEdge Logo"
                className="h-8 w-8 rounded-lg object-cover border border-emerald-500"
              />
              <span className="font-bold text-xl text-black font-oswald uppercase tracking-tight">
                VaniEdge Voice Platform
              </span>
            </div>
            <p className="text-black text-xs leading-relaxed max-w-sm font-medium">
              The sovereign multi-lingual telephony &amp; voice agent platform. Built with Next.js 16 Turbopack, Cloudflare edge streaming, sub-1,200ms failover watchdogs, and embedded SutraDB vector memory.
            </p>
            <div className="pt-1 text-[11px] font-mono text-black font-bold">
              MIT License • Built by Samarth Nimangre
            </div>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-black font-oswald block mb-3">
              Platform &amp; Architecture
            </span>
            <ul className="space-y-2 text-xs font-medium">
              <li>
                <a href="#studio" className="text-black hover:text-emerald-700 transition-colors">
                  Interactive Live Studio
                </a>
              </li>
              <li>
                <a href="#industries" className="text-black hover:text-emerald-700 transition-colors">
                  8 Industry Verticals
                </a>
              </li>
              <li>
                <a href="#architecture" className="text-black hover:text-emerald-700 transition-colors">
                  Vani + Edge Paradigm
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-black hover:text-emerald-700 transition-colors">
                  Commercial Pricing
                </a>
              </li>
              <li>
                <a href="#faq" className="text-black hover:text-emerald-700 transition-colors">
                  Frequently Asked Questions
                </a>
              </li>
            </ul>
          </div>

          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-black font-oswald block mb-3">
              Developer Endpoints
            </span>
            <ul className="space-y-2 text-xs font-mono font-bold">
              <li>
                <a
                  href="/api/health"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>/api/health</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="/api/metrics?format=prometheus"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>/api/metrics</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="/api/dispatch"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>/api/dispatch</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="/api/query"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>/api/query</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/Sam-CodesAI/VaniEdge-Voice-Platform"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>GitHub Repository</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
              <li>
                <a
                  href="https://sam-codes.vercel.app"
                  target="_blank"
                  rel="noreferrer"
                  className="text-black hover:text-emerald-700 transition-colors flex items-center gap-1"
                >
                  <span>Architect Portfolio</span>
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-black font-medium">
          <div className="flex items-center gap-1">
            <span>Built with precision for 2026 voice commerce. Zero dropped calls guaranteed.</span>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://t.me/Samarth1306" target="_blank" rel="noreferrer" className="text-black hover:underline font-bold">
              Telegram Direct Desk
            </a>
            <span>•</span>
            <a href="https://vaniedge.vercel.app" className="text-black hover:underline font-bold">
              vaniedge.vercel.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
