"use client";

import React, { useState } from "react";
import {
  X,
  Sparkles,
  Bot,
  Building2,
  Clock,
  Phone,
  ArrowRight,
  ArrowLeft,
  Check,
  Globe2,
  FileText,
  ShieldCheck,
  Send,
} from "lucide-react";
import { BusinessCategory, AVAILABLE_CATEGORIES } from "./VaniStudioView";

interface VerticalCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeployToStudio: (config: {
    category: BusinessCategory;
    businessName: string;
    language: string;
    operatingHours: string;
    servicesText: string;
  }) => void;
}

export default function VerticalCustomizerModal({
  isOpen,
  onClose,
  onDeployToStudio,
}: VerticalCustomizerModalProps) {
  const [step, setStep] = useState<number>(1);
  const [selectedCategory, setSelectedCategory] = useState<BusinessCategory>("clinic");
  const [businessName, setBusinessName] = useState<string>("Dr. Sharma Healthcare & Clinic");
  const [operatingHours, setOperatingHours] = useState<string>("9:00 AM - 8:30 PM (Mon - Sat)");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("hi");
  const [servicesText, setServicesText] = useState<string>(
    "General Consultation: ₹500, Specialist Cardiology: ₹900, Walk-in Triage accepted until 7 PM."
  );
  const [escalationPhone, setEscalationPhone] = useState<string>("+91 98450 12345");

  if (!isOpen) return null;

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  const handleFinishDeploy = () => {
    onDeployToStudio({
      category: selectedCategory,
      businessName,
      language: selectedLanguage,
      operatingHours,
      servicesText,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0b121e] border border-slate-700 rounded-2xl shadow-2xl p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>60-SECOND AGENT CUSTOMIZER WIZARD</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            Tailor Your 24/7 Autonomous Voice Receptionist
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure your brand, services, operating hours, and Indic language model in 3 simple steps.
          </p>
        </div>

        {/* Step Progression Bar */}
        <div className="grid grid-cols-3 gap-2">
          <div
            className={`h-1.5 rounded-full transition-all ${
              step >= 1 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              step >= 2 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-800"
            }`}
          />
          <div
            className={`h-1.5 rounded-full transition-all ${
              step >= 3 ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-800"
            }`}
          />
        </div>

        {/* STEP 1: BUSINESS IDENTITY & CATEGORY */}
        {step === 1 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                1. Your Business or Practice Name
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder="e.g. Apex Health Clinic, Royal Biryani Express..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-2">
                2. Select Industry Vertical
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const isSel = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setSelectedCategory(cat.id)}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        isSel
                          ? "bg-slate-800 border-cyan-400 text-white shadow-[0_0_15px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50"
                          : "bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                      }`}
                    >
                      <div className="text-xl mb-1">{cat.icon}</div>
                      <div className="text-xs font-bold text-slate-100 truncate">{cat.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: OPERATIONAL HOURS & REGIONAL LANGUAGE */}
        {step === 2 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                1. Business Operating Hours
              </label>
              <input
                type="text"
                value={operatingHours}
                onChange={(e) => setOperatingHours(e.target.value)}
                placeholder="e.g. 9:00 AM - 9:00 PM (Monday - Sunday)"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                After-hours callers are politely informed of timings and their callback request is logged.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                2. Primary Voice Dialect
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { code: "hi", label: "हिंदी (Hindi)" },
                  { code: "kn", label: "ಕನ್ನಡ (Kannada)" },
                  { code: "en", label: "English (India)" },
                  { code: "mr", label: "मराठी (Marathi)" },
                  { code: "ta", label: "தமிழ் (Tamil)" },
                  { code: "es", label: "Español (Spanish)" },
                ].map((lang) => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => setSelectedLanguage(lang.code)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all cursor-pointer text-center ${
                      selectedLanguage === lang.code
                        ? "bg-emerald-950/60 border-emerald-400 text-emerald-300 font-bold"
                        : "bg-slate-900 border-slate-800 text-slate-400 hover:text-white"
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                3. Manager Escalation Phone (For SMS Alerts)
              </label>
              <input
                type="tel"
                value={escalationPhone}
                onChange={(e) => setEscalationPhone(e.target.value)}
                placeholder="+91 98450 12345"
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition-colors font-mono"
              />
            </div>
          </div>
        )}

        {/* STEP 3: SERVICES, PRICING & DEPLOY */}
        {step === 3 && (
          <div className="space-y-4 animate-in fade-in">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Custom Services, Fees &amp; FAQs for SutraDB
              </label>
              <textarea
                rows={3}
                value={servicesText}
                onChange={(e) => setServicesText(e.target.value)}
                placeholder="List your key offerings, prices, walk-in rules or menu specials..."
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-400 transition-colors"
              />
              <span className="text-[11px] text-slate-400 mt-1 block">
                These rules are vectorized instantly into SutraDB memory for sub-15ms caller retrieval.
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
              <div className="font-bold text-slate-200 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Configuration Ready for Live Simulation</span>
              </div>
              <div className="text-slate-400 grid grid-cols-2 gap-2 text-[11px] font-mono">
                <div>• Brand: <span className="text-white">{businessName}</span></div>
                <div>• Vertical: <span className="text-cyan-300">{selectedCategory}</span></div>
                <div>• Dialect: <span className="text-emerald-300">{selectedLanguage.toUpperCase()}</span></div>
                <div>• Hours: <span className="text-slate-300">{operatingHours}</span></div>
              </div>
            </div>
          </div>
        )}

        {/* Footer Navigation Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-800">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md"
            >
              <span>Next Step</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleFinishDeploy}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-md active:scale-95"
              >
                <Bot className="w-4 h-4" />
                <span>Deploy &amp; Test in Studio</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
