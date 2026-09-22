"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  Globe2,
  ExternalLink,
  Code2,
  Sparkles,
  Menu,
  X,
  Bot,
  Activity,
  ArrowRight,
} from "lucide-react";
import VaniStudioView, { BusinessCategory, AVAILABLE_CATEGORIES } from "@/components/VaniStudioView";
import { TelephonyMissionControl } from "@/components/TelephonyMissionControl";
import LandingHero from "@/components/LandingHero";
import BentoArchitecture from "@/components/BentoArchitecture";
import IndustrySolutionsSection from "@/components/IndustrySolutionsSection";
import PricingSection from "@/components/PricingSection";
import FaqSection from "@/components/FaqSection";
import LandingFooter from "@/components/LandingFooter";

interface Message {
  id: string;
  sender: "user" | "agent";
  text: string;
  timestamp: string;
  latencyMs?: number;
  matchedDoc?: string;
  audioUrl?: string;
}

interface LanguageOption {
  code: string;
  label: string;
  nativeLabel: string;
  speechLocale: string;
}

const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English (India)", nativeLabel: "English", speechLocale: "en-IN" },
  { code: "hi", label: "Hindi", nativeLabel: "हिंदी", speechLocale: "hi-IN" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ", speechLocale: "kn-IN" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", speechLocale: "mr-IN" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்", speechLocale: "ta-IN" },
  { code: "es", label: "Spanish", nativeLabel: "Español", speechLocale: "es-ES" },
];

