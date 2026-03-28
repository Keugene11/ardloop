"use client";

import { useState } from "react";
import type { Post, PostCategory } from "@/types";
import { PostCard } from "./post-card";
import { categories } from "@/lib/categories";

export function Feed({
  initialPosts,
  userId,
}: {
  initialPosts: Post[];
  userId: string | null;
}) {
  const [activeCategory, setActiveCategory] = useState<PostCategory | "all">(
    "all"
  );

  const filtered =
    activeCategory === "all"
      ? initialPosts
      : initialPosts.filter((p) => p.category === activeCategory);

  return (
    <div>
      <div className="flex gap-2 overflow-x-auto pb-3 mb-4 -mx-1 px-1">
        <button
          onClick={() => setActiveCategory("all")}
          className={`shrink-0 text-[12px] font-semibold px-3.5 py-1.5 rounded-full press transition-colors ${
            activeCategory === "all"
              ? "bg-[#1a1a1a] text-white"
              : "bg-bg-card border border-border text-text-muted"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => setActiveCategory(cat.value)}
            className={`shrink-0 text-[12px] font-semibold px-3.5 py-1.5 rounded-full press transition-colors ${
              activeCategory === cat.value
                ? "bg-[#1a1a1a] text-white"
                : "bg-bg-card border border-border text-text-muted"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="space-y-3 stagger">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-text-muted text-[14px]">
            No posts yet. Be the first to share something!
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
