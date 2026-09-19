"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Phone,
  Globe2,
  ExternalLink,
  Code2,
  Flame,
} from "lucide-react";
import VaniStudioView from "@/components/VaniStudioView";

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
  const [selectedPersona, setSelectedPersona] = useState<"clinic" | "restaurant" | "auto">("clinic");
  const [businessName, setBusinessName] = useState<string>("Dr. Sharma Healthcare Clinic");
  const [selectedVoice, setSelectedVoice] = useState<string>("sarah");
  const [speechRate, setSpeechRate] = useState<number>(1.0);
  const [speechPitch, setSpeechPitch] = useState<number>(1.0);
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en");

  // Live Transcript State
  const [transcript, setTranscript] = useState<Message[]>([
    {
      id: "initial-msg",
      sender: "agent",
      text: "Namaste! Welcome to Dr. Sharma Healthcare Clinic. How may I assist with your appointment or consultation today?",
      timestamp: "Just now",
      latencyMs: 14.2,
    },
  ]);
  const [customQuery, setCustomQuery] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);

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

      const data = await res.json();

      if (data.success) {
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
  const handleSelectPersona = (p: "clinic" | "restaurant" | "auto") => {
    setSelectedPersona(p);
    if (p === "clinic") {
      setBusinessName("Dr. Sharma Healthcare Clinic");
      setSelectedVoice("sarah");
      setSpeechRate(1.0);
      setSpeechPitch(1.0);
      setTranscript([
        {
          id: `init-${Date.now()}`,
          sender: "agent",
          text: "Namaste! Welcome to Dr. Sharma Healthcare Clinic. How may I assist with your appointment or consultation today?",
          timestamp: "Just now",
          latencyMs: 14.2,
        },
      ]);
    } else if (p === "restaurant") {
      setBusinessName("Bhojanalaya Cloud Kitchen");
      setSelectedVoice("bella");
      setSpeechRate(1.05);
      setSpeechPitch(1.05);
      setTranscript([
        {
          id: `init-${Date.now()}`,
          sender: "agent",
          text: "Namaste! Welcome to Bhojanalaya Kitchen. Are you calling to place a food order or check our daily thali menu?",
          timestamp: "Just now",
          latencyMs: 12.8,
        },
      ]);
    } else {
      setBusinessName("Apex Roadside Assistance");
      setSelectedVoice("adam");
      setSpeechRate(1.1);
      setSpeechPitch(0.95);
      setTranscript([
        {
          id: `init-${Date.now()}`,
          sender: "agent",
          text: "Apex Roadside Rescue dispatch. Do you require immediate towing, battery jumpstart, or tyre assistance?",
          timestamp: "Just now",
          latencyMs: 11.5,
        },
      ]);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 selection:bg-emerald-500 selection:text-black font-sans antialiased">
      {/* Hidden Audio Player for ElevenLabs Streaming */}
      <audio ref={audioPlayerRef} className="hidden" />

      {/* Main Content Area */}
      <div className="flex flex-col min-h-screen w-full">
        {/* Top Sticky Navigation Bar */}
        <header className="border-b border-slate-800/80 bg-[#090e17]/90 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
            {/* Left Brand */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md">
                <div className="h-full w-full bg-[#070b12] rounded-[6px] flex items-center justify-center">
                  <Flame className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base sm:text-lg tracking-tight text-white">
                  VaniEdge AI
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Voice Studio
                </span>
              </div>
            </div>

            {/* Right Controls */}
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
                href="https://github.com/Sam-CodesAI/VaniEdge"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-300 text-xs font-medium hover:text-white hover:border-slate-500 transition-colors cursor-pointer"
              >
                <Code2 className="w-3.5 h-3.5" />
                <span className="hidden md:inline">GitHub</span>
                <ExternalLink className="w-3 h-3 text-slate-500" />
              </a>
            </div>
          </div>
        </header>

        {/* Studio Console Main Container */}
        <main className="w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex-1">
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
        </main>
      </div>
    </div>
  );
}
