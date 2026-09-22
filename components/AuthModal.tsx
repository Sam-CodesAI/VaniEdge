"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Building2,
} from "lucide-react";

export interface AuthUser {
  name: string;
  email: string;
  provider: "google" | "email";
  avatarUrl?: string;
  tier: "Free Trial" | "Starter" | "Growth" | "Enterprise";
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onAuthSuccess: (user: AuthUser) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = "signin",
  onAuthSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<"signin" | "signup" | "forgot">(initialMode);
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [agreeTerms, setAgreeTerms] = useState<boolean>(true);

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Sync mode whenever modal opens with initialMode
  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError(null);
      setSuccessMessage(null);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Handle Google OAuth 1-Click Simulation (ElevenLabs / IBM style)
  const handleGoogleAuth = () => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const mockGoogleUser: AuthUser = {
        name: "Google Cloud User",
        email: email.trim() || "developer@google.com",
        provider: "google",
        avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        tier: "Free Trial",
      };
      localStorage.setItem("vaniedge_auth_user", JSON.stringify(mockGoogleUser));
      setIsLoading(false);
      onAuthSuccess(mockGoogleUser);
      onClose();
    }, 850);
  };

  // Handle Email & Password Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid business or personal email address.");
      return;
    }

    if (mode === "forgot") {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessMessage(`Password recovery link dispatched to ${email}. Check your inbox.`);
      }, 750);
      return;
    }

    if (!password || password.length < 6) {
      setError("Password must contain at least 6 characters.");
      return;
    }

    if (mode === "signup" && !name.trim()) {
      setError("Please enter your full name or company name.");
      return;
    }

    if (mode === "signup" && !agreeTerms) {
      setError("Please agree to the Terms of Service & Privacy Policy.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: AuthUser = {
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        provider: "email",
        tier: "Starter",
      };
      localStorage.setItem("vaniedge_auth_user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container in Oswald & Black Text */}
      <div className="relative w-full max-w-md rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden text-black">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-black hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-10 w-10 rounded-xl overflow-hidden border-2 border-emerald-500 shadow-md">
              <img
                src="/vaniedge-logo.png"
                alt="VaniEdge Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-bold text-2xl text-black font-oswald uppercase tracking-tight">
              VaniEdge <span className="text-emerald-800 text-xs font-mono font-bold uppercase px-2 py-0.5 rounded bg-emerald-100 border border-emerald-300">AI</span>
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-bold text-black font-oswald uppercase tracking-tight">
            {mode === "signin"
              ? "Welcome back to VaniEdge"
              : mode === "signup"
              ? "Start Your Voice AI Trial"
              : "Reset Your Password"}
          </h2>
          <p className="text-xs sm:text-sm text-black font-medium mt-1.5">
            {mode === "signin"
              ? "Access your telephony agents, SutraDB RAG, and call transcripts."
              : mode === "signup"
              ? "Deploy enterprise voice telephony in minutes. 500 free minutes included."
              : "Enter your verified email address to receive password reset instructions."}
          </p>
        </div>

        {/* Sign In / Sign Up Mode Pill Switcher */}
        {mode !== "forgot" && (
          <div className="flex rounded-xl bg-slate-100 border border-slate-300 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-oswald uppercase tracking-wider transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-black text-white shadow-sm"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold font-oswald uppercase tracking-wider transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-black text-white shadow-sm"
                  : "text-slate-600 hover:text-black"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border-2 border-rose-300 flex items-start gap-2.5 text-xs text-rose-900 font-medium">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border-2 border-emerald-300 flex items-start gap-2.5 text-xs text-emerald-900 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google One-Tap OAuth Button */}
        {mode !== "forgot" && (
          <div className="space-y-4 mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 border-2 border-slate-300 text-black font-bold font-oswald text-xs uppercase tracking-wider flex items-center justify-center gap-3 transition-all shadow-sm active:scale-98 cursor-pointer disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{mode === "signin" ? "Sign in with Google" : "Sign up with Google"}</span>
            </button>

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-300 w-full" />
              <span className="bg-white px-3 text-[11px] font-oswald text-black uppercase tracking-wider font-bold shrink-0">
                Or with Email &amp; Password
              </span>
              <div className="border-t border-slate-300 w-full" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-bold font-oswald uppercase text-black mb-1.5">
                Full Name or Business Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Aarav Sharma"
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold font-oswald uppercase text-black mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@business.com"
                required
                className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium transition-colors"
              />
            </div>
          </div>

          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold font-oswald uppercase text-black">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-[11px] text-emerald-800 hover:underline font-bold"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-slate-50 border-2 border-slate-300 rounded-xl pl-10 pr-10 py-2.5 text-xs text-black focus:outline-none focus:border-black font-medium transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-black transition-colors"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {mode === "signin" && (
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 text-black cursor-pointer select-none font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-black focus:ring-black"
                />
                <span>Remember this workstation</span>
              </label>
            </div>
          )}

          {mode === "signup" && (
            <div className="flex items-start gap-2 text-xs pt-0.5">
              <input
                type="checkbox"
                id="agree-terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-slate-300 text-black focus:ring-black mt-0.5"
              />
              <label htmlFor="agree-terms" className="text-black font-medium select-none text-[11px]">
                I agree to the <span className="underline font-bold">Terms of Service</span> and{" "}
                <span className="underline font-bold">Privacy Policy</span>.
              </label>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-black hover:bg-slate-800 disabled:opacity-50 text-white font-bold font-oswald uppercase tracking-wider text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer mt-2"
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Authenticating with Edge...</span>
              </div>
            ) : (
              <>
                <span>
                  {mode === "signin"
                    ? "Sign In to Mission Control"
                    : mode === "signup"
                    ? "Create Account & Provision Line"
                    : "Send Password Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {mode === "forgot" && (
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setMode("signin")}
              className="text-xs text-black hover:underline font-bold font-oswald uppercase"
            >
              ← Back to Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
