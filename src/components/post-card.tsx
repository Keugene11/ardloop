"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getCategoryLabel } from "@/lib/categories";
import type { Post } from "@/types";
import { timeAgo } from "@/lib/utils";

export function PostCard({
  post,
  userId,
}: {
  post: Post;
  userId: string | null;
}) {
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) return;

    const supabase = createClient();
    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", post.id)
        .eq("user_id", userId);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: post.id, user_id: userId });
      setLiked(true);
      setLikeCount((c) => c + 1);
    }
  };

  return (
    <Link href={`/post/${post.id}`}>
      <article className="bg-bg-card border border-border rounded-2xl px-5 py-4 hover:bg-bg-card-hover transition-colors press">
        <div className="flex items-center gap-3 mb-3">
          {post.author.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={post.author.full_name}
              width={36}
              height={36}
              className="rounded-full"
            />
          ) : (
            <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-[14px] font-semibold text-text-muted">
              {post.author.full_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[14px] font-semibold truncate">
              {post.author.full_name}
            </p>
            <p className="text-[11px] text-text-muted">
              {timeAgo(post.created_at)}
            </p>
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wide text-text-muted bg-bg-input px-2.5 py-1 rounded-full">
            {getCategoryLabel(post.category)}
          </span>
        </div>

        <p className="text-[14px] leading-relaxed mb-3 whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image_url && (
          <div className="mb-3 rounded-xl overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        )}

        <div className="flex items-center gap-5 pt-2 border-t border-border">
          <button
            onClick={handleLike}
            className={`flex items-center gap-1.5 text-[13px] press ${
              liked ? "text-red-500" : "text-text-muted"
            }`}
          >
            <Heart
              size={16}
              fill={liked ? "currentColor" : "none"}
              strokeWidth={1.5}
            />
            {likeCount}
          </button>
          <span className="flex items-center gap-1.5 text-[13px] text-text-muted">
            <MessageCircle size={16} strokeWidth={1.5} />
            {post.comment_count}
          </span>
          {userId && userId !== post.author_id && (
            <Link
              href={`/messages/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-[13px] text-text-muted press ml-auto"
            >
              <Send size={16} strokeWidth={1.5} />
            </Link>
          )}
        </div>
      </article>
    </Link>
  );
}
