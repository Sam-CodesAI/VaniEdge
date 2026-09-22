"use client";

import React, { useState } from "react";
import {
  Sparkles,
  ArrowRight,
  PhoneCall,
  CheckCircle2,
  Building2,
  UtensilsCrossed,
  Truck,
  ShoppingBag,
  Home,
  CreditCard,
  Hotel,
  Headphones,
} from "lucide-react";
import { AVAILABLE_CATEGORIES, BusinessCategory } from "./VaniStudioView";

interface IndustrySolutionsSectionProps {
  onSelectCategory: (id: BusinessCategory) => void;
}

export default function IndustrySolutionsSection({
  onSelectCategory,
}: IndustrySolutionsSectionProps) {
  const [activeTab, setActiveTab] = useState<BusinessCategory>("clinic");

  const categoryDetails: Record<
    BusinessCategory,
    {
      iconComp: React.ReactNode;
      headline: string;
      capabilities: string[];
      roiMetric: string;
      sampleDialogue: { user: string; agent: string };
    }
  > = {
    clinic: {
      iconComp: <Building2 className="w-5 h-5 text-emerald-400" />,
      headline: "Healthcare Triage & Patient Slot Scheduling",
      capabilities: [
        "Patient symptom intake & urgency triage",
        "Automated doctor slot booking with 1-hr advance confirmation",
        "Transparent consultation fee & emergency contact broadcast",
        "Zero hold-time receptionist answering during peak surgery hours",
      ],
      roiMetric: "82% reduction in clinic receptionist overhead",
      sampleDialogue: {
        user: "Doctor, can I get an appointment with the pediatrician for tomorrow at 11am?",
        agent: "Namaste! Dr. Sharma's clinic has confirmed your pediatric consultation for tomorrow at 11:00 AM. A confirmation ticket has been dispatched to your mobile.",
      },
    },
    restaurant: {
      iconComp: <UtensilsCrossed className="w-5 h-5 text-amber-400" />,
      headline: "Cloud Kitchen Ordering & Table Reservations",
      capabilities: [
        "Instant takeaway order intake (Special Thali, Biryani, Dosa)",
        "Delivery address confirmation with 4km free-delivery validation",
        "Table reservation holds and peak-hour party booking",
        "Real-time kitchen order ticket dispatch directly to chef terminals",
      ],
      roiMetric: "35% increase in dinner phone order fulfillment",
      sampleDialogue: {
        user: "I'd like to order 2 Special North Indian Thalis to Indiranagar.",
        agent: "Namaste! Your order for 2 Special Thalis (₹280) is confirmed with free delivery. Our kitchen has begun preparation and delivery will arrive in 30 minutes.",
      },
    },
    auto: {
      iconComp: <Truck className="w-5 h-5 text-rose-400" />,
      headline: "24/7 Roadside Emergency & Flatbed Tow Dispatch",
      capabilities: [
        "Instant GPS mile marker & breakdown location logging",
        "High-priority escalation for highway breakdowns & engine stalls",
        "Transparent upfront pricing (tyre change ₹400, jumpstart ₹350, tow ₹1500)",
        "Real-time recovery crew vehicle dispatch with 18-minute SLA",
      ],
      roiMetric: "Sub-20s dispatch dispatch response vs 10m call wait",
      sampleDialogue: {
        user: "My car broke down on Highway 44 with a flat tyre, I need help immediately!",
        agent: "Emergency assistance activated! Our recovery vehicle has been dispatched to your Highway 44 location with an estimated arrival time of 18 minutes. Please stay safe inside the vehicle.",
      },
    },
    retail: {
      iconComp: <ShoppingBag className="w-5 h-5 text-cyan-400" />,
      headline: "Order Tracking, 30-Day Returns & Inventory Inquiries",
      capabilities: [
        "Instant tracking lookup for shipping and delivery estimates",
        "30-day return policy validation and refund slip generation",
        "Real-time in-store stock availability across sizes and colors",
        "Automated warranty claim verification with invoice proof",
      ],
      roiMetric: "90% resolution of Tier-1 post-purchase inquiries",
      sampleDialogue: {
        user: "Can I return an unworn jacket I ordered last week?",
        agent: "Hello! PrimeGoods offers hassle-free 30-day returns on all unworn items. I have initiated your return authorization slip and sent return label details to your phone.",
      },
    },
    realestate: {
      iconComp: <Home className="w-5 h-5 text-indigo-400" />,
      headline: "Apartment Leasing & Guided Site Tour Scheduling",
      capabilities: [
        "2 BHK & 3 BHK rental rates, floor plan specs & amenities",
        "Guided apartment site tour booking Tuesday through Sunday",
        "Security deposit, lease tenure & escalation policy explanation",
        "In-house maintenance ticket routing for existing tenants",
      ],
      roiMetric: "4x increase in verified weekend apartment site viewings",
      sampleDialogue: {
        user: "Are there any 2 BHK apartments available for rent this weekend?",
        agent: "Welcome to Skyline Realty! We have premium 2 BHK units starting at ₹42,000/month. I can schedule a private guided viewing for you this Saturday at 11:30 AM. Would that work?",
      },
    },
    finance: {
      iconComp: <CreditCard className="w-5 h-5 text-emerald-400" />,
      headline: "Banking Balance, Card Freeze & Loan Inquiries",
      capabilities: [
        "Voice-verified real-time balance & last 5 transactions check",
        "24/7 instant card freezing for lost or stolen debit/credit cards",
        "Home, auto & personal loan interest rates & EMI calculation",
        "Zero-liability fraud reporting protocol with immediate agent alert",
      ],
      roiMetric: "Instant fraud containment & sub-second verification",
      sampleDialogue: {
        user: "I lost my debit card, please freeze it immediately!",
        agent: "Understood! Your card ending in 4102 has been frozen immediately across all ATM, POS, and online gateways. A fraud prevention ticket has been opened for replacement.",
      },
    },
    hospitality: {
      iconComp: <Hotel className="w-5 h-5 text-amber-300" />,
      headline: "Hotel Suites, Check-in Amenities & Airport Shuttle",
      capabilities: [
        "Deluxe King room & Executive ocean-view suite reservations",
        "Check-in (2:00 PM) & check-out (11:00 AM) policy explanations",
        "24-hour roundtrip airport luxury shuttle booking",
        "Complimentary breakfast buffet hours & rooftop dining holds",
      ],
      roiMetric: "100% after-hours front desk reservation capture",
      sampleDialogue: {
        user: "Does your room rate include breakfast buffet and airport pickup?",
        agent: "Yes! All Deluxe and Executive rooms include our complimentary rooftop breakfast buffet from 6:30 AM to 10:30 AM. 24-hour airport shuttle is available on request.",
      },
    },
    general: {
      iconComp: <Headphones className="w-5 h-5 text-teal-400" />,
      headline: "24/7 Inbound Concierge & 15-Minute Callback SLA",
      capabilities: [
        "Intelligent department routing for enterprise callers",
        "Guaranteed 15-minute senior specialist callback scheduling",
        "Billing dispute, invoice copy & ticket status lookups",
        "Urgent complaint escalation with automated SMS tracking",
      ],
      roiMetric: "Zero abandoned calls across corporate phone lines",
      sampleDialogue: {
        user: "I have an urgent enterprise billing inquiry, who can help me?",
        agent: "I have recorded your billing inquiry and assigned ticket VANI-GEN-4902 with high priority. Our senior accounts specialist will call you back within 15 minutes.",
      },
    },
  };

  const activeData = categoryDetails[activeTab];

  return (
    <section id="industries" className="py-16 sm:py-24 border-b border-slate-800/80 bg-[#070b12] relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>8 TURNKEY ENTERPRISE VERTICALS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Specialized Voice AI for Every Local Industry
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium">
            Click any sector to inspect its domain knowledge model, real-time extraction rules, and live conversation flow.
          </p>
        </div>

        {/* 8-Tab Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isCurrent = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => {
                  setActiveTab(cat.id);
                  onSelectCategory(cat.id);
                }}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-cyan-500/25 text-cyan-200 border border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.3)] font-bold"
                    : "bg-slate-900 text-slate-300 border border-slate-700/80 hover:text-white hover:border-slate-500"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label.split(" ")[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Active Industry Deep-Dive Card */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-900 via-[#0a101b] to-slate-950 border border-slate-700/80 p-6 sm:p-10 shadow-2xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-800 border border-slate-700">
                  {activeData.iconComp}
                </div>
                <div>
                  <span className="text-xs font-mono text-cyan-300 uppercase tracking-wider font-bold">
                    Turnkey Industry Agent
                  </span>
                  <h3 className="text-xl sm:text-2xl font-bold text-white">
                    {activeData.headline}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {activeData.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-slate-200 font-normal">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <div className="px-3.5 py-2 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-xs font-mono font-semibold">
                  📈 Business Impact: {activeData.roiMetric}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(activeTab);
                    const el = document.getElementById("studio");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <span>Test in Live Studio</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Dialogue Preview Mockup */}
            <div className="lg:col-span-5 bg-[#05080e] border border-slate-700/80 rounded-xl p-5 space-y-3 font-sans shadow-inner">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-xs text-slate-300 font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Live Call Audio Preview
                </span>
                <span className="text-slate-300">Latency: 11.2ms</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Caller Message */}
                <div className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-indigo-500/25 text-indigo-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    Caller
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-700/80 text-slate-100 leading-relaxed flex-1">
                    "{activeData.sampleDialogue.user}"
                  </div>
                </div>

                {/* VaniEdge Agent Message */}
                <div className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-emerald-500/25 text-emerald-300 flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5">
                    Vani
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-50 leading-relaxed flex-1 font-medium">
                    "{activeData.sampleDialogue.agent}"
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
