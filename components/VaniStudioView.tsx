"use client";

import React, { useRef, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Volume2,
  Send,
  Bot,
  User,
  Sparkles,
  Loader2,
  ArrowRight,
} from "lucide-react";
import VaniVoiceOrb3D from "./VaniVoiceOrb3D";

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

interface VaniStudioViewProps {
  isCalling: boolean;
  isConnecting?: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  callDuration: number;
  formatDuration: (s: number) => string;
  transcript: Message[];
  customQuery: string;
  setCustomQuery: (q: string) => void;
  isProcessing: boolean;
  onSend: (override?: string) => void;
  onToggleCall: () => void;
  onToggleMic: () => void;
  onReplayAudio: (text: string) => void;
  selectedPersona: "clinic" | "restaurant" | "auto";
  onSelectPersona: (p: "clinic" | "restaurant" | "auto") => void;
  selectedLanguage: string;
  onSelectLanguage: (l: string) => void;
  languages: LanguageOption[];
}

export default function VaniStudioView({
  isCalling,
  isConnecting = false,
  isListening,
  isSpeaking,
  callDuration,
  formatDuration,
  transcript,
  customQuery,
  setCustomQuery,
  isProcessing,
  onSend,
  onToggleCall,
  onToggleMic,
  onReplayAudio,
  selectedPersona,
  onSelectPersona,
}: VaniStudioViewProps) {
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Smooth auto-scroll to bottom of transcript as new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcript]);

  // Quick prompt pills for instant action
  const samplePrompts = {
    clinic: [
      { label: "Clinic Hours?", query: "What are Dr. Sharma's clinic hours?" },
      { label: "Book 10 AM", query: "Book an appointment for Rahul tomorrow at 10 AM" },
      { label: "Consultation Fee?", query: "What is the consultation fee?" },
    ],
    restaurant: [
      { label: "Today's Special?", query: "What is today's Bhojanalaya special?" },
      { label: "Order 2 Thalis", query: "Order 2 Special Thalis to Indiranagar" },
      { label: "Delivery Time?", query: "What is the delivery turnaround time?" },
    ],
    auto: [
      { label: "Highway Puncture", query: "I have a highway tyre puncture at Mile 44" },
      { label: "Towing Rate?", query: "What is the emergency towing rate?" },
      { label: "Dispatch Rescue", query: "Dispatch roadside rescue team immediately" },
    ],
  }[selectedPersona] || [
    { label: "Business Hours?", query: "What are your business hours?" },
    { label: "Book Appointment", query: "Can I schedule an appointment?" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Clean Hero Header */}
      <div className="text-center space-y-2 max-w-2xl mx-auto pt-2">
        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
          AI Voice Assistant <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">for Local Businesses</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          24/7 natural voice phone answering. Select a business type below to test live in your browser.
        </p>
      </div>

      {/* Business Persona Switcher (Segmented Control) */}
      <div className="flex flex-wrap items-center justify-center gap-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-2xl w-fit mx-auto shadow-lg backdrop-blur-md">
        <button
          type="button"
          onClick={() => onSelectPersona("clinic")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            selectedPersona === "clinic"
              ? "bg-emerald-500 text-black shadow-md shadow-emerald-500/25 scale-100"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <span className="text-base">🏥</span>
          <span>Dr. Sharma Clinic</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPersona("restaurant")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            selectedPersona === "restaurant"
              ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/25 scale-100"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <span className="text-base">🍲</span>
          <span>Bhojanalaya Kitchen</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectPersona("auto")}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 ${
            selectedPersona === "auto"
              ? "bg-amber-500 text-black shadow-md shadow-amber-500/25 scale-100"
              : "text-slate-400 hover:text-white hover:bg-slate-800/60"
          }`}
        >
          <span className="text-base">🚨</span>
          <span>Apex Roadside Rescue</span>
        </button>
      </div>

      {/* 2-COLUMN SIDE-BY-SIDE CONSOLE (Unified Single-Viewport Frame) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full max-w-6xl mx-auto items-stretch">
        {/* Left Column: Voice Core & Call Action */}
        <div className="lg:col-span-5 flex flex-col">
          <div className="bg-[#0b121e]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between text-center space-y-3 h-full shadow-xl backdrop-blur-md">
            <div className="w-full flex items-center justify-between pb-3 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Voice Core
                </span>
              </div>

              {/* Real-time telephony state indicator */}
              <div className="flex items-center gap-1.5 text-[11px]">
                {isConnecting ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping" />
                    <span className="font-mono text-amber-300 font-medium">Connecting...</span>
                  </>
                ) : isSpeaking ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="font-mono text-emerald-300 font-medium">Speaking</span>
                  </>
                ) : isListening ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
                    <span className="font-mono text-cyan-300 font-medium">Listening</span>
                  </>
                ) : isCalling ? (
                  <>
                    <span className="h-2 w-2 rounded-full bg-emerald-400" />
                    <span className="font-mono text-emerald-300 font-medium">Connected</span>
                  </>
                ) : (
                  <>
                    <span className="h-2 w-2 rounded-full bg-slate-500" />
                    <span className="font-mono text-slate-400">Standby</span>
                  </>
                )}
              </div>
            </div>

            {/* Organic Breathing Voice Orb */}
            <div className="flex-1 flex items-center justify-center py-2">
              <VaniVoiceOrb3D
                isSpeaking={isSpeaking}
                isListening={isListening}
                isCalling={isCalling}
              />
            </div>

            {/* Call Action Button */}
            <div className="w-full pt-1 space-y-2.5">
              <button
                type="button"
                onClick={onToggleCall}
                disabled={isConnecting}
                className={`w-full py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 cursor-pointer disabled:cursor-wait ${
                  isConnecting
                    ? "bg-emerald-500 text-black font-semibold animate-pulse opacity-80"
                    : isCalling
                    ? "bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-rose-500/25"
                    : "bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-emerald-500/20"
                }`}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-black" />
                    <span>Connecting Audio Stream...</span>
                  </>
                ) : isCalling ? (
                  <>
                    <span className="relative flex h-2 w-2 mr-0.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-200 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    <PhoneOff className="w-4 h-4" />
                    <span>End Active Call ({formatDuration(callDuration)})</span>
                  </>
                ) : (
                  <>
                    <PhoneCall className="w-4 h-4" />
                    <span>Connect In-Browser Call</span>
                  </>
                )}
              </button>

              {/* Direct Dial Link */}
              <p className="text-center text-xs text-slate-400 pt-0.5">
                Or dial direct:{" "}
                <a
                  href="tel:+18149613703"
                  className="text-emerald-400 hover:text-emerald-300 font-mono font-medium hover:underline inline-flex items-center gap-1 ml-1"
                  title="Dial direct PSTN carrier line"
                >
                  <Phone className="w-3 h-3 inline" />
                  +1 (814) 961-3703
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Live Transcript & Simulated Query */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="bg-[#0b121e]/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between h-full min-h-[440px] shadow-xl backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-300">
                  Live Conversation
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400 tabular-nums">
                {transcript.length} {transcript.length === 1 ? "Message" : "Messages"}
              </span>
            </div>

            {/* Transcript Scroll Feed (Fixed 320px with Smooth Auto-Scroll) */}
            <div className="h-[320px] overflow-y-auto pr-1 my-3 text-xs space-y-3 scroll-smooth">
              {transcript.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 p-3.5 rounded-xl border transition-all ${
                    msg.sender === "agent"
                      ? "bg-slate-900/90 border-slate-800 text-slate-200"
                      : "bg-emerald-950/40 border-emerald-500/30 text-emerald-200 ml-6"
                  }`}
                >
                  <div
                    className={`h-7 w-7 rounded-lg shrink-0 flex items-center justify-center ${
                      msg.sender === "agent" ? "bg-emerald-500/10 text-emerald-400" : "bg-cyan-500/10 text-cyan-300"
                    }`}
                  >
                    {msg.sender === "agent" ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  </div>

                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between text-[10px] text-slate-400">
                      <span className="font-semibold text-slate-300">
                        {msg.sender === "agent" ? "AI Voice Assistant" : "You (Caller)"}
                      </span>
                      <span className="font-mono text-slate-500">{msg.timestamp}</span>
                    </div>
                    <p className="text-xs leading-relaxed">{msg.text}</p>

                    {msg.sender === "agent" && (
                      <div className="pt-1 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onReplayAudio(msg.text)}
                          className="text-[10px] text-slate-400 hover:text-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
                          title="Re-play audio response"
                        >
                          <Volume2 className="w-3 h-3" />
                          <span>Listen Again</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts & Text Input */}
            <div className="space-y-2.5 pt-3 border-t border-slate-800/80">
              {/* Quick Prompt Pills */}
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-slate-400 mr-1 font-medium">Quick Prompts:</span>
                {samplePrompts.map((p, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => onSend(p.query)}
                    disabled={isProcessing}
                    className="text-xs px-3.5 py-1.5 rounded-full bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 hover:text-white border border-emerald-500/40 hover:border-emerald-300 shadow-sm shadow-emerald-500/10 hover:shadow-emerald-500/30 transition-all cursor-pointer font-medium active:scale-95 disabled:opacity-50 flex items-center gap-1.5 group"
                    title="Click to immediately speak this query and hear AI response"
                  >
                    <Sparkles className="w-3 h-3 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>

              {/* Input Form with Mic Button */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSend();
                }}
                className="flex items-center gap-2 pt-0.5"
              >
                <button
                  type="button"
                  onClick={onToggleMic}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                    isListening
                      ? "bg-rose-500 text-white border-rose-400 animate-pulse"
                      : "bg-slate-900 text-slate-300 border-slate-800 hover:text-white hover:bg-slate-800"
                  }`}
                  title={isListening ? "Listening... click to stop" : "Start Voice Input (Microphone)"}
                >
                  {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={customQuery}
                  onChange={(e) => setCustomQuery(e.target.value)}
                  placeholder={isListening ? "Listening... speak now" : "Speak or type your customer query..."}
                  disabled={isProcessing}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
                />

                <button
                  type="submit"
                  disabled={isProcessing || !customQuery.trim()}
                  className="p-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-semibold rounded-xl transition-colors shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Commercial Footer Banner */}
      <div className="w-full max-w-6xl mx-auto p-4 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-cyan-950/40 border border-emerald-500/30 shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
        <div className="space-y-0.5">
          <div className="text-xs sm:text-sm font-bold text-white flex items-center justify-center sm:justify-start gap-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span>Want VaniEdge AI for your clinic, restaurant, or business?</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Deploy a dedicated 24/7 autonomous phone answering line tailored to your local business in under 24 hours.
          </p>
        </div>
        <a
          href="https://t.me/Samarth1306"
          target="_blank"
          rel="noreferrer"
          className="shrink-0 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md shadow-emerald-500/20 hover:brightness-110 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <span>Claim Your Dedicated Line</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
