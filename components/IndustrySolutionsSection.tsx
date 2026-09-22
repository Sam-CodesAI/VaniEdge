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
      iconComp: <Building2 className="w-5 h-5 text-emerald-700" />,
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
      iconComp: <UtensilsCrossed className="w-5 h-5 text-amber-700" />,
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
      iconComp: <Truck className="w-5 h-5 text-rose-700" />,
      headline: "24/7 Roadside Emergency & Flatbed Tow Dispatch",
      capabilities: [
        "Instant GPS mile marker & breakdown location logging",
        "High-priority escalation for highway breakdowns & engine stalls",
        "Transparent upfront pricing (tyre change ₹400, jumpstart ₹350, tow ₹1500)",
        "Real-time recovery crew vehicle dispatch with 18-minute SLA",
      ],
      roiMetric: "Sub-20s dispatch response vs 10m call wait",
      sampleDialogue: {
        user: "My car broke down on Highway 44 with a flat tyre, I need help immediately!",
        agent: "Emergency assistance activated! Our recovery vehicle has been dispatched to your Highway 44 location with an estimated arrival time of 18 minutes. Please stay safe inside the vehicle.",
      },
    },
    retail: {
      iconComp: <ShoppingBag className="w-5 h-5 text-cyan-700" />,
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
      iconComp: <Home className="w-5 h-5 text-indigo-700" />,
      headline: "Apartment Viewings, Leasing Inquiries & Maintenance",
      capabilities: [
        "Automated appointment booking for 2BHK/3BHK property walkthroughs",
        "Instant rental pricing, security deposit, and floor-plan SMS delivery",
        "Tenant maintenance log dispatch (urgent plumbing/electrical)",
        "Pre-screening buyer budget and preferred move-in dates",
      ],
      roiMetric: "4x increase in weekend site visit bookings",
      sampleDialogue: {
        user: "Are 3BHK flats available for lease this weekend in Koramangala?",
        agent: "Yes, Skyline Realty has 2 premium 3BHK flats open for viewing this Saturday. Would you prefer a 10:00 AM or 3:00 PM private tour slot?",
      },
    },
    finance: {
      iconComp: <CreditCard className="w-5 h-5 text-emerald-700" />,
      headline: "Account Balances, Loan Status & Lost Card Freezing",
      capabilities: [
        "Emergency instant card-freeze via two-factor voice challenge",
        "Home/Auto loan application status check with lead CRM update",
        "Branch operating hours, IFSC codes, and appointment scheduling",
        "Cryptographic compliance recording with zero PII retention",
      ],
      roiMetric: "100% elimination of lost-card panic hold times",
      sampleDialogue: {
        user: "I lost my debit card, please help me freeze it right away!",
        agent: "Card security protocol initiated immediately. A one-time security OTP has been sent to your registered mobile. Once verified, your card will be instantly locked.",
      },
    },
    hospitality: {
      iconComp: <Hotel className="w-5 h-5 text-amber-700" />,
      headline: "Suite Reservations, Check-in Concierge & Transfers",
      capabilities: [
        "Direct reservation intake with room upgrade recommendations",
        "Airport pick-up/drop shuttle scheduling with driver SMS link",
        "Late check-in coordination and complimentary breakfast logs",
        "Local tourist attraction guidance and curated dining bookings",
      ],
      roiMetric: "28% higher direct booking conversion vs OTAs",
      sampleDialogue: {
        user: "Do you have a deluxe king suite available for tonight?",
        agent: "Welcome to Grand Horizon Suites! We have 1 Deluxe King Suite available for tonight with complimentary breakfast and free airport shuttle included.",
      },
    },
    general: {
      iconComp: <Headphones className="w-5 h-5 text-cyan-700" />,
      headline: "24/7 Sovereign Reception & Urgent Callback Routing",
      capabilities: [
        "Always-on inbound phone coverage eliminating missed business leads",
        "Department-specific call routing and executive voicemail triage",
        "Automated CRM ticket logging with audio snippet attachments",
        "Multi-lingual operator support for pan-regional customer bases",
      ],
      roiMetric: "Zero unanswered inbound business inquiries",
      sampleDialogue: {
        user: "Can I speak to someone in enterprise partnerships?",
        agent: "Certainly! I have recorded your enterprise inquiry and notified our partnerships director. You will receive an immediate callback within 15 minutes.",
      },
    },
  };

  const activeData = categoryDetails[activeTab];

  return (
    <section id="industries" className="py-16 sm:py-24 border-b border-slate-200 bg-slate-50/50 relative">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header in Oswald & Black Text */}
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-100 border border-slate-300 text-black text-xs font-oswald uppercase tracking-wider font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>TURNKEY VERTICAL RECEPTIONISTS</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-black font-oswald uppercase tracking-tight">
            Tailored Voice AI for Every Industry
          </h2>
          <p className="mt-3 text-base sm:text-lg text-black font-medium">
            Pre-trained on industry vocabulary, specialized workflows, and localized regional compliance rules.
          </p>
        </div>

        {/* Industry Pill Selector Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {AVAILABLE_CATEGORIES.map((cat) => {
            const isSelected = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`p-3.5 rounded-xl border-2 text-left transition-all cursor-pointer flex items-center gap-3 ${
                  isSelected
                    ? "bg-white text-black border-emerald-600 shadow-md ring-1 ring-emerald-600"
                    : "bg-white text-black border-slate-200 hover:border-slate-400 hover:bg-slate-50 shadow-sm"
                }`}
              >
                <span className="text-2xl shrink-0">{cat.icon}</span>
                <div className="flex flex-col min-w-0">
                  <span className="truncate font-bold text-black text-xs font-oswald uppercase">
                    {cat.label}
                  </span>
                  <span className="text-[11px] text-slate-700 truncate font-normal">
                    {cat.shortDesc}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Industry Deep-Dive Card */}
        <div className="rounded-2xl bg-white border-2 border-slate-200 p-6 sm:p-10 shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Info Column */}
            <div className="lg:col-span-7 space-y-5">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-xl bg-slate-100 border border-slate-200">
                  {activeData.iconComp}
                </div>
                <div>
                  <span className="text-xs font-oswald uppercase text-emerald-800 tracking-wider font-bold block">
                    Turnkey Industry Agent
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-bold text-black font-oswald uppercase">
                    {activeData.headline}
                  </h3>
                </div>
              </div>

              <div className="space-y-2.5 pt-2">
                {activeData.capabilities.map((cap, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 text-sm text-black font-medium">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{cap}</span>
                  </div>
                ))}
              </div>

              <div className="pt-3 flex flex-wrap items-center gap-4">
                <div className="px-4 py-2 rounded-lg bg-emerald-50 border border-emerald-300 text-black text-xs font-mono font-bold">
                  📈 Business Impact: {activeData.roiMetric}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCategory(activeTab);
                    const el = document.getElementById("studio");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }}
                  className="px-5 py-2.5 rounded-lg bg-black hover:bg-slate-800 text-white text-xs font-bold font-oswald uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <span>Test in Live Studio</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Dialogue Preview Mockup */}
            <div className="lg:col-span-5 bg-slate-50 border-2 border-slate-200 rounded-xl p-5 space-y-3 font-sans shadow-sm">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs text-black font-mono font-bold">
                <span className="flex items-center gap-1.5 text-emerald-800 font-bold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Call Audio Preview
                </span>
                <span className="text-black">Latency: 11.2ms</span>
              </div>

              <div className="space-y-3 pt-1">
                {/* Caller Message */}
                <div className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-slate-200 text-black flex items-center justify-center font-bold font-oswald text-[10px] shrink-0 mt-0.5">
                    Caller
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200 text-black leading-relaxed flex-1 font-medium shadow-sm">
                    "{activeData.sampleDialogue.user}"
                  </div>
                </div>

                {/* VaniEdge Agent Message */}
                <div className="flex items-start gap-2 text-xs">
                  <div className="h-6 w-6 rounded-full bg-black text-white flex items-center justify-center font-bold font-oswald text-[10px] shrink-0 mt-0.5">
                    Vani
                  </div>
                  <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-black leading-relaxed flex-1 font-medium shadow-sm">
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
