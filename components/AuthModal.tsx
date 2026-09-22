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

    if (mode === "signup" && !agreeTerms) {
      setError("Please accept the Terms of Service to create your account.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      const user: AuthUser = {
        name: name.trim() || email.split("@")[0],
        email: email.trim(),
        provider: "email",
        tier: "Free Trial",
      };
      localStorage.setItem("vaniedge_auth_user", JSON.stringify(user));
      onAuthSuccess(user);
      onClose();
    }, 800);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container */}
      <div
        className="relative w-full max-w-md rounded-2xl bg-[#0b121e] border border-slate-700 shadow-2xl p-6 sm:p-8 overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.12) 0%, transparent 60%)",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Close Auth Modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 mb-3">
            <div className="h-9 w-9 rounded-xl overflow-hidden border border-cyan-500/40 shadow-[0_0_15px_rgba(6,182,212,0.3)]">
              <img
                src="/vaniedge-logo.png"
                alt="VaniEdge Logo"
                className="h-full w-full object-cover"
              />
            </div>
            <span className="font-black text-xl text-white tracking-tight">
              VaniEdge <span className="text-cyan-400 text-xs font-mono font-semibold uppercase px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40">AI</span>
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {mode === "signin"
              ? "Welcome back to VaniEdge"
              : mode === "signup"
              ? "Start Your Voice AI Trial"
              : "Reset Your Password"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1.5">
            {mode === "signin"
              ? "Access your telephony agents, SutraDB RAG, and call transcripts."
              : mode === "signup"
              ? "Deploy enterprise voice telephony in minutes. 500 free minutes included."
              : "Enter your verified email address to receive password reset instructions."}
          </p>
        </div>

        {/* Sign In / Sign Up Mode Pill Switcher (Inspired by ElevenLabs) */}
        {mode !== "forgot" && (
          <div className="flex rounded-xl bg-slate-900 border border-slate-700/80 p-1 mb-5">
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
              }}
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "signin"
                  ? "bg-slate-800 text-white shadow-sm"
                  : "text-slate-400 hover:text-white"
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
              className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                mode === "signup"
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 shadow-sm"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-950/50 border border-rose-500/40 flex items-start gap-2.5 text-xs text-rose-200">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-950/50 border border-emerald-500/40 flex items-start gap-2.5 text-xs text-emerald-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google One-Tap OAuth Button (ElevenLabs / IBM Standard) */}
        {mode !== "forgot" && (
          <div className="space-y-4 mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-semibold text-xs sm:text-sm flex items-center justify-center gap-3 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50"
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
              <div className="border-t border-slate-700/80 w-full" />
              <span className="bg-[#0b121e] px-3 text-[11px] font-mono text-slate-400 uppercase tracking-wider shrink-0">
                Or with Email &amp; Password
              </span>
              <div className="border-t border-slate-700/80 w-full" />
            </div>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {/* Full Name field (Sign Up only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name or Business Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Sharma or Apex Roadside"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  required
                />
              </div>
            </div>
          )}

          {/* Email field */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Work or Personal Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                required
              />
            </div>
          </div>

          {/* Password field */}
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-300">Password</label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-[11px] text-cyan-400 hover:text-cyan-300 hover:underline cursor-pointer"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Checkbox Options */}
          {mode === "signin" ? (
            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 text-cyan-500 focus:ring-cyan-400 bg-slate-900 cursor-pointer"
              />
              <label htmlFor="remember" className="text-xs text-slate-300 cursor-pointer">
                Keep me signed in for 30 days
              </label>
            </div>
          ) : mode === "signup" ? (
            <div className="flex items-start gap-2 pt-1">
              <input
                type="checkbox"
                id="terms"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="rounded border-slate-700 text-emerald-500 focus:ring-emerald-400 bg-slate-900 mt-0.5 cursor-pointer"
              />
              <label htmlFor="terms" className="text-[11px] text-slate-300 leading-tight cursor-pointer">
                I agree to the VaniEdge Terms of Service, Privacy Policy, and Fair Use telephony guidelines.
              </label>
            </div>
          ) : null}

          {/* Submit Action Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-teal-400 hover:brightness-110 text-slate-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-98 cursor-pointer disabled:opacity-50 mt-4"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </span>
            ) : mode === "signin" ? (
              <span>Sign In with Email</span>
            ) : mode === "signup" ? (
              <span>Create Free Account</span>
            ) : (
              <span>Send Recovery Link</span>
            )}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        {/* Footer Mode Switcher */}
        <div className="mt-5 pt-4 border-t border-slate-800 text-center text-xs text-slate-400">
          {mode === "signin" ? (
            <p>
              Don't have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                }}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign up free
              </button>
            </p>
          ) : mode === "signup" ? (
            <p>
              Already registered?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Sign in
              </button>
            </p>
          ) : (
            <p>
              Remembered your password?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                }}
                className="text-cyan-400 font-semibold hover:underline cursor-pointer ml-1"
              >
                Back to Sign in
              </button>
            </p>
          )}
        </div>

        {/* Enterprise SSO Reference (IBM / ElevenLabs Style) */}
        <div className="mt-3 text-center">
          <a
            href="https://t.me/Samarth1306"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-slate-200 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Looking for Enterprise SSO (SAML / Okta)? Inquire with Solutions Desk</span>
          </a>
        </div>
      </div>
    </div>
  );
}
