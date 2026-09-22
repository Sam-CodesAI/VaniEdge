"use client";

import React, { useState } from "react";
import { Check, Sparkles, Phone, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function PricingSection() {
  const [isAnnual, setIsAnnual] = useState<boolean>(true);

  const plans = [
    {
      name: "Local Starter",
      badge: "Single Location",
      monthlyPrice: 49,
      annualPrice: 39,
      description: "Ideal for clinics, cloud kitchens, and local service providers replacing voicemail.",
      features: [
        "1 Dedicated Inbound Telephony Number",
        "500 Minutes Voice AI Handling / month",
        "Sub-12ms SutraDB Local Vector Memory",
        "All 8 Turnkey Industry Personas",
        "Automated Multi-Lingual SMS Dispatch",
        "Web Telephony Studio & Voice Orb Access",
        "Standard Community Support",
      ],
      ctaText: "Deploy Starter Line",
      ctaLink: "https://t.me/Samarth1306?text=Hi%20Samarth,%20I%20want%20to%20deploy%20the%20VaniEdge%20Starter%20plan.",
      highlight: false,
    },
    {
      name: "Growth Business",
      badge: "Most Popular",
      monthlyPrice: 149,
      annualPrice: 119,
      description: "For busy clinics, automotive rescue dispatchers, and growing restaurant chains.",
      features: [
        "3 Dedicated Inbound Telephony Numbers",
        "2,500 Minutes Voice AI Handling / month",
        "Sub-1,200ms Telephony Failover Watchdog",
        "Zero-Dropped-Calls Carrier Guarantee",
        "Custom SutraDB Domain Knowledge Ingestion",
        "Full Indic Regional Multi-Lingual Engine",
        "Custom ElevenLabs Voice Model Cloning",
        "Direct Priority Telegram Channel Support",
      ],
      ctaText: "Claim Growth Suite",
      ctaLink: "https://t.me/Samarth1306?text=Hi%20Samarth,%20I%20want%20the%20VaniEdge%20Growth%20Business%20plan%20with%20Failover.",
      highlight: true,
    },
    {
      name: "Enterprise Carrier",
      badge: "High Availability",
      monthlyPrice: 499,
      annualPrice: 399,
      description: "For high-volume contact centers, hotel chains, and multi-state enterprise dispatch.",
      features: [
        "Unlimited SIP Trunking & Phone Numbers",
        "10,000+ Minutes High-Concurrency Quota",
        "Multi-Region Edge Failover Mesh",
        "Dedicated Carrier Interconnect Bridge",
        "Custom CRM & POS Two-Way Webhook Integration",
        "99.99% Guaranteed SLA Uptime Contract",
        "Dedicated Solutions Engineer & Custom Models",
      ],
      ctaText: "Contact Enterprise Desk",
      ctaLink: "https://t.me/Samarth1306?text=Hi%20Samarth,%20I%20need%20the%20VaniEdge%20Enterprise%20Carrier%20infrastructure.",
      highlight: false,
    },
  ];

  return (
    <section id="pricing" className="py-16 sm:py-24 border-b border-slate-800/80 bg-[#060910] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-3">
            <Zap className="w-3.5 h-3.5" />
            <span>TRANSPARENT 2026 COMMERCIAL TIERS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Transparent Pricing. Zero Hidden Fees.
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium">
            Every plan includes our sub-second telephony runtime, embedded SutraDB vector memory, and multi-lingual dispatch.
          </p>

          {/* Billing Switcher Toggle */}
          <div className="mt-6 inline-flex items-center gap-3 p-1 rounded-xl bg-slate-900 border border-slate-700">
            <button
              type="button"
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                !isAnnual ? "bg-slate-800 text-white shadow-sm" : "text-slate-300 hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                isAnnual
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-md font-bold"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/30 text-black font-bold uppercase tracking-wider">
                Save 20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
          {plans.map((plan, idx) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <div
                key={idx}
                className={`rounded-2xl p-6 sm:p-8 flex flex-col justify-between transition-all duration-200 relative ${
                  plan.highlight
                    ? "bg-gradient-to-b from-slate-900 via-[#0b1322] to-slate-950 border-2 border-emerald-500 shadow-[0_0_35px_rgba(16,185,129,0.25)] ring-1 ring-emerald-400/40"
                    : "bg-slate-900 border border-slate-700/80 shadow-lg"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-emerald-500 text-slate-950 text-xs font-black uppercase tracking-wider shadow-md">
                    {plan.badge}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    {!plan.highlight && (
                      <span className="text-xs font-mono text-slate-200 px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
                        {plan.badge}
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-slate-200 leading-relaxed min-h-[38px] font-normal">
                    {plan.description}
                  </p>

                  <div className="mt-6 mb-6 pb-6 border-b border-slate-800">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-4xl sm:text-5xl font-black text-white font-mono">
                        ${price}
                      </span>
                      <span className="text-slate-300 text-xs font-medium">/ month</span>
                    </div>
                    <span className="text-xs text-slate-300 block mt-1">
                      {isAnnual ? "Billed annually ($" + price * 12 + "/yr)" : "Billed monthly"}
                    </span>
                  </div>

                  <div className="space-y-3 mb-8">
                    <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-semibold block">
                      Everything included:
                    </span>
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-200 font-normal">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <a
                  href={plan.ctaLink}
                  target="_blank"
                  rel="noreferrer"
                  className={`w-full py-3.5 rounded-xl text-center font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                    plan.highlight
                      ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:brightness-110 active:scale-98"
                      : "bg-slate-800 hover:bg-slate-700 text-white hover:border-slate-500 border border-slate-700 active:scale-98"
                  }`}
                >
                  <span>{plan.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </a>
              </div>
            );
          })}
        </div>

        {/* Footnote Assurance */}
        <div className="mt-12 text-center text-xs text-slate-300 flex flex-wrap items-center justify-center gap-6 font-medium">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            24-Hour Deployment Guarantee
          </span>
          <span className="flex items-center gap-1.5">
            <Phone className="w-4 h-4 text-cyan-400" />
            Keep Your Existing Business Phone Number
          </span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            No Long-Term Contracts • Cancel Anytime
          </span>
        </div>
      </div>
    </section>
  );
}
