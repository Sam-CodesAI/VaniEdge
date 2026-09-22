"use client";

import React from "react";
import { Mic, Volume2, Phone } from "lucide-react";

interface VaniVoiceOrb3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  isCalling: boolean;
}

export default function VaniVoiceOrb3D({
  isSpeaking,
  isListening,
  isCalling,
}: VaniVoiceOrb3DProps) {
  return (
    <div className="relative flex items-center justify-center w-48 h-48 sm:w-56 sm:h-56 select-none my-1">
      {/* Outer ambient breathing aura */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "bg-emerald-500/35 scale-125 animate-pulse"
            : isListening
            ? "bg-cyan-500/35 scale-125 animate-pulse"
            : isCalling
            ? "bg-indigo-500/30 scale-115 animate-pulse"
            : "bg-emerald-500/15 scale-100"
        }`}
      />

      {/* Dynamic Sound Ripple 1 */}
      <div
        className={`absolute rounded-full border transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "w-44 h-44 sm:w-52 sm:h-52 border-emerald-400/40 animate-ping opacity-30"
            : isListening
            ? "w-44 h-44 sm:w-52 sm:h-52 border-cyan-400/40 animate-ping opacity-30"
            : isCalling
            ? "w-40 h-40 sm:w-48 sm:h-48 border-indigo-400/30 animate-pulse"
            : "w-36 h-36 border-slate-800/60"
        }`}
        style={{ animationDuration: isSpeaking || isListening ? "2.2s" : "4s" }}
      />

      {/* Dynamic Sound Ripple 2 */}
      <div
        className={`absolute w-36 h-36 sm:w-44 sm:h-44 rounded-full border transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? "border-emerald-400/50 scale-105"
            : isListening
            ? "border-cyan-400/50 scale-105"
            : isCalling
            ? "border-indigo-400/40 scale-100"
            : "border-slate-800/80 scale-95"
        }`}
      />

      {/* Ambient Inner Ring */}
      <div
        className={`absolute w-28 h-28 sm:w-32 sm:h-32 rounded-full border transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? "border-emerald-300/60 shadow-lg shadow-emerald-500/30"
            : isListening
            ? "border-cyan-300/60 shadow-lg shadow-cyan-500/30"
            : "border-slate-700/50"
        }`}
      />

      {/* Central Core Sphere */}
      <div
        className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isSpeaking
            ? "bg-gradient-to-tr from-emerald-600 via-teal-400 to-cyan-300 shadow-emerald-500/50 scale-110"
            : isListening
            ? "bg-gradient-to-tr from-cyan-600 via-sky-400 to-indigo-300 shadow-cyan-500/50 scale-105 animate-pulse"
            : isCalling
            ? "bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 shadow-indigo-500/40"
            : "bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950/70 border border-slate-700/80 shadow-slate-950/60"
        }`}
      >
        {isSpeaking ? (
          <Volume2 className="w-8 h-8 text-black animate-pulse" />
        ) : isListening ? (
          <Mic className="w-8 h-8 text-black animate-bounce" />
        ) : isCalling ? (
          <Phone className="w-8 h-8 text-white animate-pulse" />
        ) : (
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse delay-100" />
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse delay-200" />
          </div>
        )}
      </div>
    </div>
  );
}
