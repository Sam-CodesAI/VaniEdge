"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Radio,
  Cpu,
  Database,
  Volume2,
  Play,
  Pause,
  Layers,
  ArrowRight,
  Sparkles,
  Server,
  Activity,
  PhoneCall,
  CheckCircle2,
} from "lucide-react";

interface ScrollyStage {
  id: string;
  step: string;
  timeLabel: string;
  title: string;
  headline: string;
  description: string;
  metrics: { label: string; value: string; detail: string }[];
  tag: string;
  audioSampleText: string;
  waveColor: string;
}

const STAGES: ScrollyStage[] = [
  {
    id: "sip-ingest",
    step: "01 / 04",
    timeLabel: "T + 0ms to 42ms",
    title: "Edge Carrier Handshake",
    headline: "Zero-Hop SIP Trunk Ingestion at Bengaluru Equinix BN1",
    description:
      "When a caller dials your local number, the call connects through native Airtel IQ or Exotel SIP trunks directly into our local edge node. Audio packets stream at 8,000Hz G.711 μ-law with under 0.1% jitter, bypassing congested multi-region cloud gateways entirely.",
    metrics: [
      { label: "Carrier Ingress", value: "3.2ms", detail: "Airtel / Exotel SIP Trunk" },
      { label: "Packet Loss", value: "0.01%", detail: "FEC Reed-Solomon protected" },
      { label: "Audio Bitrate", value: "64 kbps", detail: "Lossless PCM u-Law" },
    ],
    tag: "CARRIER INGEST",
    audioSampleText: "Connecting to Bangalore Edge Gateway... SIP Trunk Handshake Verified.",
    waveColor: "#059669", // Emerald
  },
  {
    id: "acoustic-separation",
    step: "02 / 04",
    timeLabel: "T + 42ms to 92ms",
    title: "Acoustic Noise Stripping & Dialect Parsing",
    headline: "Indian Accent Tolerance & Multilingual Phoneme Separation",
    description:
      "Indian phone calls are rarely silent: traffic horns, marketplace chatter, and kitchen utensils create heavy noise. Our edge acoustic model runs real-time spectral subtraction, isolating spoken Hindi, Kannada, Tamil, Marathi, or Indian-English phonemes with 99.4% confidence.",
    metrics: [
      { label: "Noise Attenuation", value: "-28 dB", detail: "Spectral gate filtering" },
      { label: "Dialect Detection", value: "14ms", detail: "Kannada/Hindi/Tamil" },
      { label: "Phoneme Accuracy", value: "99.4%", detail: "WER < 4.1% on Indic speech" },
    ],
    tag: "ACOUSTIC ASR",
    audioSampleText: "Traffic noise stripped (-28dB). Detected dialect: Bengaluru Kannada-English code-switch.",
    waveColor: "#0284c7", // Sky blue
  },
  {
    id: "sutradb-retrieval",
    step: "03 / 04",
    timeLabel: "T + 92ms to 138ms",
    title: "SutraDB Sub-15ms Memory Retrieval",
    headline: "Zero-SaaS Embedded Vector RAG & Intent Extraction",
    description:
      "Instead of sending patient appointments or order data across public SaaS cloud APIs, VaniEdge queries an embedded SutraDB vector index residing on the same physical NVMe memory. Structured business entities and clinical context are retrieved in under 12 milliseconds.",
    metrics: [
      { label: "Vector Search", value: "11.8ms", detail: "HNSW NVMe local memory" },
      { label: "Entity Extraction", value: "100%", detail: "Structured JSON schema" },
      { label: "External SaaS Latency", value: "0.0ms", detail: "Zero cloud API hops" },
    ],
    tag: "EMBEDDED RAG",
    audioSampleText: "Querying SutraDB local vectors... Retrieved patient token #4821 and Dr. Sharma clinic calendar in 11.8ms.",
    waveColor: "#d97706", // Amber
  },
  {
    id: "neural-tts-dispatch",
    step: "04 / 04",
    timeLabel: "T + 138ms to 180ms",
    title: "Neural Speech Synthesis & Handset Dispatch",
    headline: "Natural Conversational Voice Reaches Caller's Ear",
    description:
      "The response sentence is streamed chunk-by-chunk using sub-20ms edge neural vocoders. The caller hears a warm, cultured human cadence with zero robotic artifacting. Total glass-to-ear latency is locked under 180ms — faster than human conversational pause perception.",
    metrics: [
      { label: "Vocoder Latency", value: "18ms", detail: "Streaming chunked audio" },
      { label: "Total Glass-to-Ear", value: "172ms", detail: "Full conversational roundtrip" },
      { label: "Human Turn Gap", value: "180ms", detail: "Natural pause threshold" },
    ],
    tag: "NEURAL TTS DISPATCH",
    audioSampleText: "Namaskara! Dr. Sharma has a 4:30 PM slot open today. Shall I confirm your token number?",
    waveColor: "#7c3aed", // Violet
  },
];

