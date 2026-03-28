"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Post } from "@/types";
import { PostCard } from "./post-card";

export function Feed({
  initialPosts,
  userId,
}: {
  initialPosts: Post[];
  userId: string | null;
}) {
  const [search, setSearch] = useState("");

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
      <div className="relative mb-4">
        <Search
          size={16}
          strokeWidth={1.5}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted"
        />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search posts..."
          className="w-full bg-bg-card border border-border rounded-full pl-9 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
        />
      </div>

      <div className="space-y-3 stagger">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-[14px]">
            {search
              ? "No posts match your search."
              : "No posts yet. Be the first to share something!"}
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
