"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs: FaqItem[] = [
    {
      question: "What makes VaniEdge Voice Platform fundamentally different from standard cloud voice bots?",
      answer:
        "Standard cloud voice bots bounce your customer's audio through multiple centralized US data centers, adding 2.5 to 5+ seconds of latency and frequently dropping calls when an LLM or speech API rate-limits. VaniEdge runs on distributed edge workers, streams raw audio directly via WebSocket carrier interconnects, and operates an atomic sub-1,200ms failover watchdog that guarantees 100% call continuity with zero dropped calls.",
    },
    {
      question: "How does the Zero-Dropped-Call Failover Watchdog work in real time?",
      answer:
        "Every incoming call is supervised by a 100ms interval watchdog timer. If an upstream language model or speech generation endpoint fails to produce audio within 1,200ms of the caller stopping speaking (or 1,500ms conversational TTFT), VaniEdge instantly flushes the buffer and executes an atomic Twilio REST redirect (<20ms) to your human backup line or specialist with polite holding audio. The caller never hears silence or a dead tone.",
    },
    {
      question: "Which languages and regional Indian accents are natively supported?",
      answer:
        "VaniEdge natively supports English, Hindi (हिंदी), Kannada (ಕನ್ನಡ), Marathi (मराठी), Tamil (தமிழ்), and Spanish (Español). The engine automatically parses mixed colloquial queries (e.g. Hinglish or Kannada-English), understands localized phonetic names, and synthesizes natural regional voice responses tailored to your local geography.",
    },
    {
      question: "Can we keep our existing business phone number?",
      answer:
        "Yes! You can either use our dedicated enterprise phone number directly or set up simple call forwarding from your existing carrier (Jio, Airtel, Vodafone, AT&T, Verizon) to your dedicated VaniEdge line. No hardware changes or new SIM cards are required.",
    },
    {
      question: "What is SutraDB and why does it eliminate vector cloud bills?",
      answer:
        "SutraDB is our custom ultra-lightweight hybrid vector engine built specifically for edge runtimes. It executes Reciprocal Rank Fusion combining 60% Dense Semantic Vector embeddings with 40% BM25 Lexical text matching in under 12ms with zero external cloud dependencies. This eliminates $70+/month SaaS bills for Pinecone or Weaviate while delivering faster responses.",
    },
    {
      question: "How fast can my business go live with a custom answering agent?",
      answer:
        "You can be fully live in under 24 hours. We ingest your business services, FAQs, hours, and pricing into SutraDB, assign your dedicated local phone line, configure the SMS dispatch templates, and run test verification before handing over the line.",
    },
  ];

  return (
    <section id="faq" className="py-16 sm:py-24 border-b border-slate-800/80 bg-[#070b12] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900 border border-slate-700 text-slate-200 text-xs font-mono font-semibold mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400" />
            <span>FREQUENTLY ASKED QUESTIONS</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Everything You Need to Know
          </h2>
          <p className="mt-3 text-base sm:text-lg text-slate-200 font-medium">
            Got questions about edge failover, regional languages, or deployment? We've got answers.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-xl bg-slate-900 border border-slate-700/80 overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-white hover:text-cyan-300 transition-colors cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-300 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-cyan-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-slate-200 leading-relaxed border-t border-slate-800 pt-3.5 font-normal">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