export default function CinematicVoiceScrollytelling() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [activeStageIdx, setActiveStageIdx] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTabAudioNotice, setActiveTabAudioNotice] = useState<string | null>(null);

  // Handle scroll scrubbing
  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.clientHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = Math.max(0, Math.min(totalHeight, -rect.top));
      const progress = scrolled / totalHeight;
      setScrollProgress(progress);

      // Map progress to stage index (0 to 3) with linger buffer
      const stageIdx = Math.min(3, Math.floor(progress * 4));
      setActiveStageIdx(stageIdx);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Canvas visualizer animation reacting to scroll progress & stage
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const width = (canvas.width = canvas.parentElement?.clientWidth || 600);
      const height = (canvas.height = canvas.parentElement?.clientHeight || 400);

      ctx.clearRect(0, 0, width, height);

      // Background subtle grid
      ctx.strokeStyle = "rgba(226, 232, 240, 0.6)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw multi-layered acoustic waveform
      const currentStage = STAGES[activeStageIdx];
      const primaryColor = currentStage.waveColor;

      // Center baseline
      const midY = height / 2;
      const speed = isPlayingAudio ? 0.08 : 0.03;
      const amplitude = isPlayingAudio ? 45 : 20 + scrollProgress * 15;

      // Multi-pass waves
      for (let pass = 0; pass < 3; pass++) {
        ctx.beginPath();
        ctx.lineWidth = pass === 0 ? 3 : 1.5;
        ctx.strokeStyle = pass === 0 ? primaryColor : `${primaryColor}66`;

        const phaseOffset = pass * 1.4 + frame * speed;
        const freq = 0.015 + pass * 0.008;

        for (let x = 0; x < width; x += 3) {
          // Windowing envelope so wave tapers gracefully at left and right
          const envelope = Math.sin((x / width) * Math.PI);
          const y = midY + Math.sin(x * freq + phaseOffset) * amplitude * envelope;
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }

      // Draw packet nodes moving along the line
      const packetCount = 6;
      for (let i = 0; i < packetCount; i++) {
        const t = ((frame * (isPlayingAudio ? 2.5 : 1.2) + i * (width / packetCount)) % width) / width;
        const px = t * width;
        const envelope = Math.sin(t * Math.PI);
        const py = midY + Math.sin(px * 0.015 + frame * speed) * amplitude * envelope;

        ctx.fillStyle = primaryColor;
        ctx.beginPath();
        ctx.arc(px, py, 4, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(0,0,0,0.08)";
        ctx.beginPath();
        ctx.arc(px, py, 8, 0, Math.PI * 2);
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [activeStageIdx, scrollProgress, isPlayingAudio]);

  // Jump to specific stage on click
  const jumpToStage = (idx: number) => {
    if (!containerRef.current) return;
    const containerTop = containerRef.current.offsetTop;
    const totalHeight = containerRef.current.clientHeight - window.innerHeight;
    const targetScroll = containerTop + (idx / 3.5) * totalHeight;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  // Play audio sample
  const triggerAudioSample = (text: string) => {
    if (isPlayingAudio) {
      window.speechSynthesis?.cancel();
      setIsPlayingAudio(false);
      setActiveTabAudioNotice(null);
      return;
    }

    if ("speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;
      utterance.onstart = () => {
        setIsPlayingAudio(true);
        setActiveTabAudioNotice(text);
      };
      utterance.onend = () => {
        setIsPlayingAudio(false);
        setActiveTabAudioNotice(null);
      };
      utterance.onerror = () => {
        setIsPlayingAudio(false);
        setActiveTabAudioNotice(null);
      };
      window.speechSynthesis.speak(utterance);
    } else {
      setActiveTabAudioNotice(text);
      setTimeout(() => setActiveTabAudioNotice(null), 4000);
    }
  };

  const activeStage = STAGES[activeStageIdx];

  return (
    <div
      ref={containerRef}
      id="cinematic-scrollytelling"
      className="relative bg-white border-b-2 border-slate-200"
      style={{ height: "320vh" }}
    >
      {/* Sticky Viewport Stage (Locks on screen as user scrubs) */}
      <div className="sticky top-0 h-screen w-full flex flex-col justify-between overflow-hidden px-4 sm:px-8 py-6 sm:py-8 bg-white">
        
        {/* Top Scrolly HUD Header */}
        <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-oswald font-bold uppercase tracking-wider bg-slate-100 text-black border border-slate-300">
                <Radio className="w-3 h-3 text-emerald-600 animate-pulse" />
                <span>CINEMATIC SCROLLYTELLING ENGINE</span>
              </span>
              <span className="text-xs font-mono font-bold text-slate-500">
                SCROLL TO SCRUB THE PACKET JOURNEY
              </span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-oswald uppercase text-black tracking-tight">
              The 180ms Voice Flight
            </h2>
          </div>

          {/* Realtime Millisecond Counter & Progress Tracker */}
          <div className="flex items-center gap-3">
            <div className="bg-slate-50 border-2 border-slate-200 px-4 py-2 rounded-xl text-right">
              <div className="text-[10px] font-oswald uppercase font-bold text-slate-600">
                CURRENT TELEPHONY LATENCY
              </div>
              <div className="text-xl sm:text-2xl font-black font-oswald text-black flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-600 animate-pulse" />
                <span>{Math.round(scrollProgress * 172 + 8)} ms</span>
                <span className="text-xs font-mono text-emerald-700 font-bold">/ 180ms</span>
              </div>
            </div>

            {/* Stage Quick-Jump Pills */}
            <div className="hidden lg:flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl border border-slate-200">
              {STAGES.map((stg, i) => (
                <button
                  key={stg.id}
                  onClick={() => jumpToStage(i)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-oswald font-bold uppercase transition-all ${
                    activeStageIdx === i
                      ? "bg-black text-white shadow-sm"
                      : "text-slate-600 hover:text-black hover:bg-slate-200"
                  }`}
                >
                  {stg.step.split(" ")[0]} {stg.tag.split(" ")[0]}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Center Stage: Split Screen (Left: Narrative & Specs, Right: Kinetic Canvas & HUD) */}
        <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-center my-auto py-4">
          
          {/* Left Column: Story Beat & Technical Proof */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-lg text-xs font-oswald font-bold text-white uppercase tracking-wider" style={{ backgroundColor: activeStage.waveColor }}>
                STAGE {activeStage.step}
              </span>
              <span className="font-mono text-xs font-bold text-black bg-slate-100 px-3 py-1 rounded-lg border border-slate-300">
                {activeStage.timeLabel}
              </span>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black font-oswald uppercase text-black leading-tight">
                {activeStage.headline}
              </h3>
              <p className="mt-3 text-sm sm:text-base text-black font-medium leading-relaxed">
                {activeStage.description}
              </p>
            </div>

            {/* Spec Metric Grid */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              {activeStage.metrics.map((m, idx) => (
                <div
                  key={idx}
                  className="bg-slate-50 border-2 border-slate-200 rounded-xl p-3 hover:border-black transition-colors"
                >
                  <div className="text-[11px] font-oswald font-bold uppercase text-slate-700 truncate">
                    {m.label}
                  </div>
                  <div className="text-lg sm:text-xl font-black font-oswald text-black mt-0.5">
                    {m.value}
                  </div>
                  <div className="text-[10px] font-medium text-slate-600 truncate mt-0.5">
                    {m.detail}
                  </div>
                </div>
              ))}
            </div>

            {/* Live Audio Ingestion / Synthesis Tester */}
            <div className="bg-slate-100 border border-slate-300 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs font-oswald font-bold text-black uppercase">
                  <Volume2 className="w-4 h-4 text-emerald-700" />
                  <span>Interactive Stage Synthesizer</span>
                </div>
                <div className="text-xs text-slate-700 font-medium italic">
                  &quot;{activeStage.audioSampleText}&quot;
                </div>
              </div>

              <button
                onClick={() => triggerAudioSample(activeStage.audioSampleText)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white hover:bg-slate-800 text-xs font-oswald font-bold uppercase tracking-wider transition-colors shrink-0"
              >
                {isPlayingAudio ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Pause Audio</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>Audition Phase</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Wave Canvas & Hardware Telemetry Terminal */}
          <div className="lg:col-span-6 flex flex-col gap-4">
            
            {/* Visualizer Canvas Container */}
            <div className="relative w-full h-[260px] sm:h-[320px] bg-slate-50 border-2 border-slate-300 rounded-2xl overflow-hidden shadow-inner flex flex-col justify-between p-4">
              
              {/* Canvas Overlay Badges */}
              <div className="flex items-center justify-between z-10">
                <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-300 text-[11px] font-mono font-bold text-black">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                  <span>PCM 8kHz REALTIME SPECTRAL STREAM</span>
                </div>
                <span className="font-oswald text-xs font-bold uppercase text-black bg-white/90 px-3 py-1 rounded-full border border-slate-300">
                  {activeStage.tag}
                </span>
              </div>

              {/* Canvas Drawing Engine */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full pointer-events-none"
              />

              {/* Bottom Canvas Telemetry Status */}
              <div className="z-10 flex items-center justify-between text-[11px] font-mono font-bold text-black bg-white/95 backdrop-blur-sm p-2 rounded-xl border border-slate-300">
                <div className="flex items-center gap-2">
                  <Server className="w-3.5 h-3.5 text-slate-700" />
                  <span>BENGALURU_EQ1 :: NVMe_STREAM_BUS</span>
                </div>
                <span className="text-emerald-700 font-bold">LOCKED &lt;180MS</span>
              </div>
            </div>

            {/* Telemetry Stage Tracker Timeline */}
            <div className="grid grid-cols-4 gap-2">
              {STAGES.map((s, i) => {
                const isPassed = activeStageIdx >= i;
                const isCurrent = activeStageIdx === i;
                return (
                  <button
                    key={s.id}
                    onClick={() => jumpToStage(i)}
                    className={`text-left p-2.5 rounded-xl border-2 transition-all ${
                      isCurrent
                        ? "border-black bg-slate-100 shadow-sm"
                        : isPassed
                        ? "border-slate-300 bg-white hover:border-slate-400"
                        : "border-slate-200 bg-slate-50 opacity-60 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-600">
                        0{i + 1}
                      </span>
                      {isPassed && (
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      )}
                    </div>
                    <div className="text-xs font-oswald font-bold uppercase text-black truncate">
                      {s.title.split(" ")[0]}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Bottom Persistent Scrubber Bar */}
        <div className="max-w-7xl mx-auto w-full pt-3 border-t border-slate-200 flex items-center justify-between text-xs font-mono text-black font-bold">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-black" />
            <span className="font-oswald uppercase tracking-wider">
              CONTINUOUS FLIGHT: {Math.round(scrollProgress * 100)}% SCRUBBED
            </span>
          </div>

          <div className="flex-1 mx-6 h-2 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-black transition-all duration-75"
              style={{ width: `${Math.max(5, scrollProgress * 100)}%` }}
            />
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-600 font-oswald uppercase text-[11px]">
            <span>SCROLL DOWN TO ADVANCE TIME</span>
            <ArrowRight className="w-3.5 h-3.5 text-black" />
          </div>
        </div>

      </div>
    </div>
  );
}
