"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [demoLoading, setDemoLoading] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const showDemo = tapCount >= 5;

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    try {
      const res = await fetch("/api/demo-login", { method: "POST" });
      if (!res.ok) { setDemoLoading(false); return; }
      const { access_token, refresh_token } = await res.json();
      if (access_token && refresh_token) {
        const supabase = createClient();
        await supabase.auth.setSession({ access_token, refresh_token });
        window.location.href = "/";
      } else {
        setDemoLoading(false);
      }
    } catch {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
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

        {showDemo && (
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full mt-3 flex items-center justify-center gap-2 bg-bg-input text-text py-3.5 rounded-2xl font-semibold press text-[14px]"
          >
            {demoLoading ? "Signing in..." : "Demo Login"}
          </button>
        )}

        <p className="text-[12px] text-text-muted/60 text-center mt-8">
          By signing in, you agree to be a good neighbor.
        </p>
      </div>
    </div>
  );
}
