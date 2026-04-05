"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function AcceptTermsModal() {
  const [loading, setLoading] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      // Update directly via client-side Supabase (uses session from memory,
      // not cookies — avoids WKWebView cookie issues on iPad/iOS native)
      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email || "",
          full_name:
            user.user_metadata?.full_name || user.user_metadata?.name || "",
          avatar_url: user.user_metadata?.avatar_url || null,
          accepted_terms: true,
        },
        { onConflict: "id" }
      );

      if (error) {
        // Fallback to server API route
        const res = await fetch("/api/accept-terms", {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) return;
      }

      setAccepted(true);
      window.location.reload();
    } finally {
      setLoading(false);
    }
  };

  if (accepted) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50" />

      <div className="relative w-full max-w-[400px] bg-bg-card rounded-3xl px-8 pt-8 pb-8 z-10 max-h-[85dvh] overflow-y-auto shadow-2xl border border-border animate-fade-in">
        <div className="text-center mb-6">
          <h2 className="text-[24px] font-bold tracking-tight text-text">
            Terms of Use
          </h2>
          <p className="text-[14px] text-text-muted mt-2 leading-snug">
            Please review and accept our terms before continuing.
          </p>
        </div>

        <div className="bg-bg-input rounded-2xl px-5 py-4 mb-6 max-h-[40dvh] overflow-y-auto text-[13px] leading-relaxed text-text-muted space-y-3">
          <p className="font-semibold text-text">Community Guidelines</p>
          <p>
            Ardsleypost is a community platform. By using this app, you agree to
            the following:
          </p>
          <ul className="list-disc list-inside space-y-1.5">
            <li>
              <strong className="text-text">Zero tolerance for objectionable content.</strong>{" "}
              You may not post, share, or transmit content that is offensive,
              abusive, harassing, hateful, sexually explicit, violent, or
              otherwise objectionable.
            </li>
            <li>
              <strong className="text-text">No abusive behavior.</strong>{" "}
              Harassment, bullying, threats, hate speech, discrimination, and
              impersonation are strictly prohibited.
            </li>
            <li>
              <strong className="text-text">Report objectionable content.</strong>{" "}
              Use the report feature to flag any content or users that violate
              these guidelines. Reports are reviewed and acted upon promptly.
            </li>
            <li>
              <strong className="text-text">Block abusive users.</strong>{" "}
              You can block any user to prevent them from contacting you or
              appearing in your feed.
            </li>
            <li>
              <strong className="text-text">Account consequences.</strong>{" "}
              Violations may result in content removal, temporary suspension, or
              permanent account termination without notice.
            </li>
          </ul>
          <p>
            Our full{" "}
            <a
              href="/terms"
              target="_blank"
              className="text-text underline underline-offset-2"
            >
              Terms of Service
            </a>{" "}
            and{" "}
            <a
              href="/privacy"
              target="_blank"
              className="text-text underline underline-offset-2"
            >
              Privacy Policy
            </a>{" "}
            apply to your use of Ardsleypost.
          </p>
        </div>

        <button
          onClick={handleAccept}
          disabled={loading}
          className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-full font-semibold press text-[14px]"
        >
          {loading ? "Loading..." : "I Agree to the Terms of Use"}
        </button>
      </div>
    </div>
  );
}
