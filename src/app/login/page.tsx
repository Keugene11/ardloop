"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { isNativePlatform, nativeOAuthSignIn } from "@/lib/capacitor-auth";

export default function LoginPage() {
  const [demoLoading, setDemoLoading] = useState(false);
  const [demo2Loading, setDemo2Loading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [showApple, setShowApple] = useState(false);
  const [showEmail, setShowEmail] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");
  const showDemo = tapCount >= 5;

  useEffect(() => {
    // Show Apple sign-in only on iOS native app or Apple devices (Safari/macOS/iOS web)
    const isAppleDevice =
      isNativePlatform()
        ? /iPad|iPhone|iPod/.test(navigator.userAgent)
        : /Mac|iPad|iPhone|iPod/.test(navigator.userAgent) ||
          (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
    setShowApple(isAppleDevice);
  }, []);

  const handleGoogleLogin = async () => {
    if (isNativePlatform()) {
      await nativeOAuthSignIn("google");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
        queryParams: { prompt: "select_account" },
      },
    });
  };

  const handleAppleLogin = async () => {
    if (isNativePlatform()) {
      await nativeOAuthSignIn("apple");
      return;
    }
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");
    setEmailLoading(true);

    const supabase = createClient();

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName },
        },
      });
      setEmailLoading(false);
      if (error) {
        setEmailError(error.message);
      } else {
        setEmailSuccess("Check your email to confirm your account.");
      }
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      setEmailLoading(false);
      if (error) {
        setEmailError(error.message);
      } else {
        // Ensure profile exists for email/password users
        if (data.user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id")
            .eq("id", data.user.id)
            .single();
          if (!profile) {
            await supabase.from("profiles").insert({
              id: data.user.id,
              email: data.user.email,
              full_name: data.user.user_metadata.full_name || "",
            });
          }
        }
        window.location.href = "/";
      }
    }
  };

  const handleDemoLogin = async (endpoint: string, setLoading: (v: boolean) => void) => {
    setLoading(true);
    try {
      const res = await fetch(endpoint, { method: "POST" });
      if (!res.ok) { setLoading(false); return; }
      const { access_token, refresh_token } = await res.json();
      if (access_token && refresh_token) {
        const supabase = createClient();
        await supabase.auth.setSession({ access_token, refresh_token });
        window.location.href = "/";
      } else {
        setLoading(false);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-12">
          <h1 className="text-[42px] font-extrabold tracking-tight text-text">
            Ardsleypost
          </h1>
          <p
            className="text-[15px] text-text-muted mt-1"
            onClick={() => setTapCount((c) => c + 1)}
          >
            Your Ardsley community
          </p>
        </div>

        <button
          onClick={handleGoogleLogin}
          className="w-full flex items-center justify-center gap-3 bg-[#1a1a1a] text-white py-4 rounded-2xl font-semibold press text-[15px] shadow-sm"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
              fill="#4285F4"
            />
            <path
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              fill="#34A853"
            />
            <path
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              fill="#FBBC05"
            />
            <path
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              fill="#EA4335"
            />
          </svg>
          Continue with Google
        </button>

        {showApple && (
          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center gap-3 border border-border bg-bg-card text-text py-4 rounded-2xl font-semibold press text-[15px] shadow-sm mt-3"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
            </svg>
            Continue with Apple
          </button>
        )}

        <div className="flex items-center gap-3 mt-5 mb-5">
          <div className="flex-1 h-px bg-border" />
          <span className="text-[12px] text-text-muted">or</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {!showEmail ? (
          <button
            onClick={() => setShowEmail(true)}
            className="w-full flex items-center justify-center gap-2 border border-border bg-bg-card text-text py-4 rounded-2xl font-semibold press text-[15px] shadow-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Continue with Email
          </button>
        ) : (
          <form onSubmit={handleEmailAuth} className="space-y-3">
            {isSignUp && (
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
            />
            {emailError && (
              <p className="text-[13px] text-red-500">{emailError}</p>
            )}
            {emailSuccess && (
              <p className="text-[13px] text-green-600">{emailSuccess}</p>
            )}
            <button
              type="submit"
              disabled={emailLoading}
              className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-2xl font-semibold press text-[15px]"
            >
              {emailLoading
                ? "Loading..."
                : isSignUp
                  ? "Create Account"
                  : "Sign In"}
            </button>
            <p className="text-center text-[13px] text-text-muted">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setEmailError("");
                  setEmailSuccess("");
                }}
                className="text-text font-semibold underline underline-offset-2"
              >
                {isSignUp ? "Sign in" : "Sign up"}
              </button>
            </p>
          </form>
        )}

        <div className="flex items-center justify-center gap-3 mt-6 text-[12px] text-text-muted">
          <a href="/terms" className="underline underline-offset-2">
            Terms of Service
          </a>
          <span>·</span>
          <a href="/privacy" className="underline underline-offset-2">
            Privacy Policy
          </a>
        </div>

        {showDemo && (
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => handleDemoLogin("/api/demo-login", setDemoLoading)}
              disabled={demoLoading || demo2Loading}
              className="flex-1 flex items-center justify-center gap-2 bg-bg-input text-text py-3.5 rounded-2xl font-semibold press text-[14px]"
            >
              {demoLoading ? "Signing in..." : "Demo User 1"}
            </button>
            <button
              onClick={() => handleDemoLogin("/api/demo-login2", setDemo2Loading)}
              disabled={demoLoading || demo2Loading}
              className="flex-1 flex items-center justify-center gap-2 bg-bg-input text-text py-3.5 rounded-2xl font-semibold press text-[14px]"
            >
              {demo2Loading ? "Signing in..." : "Demo User 2"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
