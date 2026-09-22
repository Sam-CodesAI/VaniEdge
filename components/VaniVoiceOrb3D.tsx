"use client";

import React, { useEffect, useRef } from "react";
import { Mic, Volume2, Phone, Brain, Sparkles } from "lucide-react";

interface VaniVoiceOrb3DProps {
  isSpeaking: boolean;
  isListening: boolean;
  isCalling: boolean;
  isThinking?: boolean;
}

export default function VaniVoiceOrb3D({
  isSpeaking,
  isListening,
  isCalling,
  isThinking = false,
}: VaniVoiceOrb3DProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 60FPS Reactive Waveform & Equalizer Visualizer Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let phase = 0;

    const render = () => {
      phase += 0.05;
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Determine state colors and wave dynamics
      let primaryColor = "rgba(16, 185, 129, 0.4)"; // emerald
      let secondaryColor = "rgba(6, 182, 212, 0.3)"; // cyan
      let waveCount = 3;
      let amplitude = 6;
      let frequency = 0.04;

      if (isSpeaking) {
        primaryColor = "rgba(16, 185, 129, 0.85)";
        secondaryColor = "rgba(52, 211, 153, 0.65)";
        amplitude = 18;
        frequency = 0.08;
      } else if (isListening) {
        primaryColor = "rgba(6, 182, 212, 0.9)";
        secondaryColor = "rgba(56, 189, 248, 0.65)";
        amplitude = 14;
        frequency = 0.1;
      } else if (isThinking) {
        primaryColor = "rgba(245, 158, 11, 0.85)";
        secondaryColor = "rgba(251, 191, 36, 0.6)";
        amplitude = 9;
        frequency = 0.14;
      } else if (isCalling) {
        primaryColor = "rgba(99, 102, 241, 0.6)";
        secondaryColor = "rgba(168, 85, 247, 0.4)";
        amplitude = 8;
        frequency = 0.05;
      }

      // Draw multi-layered harmonic sine waves
      for (let w = 0; w < waveCount; w++) {
        ctx.beginPath();
        const currentAmp = amplitude * (1 - w * 0.25);
        const currentPhase = phase * (1 + w * 0.3) + w * 1.5;

        for (let x = 0; x < width; x += 2) {
          // Attenuate at the borders for smooth pill-style fade
          const envelope = Math.sin((x / width) * Math.PI);
          const y =
            height / 2 +
            Math.sin(x * frequency + currentPhase) * currentAmp * envelope;

          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }

        ctx.strokeStyle = w === 0 ? primaryColor : secondaryColor;
        ctx.lineWidth = w === 0 ? 2.5 : 1.5;
        ctx.lineCap = "round";
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isSpeaking, isListening, isThinking, isCalling]);

  return (
    <div className="relative flex flex-col items-center justify-center w-56 h-56 sm:w-64 sm:h-64 select-none my-1">
      {/* Outer ambient breathing aura */}
      <div
        className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "bg-emerald-500/35 scale-125 animate-pulse"
            : isListening
            ? "bg-cyan-500/35 scale-125 animate-pulse"
            : isThinking
            ? "bg-amber-500/30 scale-120 animate-pulse"
            : isCalling
            ? "bg-indigo-500/30 scale-115 animate-pulse"
            : "bg-emerald-500/15 scale-100"
        }`}
      />

      {/* Dynamic Sound Ripple 1 */}
      <div
        className={`absolute rounded-full border transition-all duration-700 pointer-events-none ${
          isSpeaking
            ? "w-48 h-48 sm:w-56 sm:h-56 border-emerald-400/40 animate-ping opacity-30"
            : isListening
            ? "w-48 h-48 sm:w-56 sm:h-56 border-cyan-400/40 animate-ping opacity-30"
            : isThinking
            ? "w-44 h-44 sm:w-52 sm:h-52 border-amber-400/40 animate-spin opacity-40 border-dashed"
            : isCalling
            ? "w-44 h-44 sm:w-50 sm:h-50 border-indigo-400/30 animate-pulse"
            : "w-40 h-40 border-slate-800/60"
        }`}
        style={{
          animationDuration:
            isSpeaking || isListening ? "2.2s" : isThinking ? "6s" : "4s",
        }}
      />

      {/* Dynamic Sound Ripple 2 */}
      <div
        className={`absolute w-40 h-40 sm:w-48 sm:h-48 rounded-full border transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? "border-emerald-400/50 scale-105"
            : isListening
            ? "border-cyan-400/50 scale-105"
            : isThinking
            ? "border-amber-400/50 scale-100 ring-2 ring-amber-500/20"
            : isCalling
            ? "border-indigo-400/40 scale-100"
            : "border-slate-800/80 scale-95"
        }`}
      />

      {/* Ambient Inner Ring */}
      <div
        className={`absolute w-32 h-32 sm:w-36 sm:h-36 rounded-full border transition-all duration-500 pointer-events-none ${
          isSpeaking
            ? "border-emerald-300/60 shadow-lg shadow-emerald-500/30"
            : isListening
            ? "border-cyan-300/60 shadow-lg shadow-cyan-500/30"
            : isThinking
            ? "border-amber-300/60 shadow-lg shadow-amber-500/30"
            : "border-slate-700/50"
        }`}
      />

      {/* Central Core Sphere */}
      <div
        className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isSpeaking
            ? "bg-gradient-to-tr from-emerald-600 via-teal-400 to-cyan-300 shadow-emerald-500/50 scale-110"
            : isListening
            ? "bg-gradient-to-tr from-cyan-600 via-sky-400 to-indigo-300 shadow-cyan-500/50 scale-105 animate-pulse"
            : isThinking
            ? "bg-gradient-to-tr from-amber-600 via-yellow-400 to-orange-400 shadow-amber-500/50 scale-105"
            : isCalling
            ? "bg-gradient-to-tr from-indigo-600 via-purple-500 to-pink-400 shadow-indigo-500/40"
            : "bg-gradient-to-tr from-slate-900 via-slate-800 to-emerald-950/70 border border-slate-700/80 shadow-slate-950/60"
        }`}
      >
        {isSpeaking ? (
          <Volume2 className="w-8 h-8 text-black animate-pulse" />
        ) : isListening ? (
          <Mic className="w-8 h-8 text-black animate-bounce" />
        ) : isThinking ? (
          <Brain className="w-8 h-8 text-black animate-pulse" />
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

      {/* 60FPS Reactive Waveform Canvas Visualizer */}
      <div className="absolute -bottom-2 z-20 w-48 h-10 flex items-center justify-center pointer-events-none">
        <canvas
          ref={canvasRef}
          width={192}
          height={40}
          className="w-full h-full opacity-90"
        />
      </div>

      {/* State label pill */}
      <div className="absolute -bottom-5 z-20">
        <span
          className={`text-[10px] font-mono px-2 py-0.5 rounded-full border transition-all ${
            isSpeaking
              ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
              : isListening
              ? "bg-cyan-500/20 text-cyan-300 border-cyan-500/40"
              : isThinking
              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse"
              : isCalling
              ? "bg-indigo-500/20 text-indigo-300 border-indigo-500/40"
              : "bg-slate-800/80 text-slate-400 border-slate-700"
          }`}
        >
          {isSpeaking
            ? "AI SPEAKING (EDGE AUDIO)"
            : isListening
            ? "LISTENING TO CALLER"
            : isThinking
            ? "RETRIEVING FROM SUTRADB"
            : isCalling
            ? "CARRIER TRUNK CONNECTED"
            : "READY ON STANDBY"}
        </span>
      </div>
    </div>
  );
}
