"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function WelcomePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadedGoogle, setLoadedGoogle] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load Google profile data on mount
  useState(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const googleName =
        user.user_metadata.full_name || user.user_metadata.name || "";
      const googleAvatar = user.user_metadata.avatar_url || null;
      if (googleName && !name) setName(googleName);
      if (googleAvatar && !avatarPreview) setAvatarPreview(googleAvatar);
      setLoadedGoogle(true);
    });
  });

  const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!name.trim() || saving) return;
    setSaving(true);

    // Update name
    await fetch("/api/profile/update", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ full_name: name.trim() }),
    });

    // Upload avatar if a new one was picked
    if (avatarFile) {
      const formData = new FormData();
      formData.append("file", avatarFile);
      await fetch("/api/profile/avatar", { method: "POST", body: formData });
    }

    router.push("/");
    router.refresh();
  };

  if (!loadedGoogle) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-bg">
      <div className="w-full max-w-sm animate-slide-up">
        <div className="text-center mb-10">
          <h1 className="text-[28px] font-extrabold tracking-tight text-text">
            Welcome to Ardsleypost
          </h1>
          <p className="text-[14px] text-text-muted mt-2">
            Set up your profile so people know who you are.
          </p>
        </div>

        {/* Avatar picker */}
        <div className="flex justify-center mb-8">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group press"
          >
            {avatarPreview ? (
              <div className="w-24 h-24 rounded-full overflow-hidden">
                <Image
                  src={avatarPreview}
                  alt="Profile photo"
                  width={96}
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-24 h-24 rounded-full bg-bg-input flex items-center justify-center">
                <Camera size={28} strokeWidth={1.5} className="text-text-muted/50" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center border-2 border-bg">
              <Camera size={14} strokeWidth={2} className="text-white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleAvatarSelect}
            className="hidden"
          />
        </div>

        {/* Name input */}
        <div className="mb-8">
          <label className="text-[12px] font-medium text-text-muted uppercase tracking-wide mb-2 block">
            Your name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Full name"
            maxLength={50}
            className="w-full bg-bg-card border border-border rounded-xl px-4 py-3 text-[16px] placeholder:text-text-muted/40 outline-none focus:border-text-muted transition-colors"
            autoFocus
          />
        </div>

        {/* Continue button */}
        <button
          onClick={handleSubmit}
          disabled={!name.trim() || saving}
          className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-2xl font-semibold text-[15px] press disabled:opacity-30"
        >
          {saving ? "Setting up..." : "Continue"}
        </button>

        <button
          onClick={() => router.push("/")}
          className="w-full text-[13px] text-text-muted mt-3 py-2 press"
        >
          Skip for now
        </button>
      </div>
    </div>
  );
}
