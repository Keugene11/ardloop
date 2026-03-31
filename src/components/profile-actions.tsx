"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Camera, Check, X, Pencil } from "lucide-react";

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
      alert("Image is too small. Minimum size is 10KB.");
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

      {/* Header with sign out */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-[22px] font-bold tracking-tight">Profile</h1>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-[13px] text-text-muted/60 hover:text-red-500 press transition-colors"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>

      {/* Avatar + Name + Email */}
      <div className="flex items-center gap-4 mb-6">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadingAvatar}
          className="relative group press shrink-0"
        >
          {avatarPreview ? (
            <div className="w-18 h-18 rounded-full overflow-hidden ring-2 ring-border">
              <Image
                src={avatarPreview}
                alt="Avatar"
                width={72}
                height={72}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-18 h-18 rounded-full bg-bg-input flex items-center justify-center text-[24px] font-semibold text-text-muted ring-2 ring-border">
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
                className="text-[18px] font-bold tracking-tight bg-transparent outline-none border-b-2 border-text w-full py-0.5"
              />
              <button
                onClick={handleSaveName}
                disabled={savingName}
                className="p-1.5 press text-text hover:bg-bg-input rounded-full transition-colors"
              >
                <Check size={16} strokeWidth={2} />
              </button>
              <button
                onClick={() => {
                  setEditingName(false);
                  setNameValue(fullName);
                }}
                className="p-1.5 press text-text-muted hover:bg-bg-input rounded-full transition-colors"
              >
                <X size={16} strokeWidth={2} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditingName(true)}
              className="text-left press group flex items-center gap-1.5"
            >
              <h2 className="text-[18px] font-bold tracking-tight">
                {fullName}
              </h2>
              <Pencil size={13} strokeWidth={1.5} className="text-text-muted/0 group-hover:text-text-muted/60 transition-colors" />
            </button>
          )}
          <p className="text-[13px] text-text-muted/60 mt-0.5">{email}</p>
        </div>
      </div>

      {/* Bio */}
      {editingBio ? (
        <div className="mb-6">
          <textarea
            value={bioValue}
            onChange={(e) => setBioValue(e.target.value)}
            placeholder={"Describe yourself to the Ardsley community.\n\nFor example:\n• Math & science tutor, grades 6-12\n• 3 years experience, $30/hr\n• Available weekends"}
            autoFocus
            className="w-full bg-bg-input/70 border border-border focus:border-text-muted/40 rounded-xl p-3.5 text-[14px] leading-relaxed placeholder:text-text-muted/30 outline-none resize-none min-h-[130px] transition-colors"
          />
          <div className="flex gap-2 mt-2.5">
            <button
              onClick={handleSaveBio}
              disabled={savingBio}
              className="bg-[#1a1a1a] text-white px-4 py-2 rounded-full font-semibold text-[13px] press disabled:opacity-30 transition-opacity"
            >
              {savingBio ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => {
                setEditingBio(false);
                setBioValue(bio);
              }}
              className="text-[13px] text-text-muted px-3 py-2 press hover:bg-bg-input rounded-full transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setEditingBio(true)}
          className="w-full text-left mb-6 press rounded-xl transition-colors group"
        >
          {bio ? (
            <div className="flex items-start gap-2">
              <p className="text-[14px] leading-relaxed whitespace-pre-wrap flex-1">
                {bio}
              </p>
              <Pencil size={13} strokeWidth={1.5} className="text-text-muted/0 group-hover:text-text-muted/60 transition-colors mt-1 shrink-0" />
            </div>
          ) : (
            <div className="bg-bg-input/50 border border-dashed border-border rounded-xl px-4 py-4 hover:bg-bg-input/80 transition-colors">
              <p className="text-[14px] text-text-muted/60 font-medium">
                Add a bio
              </p>
              <p className="text-[12px] text-text-muted/40 mt-0.5">
                Tell people what you offer, your experience, rates, etc.
              </p>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
