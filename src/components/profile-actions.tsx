"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Camera, Check, X } from "lucide-react";

export function ProfileActions({
  userId,
  fullName,
  avatarUrl,
  email,
  bio,
}: {
  userId: string;
  fullName: string;
  avatarUrl: string | null;
  email: string;
  bio: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editingName, setEditingName] = useState(false);
  const [editingBio, setEditingBio] = useState(false);
  const [nameValue, setNameValue] = useState(fullName);
  const [bioValue, setBioValue] = useState(bio);
  const [savingName, setSavingName] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(avatarUrl);
  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleSaveName = async () => {
    if (!nameValue.trim() || nameValue.trim() === fullName) {
      setEditingName(false);
      setNameValue(fullName);
      return;
    }
    setSavingName(true);
    const res = await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: nameValue.trim() }),
    });
    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update name");
    }
    setSavingName(false);
    setEditingName(false);
    router.refresh();
  };

  const handleSaveBio = async () => {
    setSavingBio(true);
    const supabase = createClient();
    await supabase
      .from("profiles")
      .update({ bio: bioValue.trim() })
      .eq("id", userId);
    setSavingBio(false);
    setEditingBio(false);
    router.refresh();
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

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
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleAvatarChange}
        className="hidden"
      />

      {/* Avatar + Name + Email */}
      <div className="flex items-center gap-4 mb-5">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative group press shrink-0"
        >
          {avatarPreview ? (
            <div className="w-16 h-16 rounded-full overflow-hidden">
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-bg-input flex items-center justify-center text-[22px] font-semibold text-text-muted">
              {nameValue?.[0] || "?"}
            </div>
          )}
          <div className="absolute inset-0 rounded-full bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={18} className="text-white" />
          </div>
          {uploadingAvatar && (
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </button>

        <div className="flex-1 min-w-0">
          {editingName ? (
            <div className="flex items-center gap-1.5">
              <input
                value={nameValue}
                onChange={(e) => setNameValue(e.target.value)}
                maxLength={50}
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSaveName();
                  if (e.key === "Escape") {
                    setEditingName(false);
                    setNameValue(fullName);
                  }
                }}
                className="text-[20px] font-bold tracking-tight bg-transparent outline-none border-b border-text w-full"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="p-1 press text-text-muted"
              >
                <Check size={18} strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(fullName);
                }}
                className="p-1 press text-text-muted"
              >
                <X size={18} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-left press"
            >
              <h1 className="text-[20px] font-bold tracking-tight">
                {fullName}
              </h1>
            </button>
          )}
          <p className="text-[13px] text-text-muted">{email}</p>
        </div>
      </div>

      {/* Bio — always visible, tap to edit */}
      {editingBio ? (
        <div className="mb-5">
          <textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            placeholder={"Describe yourself to the Ardsley community.\n\nFor example:\n• Math & science tutor, grades 6-12\n• 3 years experience, $30/hr\n• Available weekends"}
            autoFocus
            className="w-full bg-bg-input rounded-xl p-3.5 text-[14px] leading-relaxed placeholder:text-text-muted/40 outline-none resize-none min-h-[130px] focus:ring-1 focus:ring-text-muted/30 transition-all"
          />
          <div className="flex gap-2 mt-2">
            <button
              onClick={handleSaveBio}
              disabled={savingBio}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full font-semibold text-[13px] press disabled:opacity-30"
            >
              {savingBio ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditingBio(false);
                setBioValue(bio);
              }}
              className="text-[13px] text-text-muted px-3 py-2 press"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingBio(true)}
          className="w-full text-left mb-5 press rounded-xl transition-colors"
        >
          {bio ? (
            <p className="text-[14px] leading-relaxed whitespace-pre-wrap">
              {bio}
            </p>
          ) : (
            <div className="bg-bg-input/50 border border-dashed border-border rounded-xl px-4 py-4">
              <p className="text-[14px] text-text-muted/60 font-medium">
                Tap to add a bio
              </p>
              <p className="text-[12px] text-text-muted/40 mt-0.5">
                Tell people what services you offer, your experience, rates, etc.
              </p>
            </div>
          )}
        </button>
      )}

      {/* Sign out */}
      <div className="flex items-center">
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-[13px] text-red-400 press ml-auto"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>
    </div>
  );
}
