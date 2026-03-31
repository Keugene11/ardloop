"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, ImagePlus, X } from "lucide-react";
import Image from "next/image";
import type { Post } from "@/types";
import { PostCard } from "./post-card";
import { createClient } from "@/lib/supabase/client";

export function Feed({
  initialPosts,
  userId,
  userAvatarUrl,
  userFullName,
}: {
  initialPosts: Post[];
  userId: string | null;
  userAvatarUrl: string | null;
  userFullName: string | null;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [userResults, setUserResults] = useState<
    { id: string; full_name: string; avatar_url: string | null }[]
  >([]);
  const [showUserResults, setShowUserResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [posting, setPosting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handlePost = async () => {
    if (!content.trim() || content.length > 5000 || posting) return;
    setPosting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) { setPosting(false); return; }

    let imageUrl: string | null = null;
    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch("/api/posts/image", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        imageUrl = data.image_url;
      }
    }

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      image_url: imageUrl,
    });

    if (!error) {
      setContent("");
      removeImage();
      router.refresh();
    }
    setPosting(false);
  };

  const autoResize = (el: HTMLTextAreaElement) => {
    el.style.height = "auto";
    el.style.height = el.scrollHeight + "px";
  };

  useEffect(() => {
    if (!search.trim()) {
      setUserResults([]);
      setShowUserResults(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(
        `/api/search/users?q=${encodeURIComponent(search.trim())}`
      );
      if (res.ok) {
        const data = await res.json();
        setUserResults(data);
        setShowUserResults(data.length > 0);
      }
    }, 250);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowUserResults(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filtered = initialPosts.filter((p) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      p.content.toLowerCase().includes(q) ||
      p.author.full_name.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      {userId && (
        <div className="border-b border-border pb-3 mb-1">
          <div className="flex gap-3">
            {userAvatarUrl ? (
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 mt-0.5">
                <Image
                  src={userAvatarUrl}
                  alt={userFullName || "You"}
                  width={36}
                  height={36}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-[13px] font-semibold text-text-muted shrink-0 mt-0.5">
                {userFullName?.[0] || "?"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <textarea
                ref={textareaRef}
                data-composer
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  autoResize(e.target);
                }}
                placeholder="What's happening in Ardsley?"
                rows={1}
                className="w-full bg-transparent text-[15px] placeholder:text-text-muted/40 outline-none resize-none leading-relaxed"
              />

              {imagePreview && (
                <div className="relative mt-2">
                  <div className="rounded-xl overflow-hidden">
                    <Image
                      src={imagePreview}
                      alt="Selected image"
                      width={400}
                      height={300}
                      className="w-full object-cover max-h-[200px]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1.5 right-1.5 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center press"
                  >
                    <X size={14} strokeWidth={2} className="text-white" />
                  </button>
                </div>
              )}

              <div className="flex items-center justify-between mt-2">
                <div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-text-muted/50 press"
                  >
                    <ImagePlus size={18} strokeWidth={1.5} />
                  </button>
                </div>
                {content.length > 4500 && (
                  <span
                    className={`text-[12px] ${
                      content.length > 5000 ? "text-red-500 font-semibold" : "text-text-muted"
                    }`}
                  >
                    {content.length}/5000
                  </span>
                )}
                <button
                  onClick={handlePost}
                  disabled={!content.trim() || content.length > 5000 || posting}
                  className="bg-[#1a1a1a] text-white px-4 py-1.5 rounded-full font-semibold text-[13px] press disabled:opacity-30"
                >
                  {posting ? "Posting..." : "Post"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="relative mb-2 mt-2" ref={searchRef}>
        <Search
          size={15}
          strokeWidth={1.5}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted/50 z-10"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onFocus={() => {
            if (userResults.length > 0) setShowUserResults(true);
          }}
          placeholder="Search posts and people..."
          className="w-full bg-bg-input rounded-full pl-9 pr-4 py-2 text-[13px] placeholder:text-text-muted/40 outline-none focus:ring-1 focus:ring-text-muted/30 transition-all"
        />
        {showUserResults && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-bg-card border border-border rounded-2xl shadow-lg overflow-hidden z-50 animate-fade-in">
            <p className="px-4 pt-2.5 pb-1.5 text-[10px] uppercase tracking-wide text-text-muted font-semibold">
              People
            </p>
            {userResults.map((u) => (
              <Link
                key={u.id}
                href={`/user/${u.id}`}
                onClick={() => setShowUserResults(false)}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-bg-card-hover transition-colors press"
              >
                {u.avatar_url ? (
                  <Image
                    src={u.avatar_url}
                    alt={u.full_name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center text-[12px] font-semibold text-text-muted">
                    {u.full_name?.[0] || "?"}
                  </div>
                )}
                <span className="text-[14px] font-medium">{u.full_name}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="divide-y divide-border">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-text-muted text-[14px]">
            {search ? "No results." : "No posts yet."}
          </div>
        ) : (
          filtered.map((post) => (
            <PostCard key={post.id} post={post} userId={userId} />
          ))
        )}
      </div>
    </div>
  );
}
