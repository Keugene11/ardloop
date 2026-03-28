"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Pencil, CreditCard, CheckCircle } from "lucide-react";

export function ProfileActions({
  userId,
  bio,
  stripeOnboarded,
}: {
  userId: string;
  bio: string;
  stripeOnboarded: boolean;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [bioValue, setBioValue] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSaveBio = async () => {
    setSaving(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ bio: bioValue.trim() })
      .eq("id", userId);
    setEditing(false);
    setSaving(false);
    router.refresh();
  };

  const handleStripeConnect = async () => {
    setConnectingStripe(true);
    const res = await fetch("/api/connect/onboard", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      alert("Failed to start Stripe setup");
      setConnectingStripe(false);
    }
  };

  return (
    <div className="space-y-3">
      {/* Stripe Connect Status */}
      <div className="bg-bg-card border border-border rounded-2xl px-4 py-3.5">
        {stripeOnboarded ? (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle size={16} strokeWidth={2} />
            <span className="text-[13px] font-semibold">
              Payments enabled — you can receive payouts
            </span>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[13px] font-semibold">Set up payments</p>
              <p className="text-[11px] text-text-muted">
                Connect Stripe to sell services and receive payouts
              </p>
            </div>
            <button
              onClick={handleStripeConnect}
              disabled={connectingStripe}
              className="flex items-center gap-2 bg-[#1a1a1a] text-white px-4 py-2 rounded-xl text-[12px] font-semibold press disabled:opacity-40"
            >
              <CreditCard size={14} strokeWidth={1.5} />
              {connectingStripe ? "Loading..." : "Connect"}
            </button>
          </div>
        )}
      </div>

      {/* Bio */}
      {editing ? (
        <div className="bg-bg-card border border-border rounded-2xl px-4 py-4">
          <label className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-2 block">
            About You
          </label>
          <textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            placeholder={"Tell Ardsley about yourself...\n\nE.g. I offer math & science tutoring for grades 6-12. 3 years of experience. $30/hr."}
            className="w-full bg-transparent text-[14px] placeholder:text-text-muted/50 outline-none resize-none min-h-[120px] mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleSaveBio}
              disabled={saving}
              className="bg-[#1a1a1a] text-white px-5 py-2.5 rounded-xl font-semibold text-[13px] press"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setBioValue(bio);
              }}
              className="border border-border px-4 py-2.5 rounded-xl text-[13px] press"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 text-[13px] font-semibold press"
          >
            <Pencil size={14} strokeWidth={1.5} />
            {bio ? "Edit Bio" : "Add Bio"}
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-2 border border-border rounded-xl px-4 py-2.5 text-[13px] font-semibold text-red-500 press ml-auto"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