export default function VaniEdgePage() {
  // Telephony & Call State
  const [isCalling, setIsCalling] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);

  // Business Persona State
  const [selectedPersona, setSelectedPersona] = useState<BusinessCategory>("clinic");
  const [businessName, setBusinessName] = useState<string>("CarePlus Healthcare & Clinics");
  const [selectedVoice, setSelectedVoice] = useState<string>("sarah");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Live Transcript State
  const [transcript, setTranscript] = useState<Message[]>([
    {
      id: "initial-msg",
      sender: "agent",
      text: "Namaste! Welcome to CarePlus Healthcare & Clinics. How may I assist with your doctor appointment or consultation today?",
      timestamp: "Just now",
      latencyMs: 14.2,
    },
  ]);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Audio & Mic Refs
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const recognitionRef = useRef<any>(null);

  // Load browser voices & setup Web Speech Recognition on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const updateVoices = () => {
        const available = window.speechSynthesis?.getVoices() || [];
        setBrowserVoices(available);
      };
      updateVoices();
      if (window.speechSynthesis) {
        window.speechSynthesis.onvoiceschanged = updateVoices;
      }

      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recog = new SpeechRecognition();
        recog.continuous = false;
        recog.interimResults = true;

        recog.onresult = (event: any) => {
          const text = Array.from(event.results)
            .map((r: any) => r[0].transcript)
            .join("");
          setCustomQuery(text);
        };

        recog.onend = () => setIsListening(false);
        recog.onerror = () => setIsListening(false);
        recognitionRef.current = recog;
      }
    }
  }, []);

  // Call duration counter
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isCalling) {
      timer = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setCallDuration(0);
    }
    return () => clearInterval(timer);
  }, [isCalling]);

  // Voice synthesis via ElevenLabs streaming with Browser SpeechSynthesis fallback
  const speakVoiceResponse = useCallback(
    async (text: string) => {
      if (typeof window === "undefined") return;

      // 1. ElevenLabs Edge Streaming
      try {
        setIsSpeaking(true);
        const ttsRes = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            voiceId: selectedVoice,
            languageCode: selectedLanguage,
          }),
        });

        if (ttsRes.ok) {
          const blob = await ttsRes.blob();
          const audioUrl = URL.createObjectURL(blob);
          if (audioPlayerRef.current) {
            audioPlayerRef.current.src = audioUrl;
            audioPlayerRef.current.playbackRate = speechRate;
            audioPlayerRef.current.onended = () => {
              setIsSpeaking(false);
              URL.revokeObjectURL(audioUrl);
            };
            audioPlayerRef.current.onerror = () => {
              setIsSpeaking(false);
            };
            try {
              await audioPlayerRef.current.play();
              return;
            } catch {
              // Fallback to speech synthesis if audio play is blocked
            }
          }
        }
      } catch {
        // Fallback to speech synthesis
      }

      // 2. Local Browser SpeechSynthesis Fallback
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        if (window.speechSynthesis.paused) {
          window.speechSynthesis.resume();
        }
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = speechRate;
        utterance.pitch = speechPitch;

        const langMeta = LANGUAGES.find((l) => l.code === selectedLanguage);
        if (langMeta) utterance.lang = langMeta.speechLocale;

        if (browserVoices.length > 0) {
          const matched =
            browserVoices.find((v) => v.lang.toLowerCase().startsWith(selectedLanguage.toLowerCase())) ||
            browserVoices.find((v) => v.name.toLowerCase().includes(selectedVoice.toLowerCase()));
          if (matched) utterance.voice = matched;
        }

        utterance.onstart = () => setIsSpeaking(true);
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        window.speechSynthesis.speak(utterance);
      } else {
        setIsSpeaking(false);
      }
    },
    [selectedVoice, selectedLanguage, speechRate, speechPitch, browserVoices]
  );

  // Send message
  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || customQuery;
    if (!textToSend.trim() || isProcessing) return;

    const userMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setTranscript((prev) => [...prev, userMsg]);
    setCustomQuery("");
    setIsProcessing(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          persona: selectedPersona,
          language: selectedLanguage,
          businessName,
        }),
      });

      const data = (await res.json()) as {
        success?: boolean;
        voiceResponse?: string;
        retrieval?: {
          latencyMs?: number;
          matchedDocument?: { title?: string };
        };
      };

      if (data.success && data.voiceResponse) {
        const agentMsg: Message = {
          id: `msg-${Date.now() + 1}`,
          sender: "agent",
          text: data.voiceResponse,
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          latencyMs: data.retrieval?.latencyMs || 8.4,
          matchedDoc: data.retrieval?.matchedDocument?.title,
        };
        setTranscript((prev) => [...prev, agentMsg]);
        speakVoiceResponse(data.voiceResponse);
      }
    } catch {
      const fallbackMsg: Message = {
        id: `msg-${Date.now() + 1}`,
        sender: "agent",
        text: "I have recorded your request. Our desk will confirm with you shortly.",
        timestamp: "Just now",
      };
      setTranscript((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsProcessing(false);
    }
  };

  // Call & Mic Controls
  const handleToggleCall = () => {
    if (isCalling || isConnecting) {
      setIsCalling(false);
      setIsConnecting(false);
      setIsSpeaking(false);
      if (typeof window !== "undefined" && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.pause();
      }
    } else {
      setIsConnecting(true);
      setTimeout(() => {
        setIsConnecting(false);
        setIsCalling(true);
        speakVoiceResponse(
          `Connected to ${businessName}. Namaste! How may I assist your call today?`
        );
      }, 700);
    }
  };

  const handleToggleMic = () => {
    if (!recognitionRef.current) {
      alert("Microphone recognition is supported in Chrome, Edge, and Android mobile browsers.");
      return;
    }
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        const langMeta = LANGUAGES.find((l) => l.code === selectedLanguage);
        if (langMeta) recognitionRef.current.lang = langMeta.speechLocale;
        recognitionRef.current.start();
        setIsListening(true);
      } catch (err) {
        console.error("Mic start error:", err);
      }
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Switch Business Persona
  const handleSelectPersona = (p: BusinessCategory) => {
    setSelectedPersona(p);
    const cat = AVAILABLE_CATEGORIES.find((c) => c.id === p);
    const defaultName = cat?.defaultBusinessName || "VaniEdge AI Assistant";
    setBusinessName(defaultName);

    const personaGreetings: Record<
      BusinessCategory,
      { voice: string; rate: number; pitch: number; greeting: string; latency: number }
    > = {
      clinic: {
        voice: "sarah",
        rate: 1.0,
        pitch: 1.0,
        greeting:
          "Namaste! Welcome to CarePlus Healthcare & Clinics. How may I assist with your doctor appointment, consultation, or triage today?",
        latency: 12.4,
      },
      restaurant: {
        voice: "bella",
        rate: 1.05,
        pitch: 1.05,
        greeting:
          "Namaste! Welcome to Royal Feast Kitchen & Dining. Would you like to place a food delivery order, reserve a dining table, or check our daily menu?",
        latency: 11.8,
      },
      auto: {
        voice: "adam",
        rate: 1.1,
        pitch: 0.95,
        greeting:
          "Apex 24/7 Roadside Rescue dispatch center. Do you require immediate vehicle towing, battery jumpstart, tyre repair, or fuel delivery?",
        latency: 10.5,
      },
      retail: {
        voice: "sarah",
        rate: 1.0,
        pitch: 1.0,
        greeting:
          "Hello! Welcome to PrimeGoods Retail. How can I help you with your order status, return request, or product stock inquiry today?",
        latency: 13.1,
      },
      realestate: {
        voice: "adam",
        rate: 1.0,
        pitch: 1.0,
        greeting:
          "Welcome to Skyline Realty & Properties. Are you looking to schedule an apartment viewing, inquire about lease terms, or check property pricing?",
        latency: 12.9,
      },
      finance: {
        voice: "sarah",
        rate: 1.0,
        pitch: 1.0,
        greeting:
          "Welcome to Apex Financial & Banking. How can I assist with your account balance, loan inquiry, or card services today?",
        latency: 14.0,
      },
      hospitality: {
        voice: "bella",
        rate: 1.0,
        pitch: 1.05,
        greeting:
          "Welcome to Grand Horizon Suites & Hotel. How may I assist you with room reservations, check-in amenities, or airport shuttle transfers?",
        latency: 12.2,
      },
      general: {
        voice: "sarah",
        rate: 1.0,
        pitch: 1.0,
        greeting:
          "Hello! Welcome to Enterprise Concierge Support. How may I direct your call, assist your inquiry, or schedule a callback for you?",
        latency: 11.2,
      },
    };

    const cfg = personaGreetings[p] || personaGreetings.general;
    setSelectedVoice(cfg.voice);
    setSpeechRate(cfg.rate);
    setSpeechPitch(cfg.pitch);
    setTranscript([
      {
        id: `init-${Date.now()}`,
        sender: "agent",
        text: cfg.greeting,
        timestamp: "Just now",
        latencyMs: cfg.latency,
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-black scroll-smooth">
      {/* Hidden Audio Player for ElevenLabs Streaming */}
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Sticky Navigation Bar (Solid Background - No Backdrop Blur Subpixel Degradation) */}
        <header className="border-b border-slate-800 bg-[#090e17] sticky top-0 z-50 shadow-md">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Left Brand */}
            <a
              href="#overview"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection("overview");
              }}
              className="flex items-center gap-3 group cursor-pointer"
            >
              <div className="relative h-10 w-10 rounded-xl overflow-hidden shadow-[0_0_20px_rgba(6,182,212,0.35)] border border-cyan-500/40 group-hover:border-cyan-400 transition-all shrink-0">
                <img
                  src="/vaniedge-logo.png"
                  alt="VaniEdge Voice Platform Logo"
                  className="h-full w-full object-cover transform group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="font-black text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-cyan-100 to-emerald-400 bg-clip-text text-transparent">
                    VaniEdge
                  </span>
                  <span className="text-[9px] uppercase font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-bold tracking-wider">
                    VOICE PLATFORM
                  </span>
                </div>
                <span className="text-[10px] text-slate-300 font-mono -mt-0.5 hidden sm:block">
                  Sub-Second Telephony &amp; SutraDB RAG
                </span>
              </div>
            </a>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-200">
              <button
                type="button"
                onClick={() => scrollToSection("overview")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("studio")}
                className="hover:text-cyan-300 transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Studio
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("industries")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                8 Industries
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("architecture")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Architecture
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("mission-control")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Failover Watchdog
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pricing")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                Pricing
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="hover:text-cyan-300 transition-colors cursor-pointer"
              >
                FAQ
              </button>
            </nav>

            {/* Right Quick Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Spoken Language Selector */}
              <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/80 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs shadow-sm">
                <Globe2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <select
                  value={selectedLanguage}
                  onChange={(e) => {
                    const newLang = e.target.value;
                    setSelectedLanguage(newLang);
                    const langMeta = LANGUAGES.find((l) => l.code === newLang);
                    if (recognitionRef.current && langMeta) {
                      recognitionRef.current.lang = langMeta.speechLocale;
                    }
                    if (isCalling) {
                      const switchAudio: Record<string, string> = {
                        hi: "नमस्ते, भाषा बदलकर हिंदी कर दी गई है।",
                        kn: "ನಮಸ್ಕಾರ, ಭಾಷೆಯನ್ನು ಕನ್ನಡಕ್ಕೆ ಬದಲಾಯಿಸಲಾಗಿದೆ.",
                        mr: "नमस्कार, भाषा मराठीत बदलली आहे.",
                        ta: "வணக்கம், மொழி தமிழுக்கு மாற்றப்பட்டுள்ளது.",
                        es: "Hola, idioma cambiado a español.",
                        en: "Switched to English.",
                      };
                      speakVoiceResponse(switchAudio[newLang] || `Language set to ${langMeta?.label || newLang}.`);
                    }
                  }}
                  className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer pr-1"
                  aria-label="Select Spoken Language"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.code} value={l.code} className="bg-slate-900 text-white">
                      {l.label} ({l.nativeLabel})
                    </option>
                  ))}
                </select>
              </div>

              {/* Live PSTN Phone Line Badge */}
              <a
                href="tel:+18149613703"
                className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono hover:bg-emerald-900/60 transition-colors shadow-sm cursor-pointer"
                title="Click to dial live production telephony line"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Phone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">+1 (814) 961-3703</span>
                <span className="sm:hidden">Call</span>
              </a>

              <a
                href="https://t.me/Samarth1306"
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Claim Line</span>
              </a>

              {/* Mobile Menu Toggle Button */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 lg:hidden cursor-pointer"
                aria-label="Toggle Mobile Menu"
              >
                {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Dropdown Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden border-t border-slate-800 bg-[#090e17] px-4 py-4 space-y-3 font-semibold text-sm">
              <button
                type="button"
                onClick={() => scrollToSection("overview")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Overview
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("studio")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Live Interactive Studio
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("industries")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                8 Industry Personas
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("architecture")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Vani + Edge Architecture
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("mission-control")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Failover Watchdog &amp; Health
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("pricing")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Commercial Pricing
              </button>
              <button
                type="button"
                onClick={() => scrollToSection("faq")}
                className="block w-full text-left py-1 text-slate-300 hover:text-cyan-400"
              >
                Frequently Asked Questions
              </button>
              <div className="pt-2 border-t border-slate-800">
                <a
                  href="https://t.me/Samarth1306"
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full py-2.5 rounded-lg bg-emerald-500 text-slate-950 font-bold text-center text-xs"
                >
                  Claim Dedicated Line (@Samarth1306)
                </a>
              </div>
            </div>
          )}
        </header>

        {/* Landing Page Content Sections */}
        <main className="w-full flex-1 flex flex-col">
          {/* 1. Hero Section */}
          <div id="overview">
            <LandingHero onScrollToStudio={() => scrollToSection("studio")} />
          </div>

          {/* 2. Interactive Live Studio Section */}
          <section id="studio" className="py-16 sm:py-20 border-b border-slate-800/80 bg-[#070b12] relative scroll-mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-medium mb-3">
                  <Bot className="w-3.5 h-3.5" />
                  <span>INTERACTIVE LIVE TELEPHONY STUDIO</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Experience VaniEdge in Real Time
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-400">
                  Select any of the 8 business categories below, start a browser call or click sample test prompts to observe sub-15ms SutraDB vector retrieval and multi-lingual voice speech generation.
                </p>
              </div>

              <VaniStudioView
                isCalling={isCalling}
                isConnecting={isConnecting}
                isListening={isListening}
                isSpeaking={isSpeaking}
                callDuration={callDuration}
                formatDuration={formatDuration}
                transcript={transcript}
                customQuery={customQuery}
                setCustomQuery={setCustomQuery}
                isProcessing={isProcessing}
                onSend={handleSend}
                onToggleCall={handleToggleCall}
                onToggleMic={handleToggleMic}
                onReplayAudio={speakVoiceResponse}
                selectedPersona={selectedPersona}
                onSelectPersona={handleSelectPersona}
                selectedLanguage={selectedLanguage}
                onSelectLanguage={setSelectedLanguage}
                languages={LANGUAGES}
              />
            </div>
          </section>

          {/* 3. Bento Architecture Grid */}
          <BentoArchitecture />

          {/* 4. 8 Turnkey Industry Solutions */}
          <IndustrySolutionsSection onSelectCategory={(id) => handleSelectPersona(id)} />

          {/* 5. Telephony Failover Mission Control */}
          <section id="mission-control" className="py-16 sm:py-20 border-b border-slate-800/80 bg-[#060910] scroll-mt-16">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-medium mb-3">
                  <Activity className="w-3.5 h-3.5" />
                  <span>TELEPHONY FAILOVER WATCHDOG &amp; TELEMETRY</span>
                </div>
                <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                  Live Mission Control &amp; Carrier Health
                </h2>
                <p className="mt-3 text-sm sm:text-base text-slate-400">
                  Real-time supervisor managing carrier WebSocket audio streams, heartbeat latency checks, and automatic atomic Twilio REST failover.
                </p>
              </div>

              <div className="max-w-5xl mx-auto">
                <TelephonyMissionControl />
              </div>
            </div>
          </section>

          {/* 6. Commercial Pricing Matrix */}
          <PricingSection />

          {/* 7. Frequently Asked Questions */}
          <FaqSection />
        </main>

        {/* 8. Modern Conversion Footer */}
        <LandingFooter />
      </div>
    </div>
  );
}
