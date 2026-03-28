"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Pencil, CreditCard, CheckCircle, Camera } from "lucide-react";

export function ProfileActions({
  userId,
  fullName,
  avatarUrl,
  bio,
  stripeOnboarded,
}: {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  bio: string;
  stripeOnboarded: boolean;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [nameValue, setNameValue] = useState(fullName);
  const [bioValue, setBioValue] = useState(bio);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const [connectingStripe, setConnectingStripe] = useState(false);

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSave = async () => {
    setSaving(true);
    const supabase = createClient();

    const updates: Record<string, string> = {};
    if (nameValue.trim() !== fullName) {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: nameValue.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        alert(data.error || "Failed to update name");
        setSaving(false);
        return;
      }
    }

    if (bioValue.trim() !== bio) {
      await supabase
        .from("profiles")
        .update({ bio: bioValue.trim() })
        .eq("id", userId);
    }

    setEditing(false);
    setSaving(false);
    router.refresh();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Client-side validation
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      alert("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    if (file.size < 10 * 1024) {
      alert("Image is too small. Minimum size is 10KB — use a higher quality photo.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image is too large. Maximum size is 5MB.");
      return;
    }

    setUploadingAvatar(true);

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/profile/avatar", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (res.ok) {
      setAvatarPreview(data.avatar_url);
      router.refresh();
    } else {
      alert(data.error || "Failed to upload");
    }

    setUploadingAvatar(false);
    // Reset the input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="space-y-3">
      {/* Avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Stripe Connect */}
      {stripeOnboarded ? (
        <div className="flex items-center gap-2 text-green-600 text-[13px]">
          <CheckCircle size={15} strokeWidth={2} />
          <span>Payments enabled</span>
        </div>
      ) : (
        <button
          onClick={() => {
            setConnectingStripe(true);
            fetch("/api/connect/onboard", { method: "POST" })
              .then((r) => r.json())
              .then((data) => {
                if (data.url) window.location.href = data.url;
                else {
                  alert("Failed to start Stripe setup");
                  setConnectingStripe(false);
                }
              });
          }}
          disabled={connectingStripe}
          className="flex items-center gap-2 text-[13px] text-text-muted press disabled:opacity-40"
        >
          <CreditCard size={15} strokeWidth={1.5} />
          {connectingStripe
            ? "Connecting..."
            : "Set up payments to sell services"}
        </button>
      )}

      {/* Edit mode */}
      {editing ? (
        <div className="space-y-4">
          {/* Avatar picker */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingAvatar}
              className="relative group press"
            >
              {avatarPreview ? (
                <Image
                  src={avatarPreview}
                  alt="Avatar"
                  width={56}
                  height={56}
                  className="rounded-full object-cover"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-bg-input flex items-center justify-center text-[20px] font-semibold text-text-muted">
                  {nameValue?.[0] || "?"}
                </div>
              )}
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <Camera size={18} className="text-white" />
              </div>
              {uploadingAvatar && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </button>
            <span className="text-[12px] text-text-muted">
              Tap to change photo
            </span>
          </div>

          {/* Name */}
          <div>
            <label className="text-[12px] font-medium text-text-muted mb-1 block">
              Name
            </label>
            <input
              value={nameValue}
              onChange={(e) => setNameValue(e.target.value)}
              maxLength={50}
              className="w-full bg-bg-input rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:ring-1 focus:ring-text-muted/30 transition-all"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="text-[12px] font-medium text-text-muted mb-1 block">
              Bio
            </label>
            <textarea
              value={bioValue}
              onChange={(e) => setBioValue(e.target.value)}
              placeholder="Tell Ardsley about yourself..."
              className="w-full bg-bg-input rounded-xl p-3.5 text-[14px] placeholder:text-text-muted/40 outline-none resize-none min-h-[100px] focus:ring-1 focus:ring-text-muted/30 transition-all"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !nameValue.trim()}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full font-semibold text-[13px] press disabled:opacity-30"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditing(false);
                setNameValue(fullName);
                setBioValue(bio);
              }}
              className="text-[13px] text-text-muted px-3 py-2 press"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-1.5 text-[13px] text-text-muted press"
          >
            <Pencil size={14} strokeWidth={1.5} />
            Edit profile
          </button>
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 text-[13px] text-red-400 press ml-auto"
          >
            <LogOut size={14} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}
