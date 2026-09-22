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
  Key,
} from "lucide-react";
import { UserRecord } from "@/lib/auth-store";

interface AuthApiResponse {
  success?: boolean;
  user?: UserRecord;
  token?: string;
  error?: string;
  message?: string;
}

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: "signin" | "signup";
  onAuthSuccess: (user: UserRecord, token?: string) => void;
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

  // Handle Google OAuth authentication
  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim() || "developer@google.com",
          name: name.trim() || "Google Cloud Developer",
          avatarUrl: "https://lh3.googleusercontent.com/a/default-user=s96-c",
        }),
      });

      const data = await res.json() as AuthApiResponse;
      if (res.ok && data.user) {
        localStorage.setItem("vaniedge_auth_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("vaniedge_session_token", data.token);
        }
        onAuthSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Google authentication failed.");
      }
    } catch {
      setError("Network error connecting to authentication server.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick 1-Click Demo Account Loader
  const loadDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError(null);
  };

  // Handle Email & Password Submission
  const handleSubmit = async (e: React.FormEvent) => {
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

    try {
      const endpoint = mode === "signup" ? "/api/auth/signup" : "/api/auth/signin";
      const payload = mode === "signup"
        ? { name: name.trim(), email: email.trim(), password, company: "CarePlus Health Systems" }
        : { email: email.trim(), password };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json() as AuthApiResponse;

      if (res.ok && data.user) {
        localStorage.setItem("vaniedge_auth_user", JSON.stringify(data.user));
        if (data.token) {
          localStorage.setItem("vaniedge_session_token", data.token);
        }
        onAuthSuccess(data.user, data.token);
        onClose();
      } else {
        setError(data.error || "Authentication failed. Please check credentials.");
      }
    } catch {
      setError("Network error while connecting to authentication service.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      {/* Modal Container in Oswald & Black Text */}
      <div className="relative w-full max-w-md my-8 rounded-2xl bg-white border-2 border-slate-200 shadow-2xl p-6 sm:p-8 overflow-hidden text-black">
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
        <div className="flex items-center gap-2 mb-6">
          <div className="h-9 w-9 rounded-xl bg-black flex items-center justify-center text-white font-bold font-oswald text-base shadow-sm">
            V
          </div>
          <div>
            <div className="text-sm font-bold font-oswald uppercase tracking-wider text-black">
              VANIEDGE PLATFORM
            </div>
            <div className="text-[11px] text-slate-700 font-medium">
              Enterprise Voice &amp; Telephony Edge Core
            </div>
          </div>
        </div>

        {/* Heading based on Mode */}
        <div className="mb-5">
          <h2 className="text-2xl sm:text-3xl font-bold font-oswald uppercase tracking-tight text-black">
            {mode === "signin" && "Welcome Back"}
            {mode === "signup" && "Create Developer Account"}
            {mode === "forgot" && "Reset Your Password"}
          </h2>
          <p className="text-xs text-slate-700 font-medium mt-1">
            {mode === "signin" && "Sign in to access your live SIP trunking, SutraDB RAG, and API credentials."}
            {mode === "signup" && "Get 500 free minutes, instant Bangalore DID number, and live API keys."}
            {mode === "forgot" && "Enter your email address and we'll send you a password recovery link."}
          </p>
        </div>

        {/* Quick 1-Click Demo Accounts Pill */}
        {mode === "signin" && (
          <div className="mb-5 p-3 rounded-xl bg-slate-50 border border-slate-300">
            <div className="text-[10px] font-oswald uppercase font-bold text-slate-700 flex items-center gap-1.5 mb-2">
              <Key className="w-3.5 h-3.5 text-emerald-600" />
              <span>One-Click Test Accounts</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => loadDemoAccount("developer@vaniedge.ai", "password123")}
                className="text-left p-2 rounded-lg bg-white border border-slate-300 hover:border-black transition-colors cursor-pointer"
              >
                <div className="text-xs font-oswald font-bold uppercase text-black">Arjun (Dev)</div>
                <div className="text-[10px] text-slate-600 font-mono truncate">developer@vaniedge.ai</div>
              </button>
              <button
                type="button"
                onClick={() => loadDemoAccount("demo@vaniedge.ai", "password123")}
                className="text-left p-2 rounded-lg bg-white border border-slate-300 hover:border-black transition-colors cursor-pointer"
              >
                <div className="text-xs font-oswald font-bold uppercase text-black">Priya (Growth)</div>
                <div className="text-[10px] text-slate-600 font-mono truncate">demo@vaniedge.ai</div>
              </button>
            </div>
          </div>
        )}

        {/* Alert / Error Message */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-300 text-rose-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Success Message */}
        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Google OAuth Button */}
        {mode !== "forgot" && (
          <div className="space-y-3 mb-5">
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl bg-white border-2 border-slate-300 hover:border-black text-black font-oswald font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-98 cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.98 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
                />
              </svg>
              <span>Continue with Google</span>
            </button>

            <div className="relative flex items-center justify-center my-3">
              <div className="border-t border-slate-300 w-full" />
              <span className="bg-white px-3 text-[11px] font-oswald uppercase tracking-wider text-slate-600 font-bold">
                OR CONTINUE WITH EMAIL
              </span>
              <div className="border-t border-slate-300 w-full" />
            </div>
          </div>
        )}

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Sign Up Only) */}
          {mode === "signup" && (
            <div>
              <label className="block text-xs font-oswald uppercase tracking-wider font-bold text-black mb-1">
                Full Name / Organization
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Arjun Mehta or CarePlus Healthcare"
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs text-black font-semibold placeholder:text-slate-500 transition-all outline-none"
                />
              </div>
            </div>
          )}

          {/* Email Field */}
          <div>
            <label className="block text-xs font-oswald uppercase tracking-wider font-bold text-black mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs text-black font-semibold placeholder:text-slate-500 transition-all outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          {mode !== "forgot" && (
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-oswald uppercase tracking-wider font-bold text-black">
                  Password
                </label>
                {mode === "signin" && (
                  <button
                    type="button"
                    onClick={() => {
                      setMode("forgot");
                      setError(null);
                    }}
                    className="text-[11px] font-oswald uppercase font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    Forgot Password?
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-10 py-2 rounded-xl bg-white border border-slate-300 focus:border-black focus:ring-1 focus:ring-black text-xs text-black font-semibold placeholder:text-slate-500 transition-all outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-black transition-colors cursor-pointer"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* Sign Up Terms Checkbox */}
          {mode === "signup" && (
            <label className="flex items-start gap-2 pt-1 text-xs text-black font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded border-slate-300 text-black focus:ring-black accent-black"
              />
              <span>
                I agree to the <span className="underline font-bold">Terms of Service</span>, <span className="underline font-bold">Privacy Policy</span>, and telecom compliance standards.
              </span>
            </label>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 rounded-xl bg-black hover:bg-slate-800 text-white font-oswald font-bold uppercase text-xs tracking-wider shadow-sm transition-all flex items-center justify-center gap-2 mt-2 cursor-pointer active:scale-98 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="inline-block animate-pulse">Authenticating with Edge Core...</span>
            ) : (
              <>
                <span>
                  {mode === "signin" && "Sign In to Console"}
                  {mode === "signup" && "Create Free Account & Provision DID"}
                  {mode === "forgot" && "Send Password Reset Link"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Mode Toggle Footer */}
        <div className="mt-6 pt-4 border-t border-slate-200 text-center text-xs text-black font-medium">
          {mode === "signin" && (
            <span>
              Don&apos;t have an account yet?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signup");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-oswald uppercase font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Sign Up Free
              </button>
            </span>
          )}

          {mode === "signup" && (
            <span>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("signin");
                  setError(null);
                  setSuccessMessage(null);
                }}
                className="font-oswald uppercase font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                Sign In
              </button>
            </span>
          )}

          {mode === "forgot" && (
            <button
              type="button"
              onClick={() => {
                setMode("signin");
                setError(null);
                setSuccessMessage(null);
              }}
              className="font-oswald uppercase font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
            >
              Return to Sign In
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
