"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
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
  const [deleted, setDeleted] = useState(false);
  const router = useRouter();

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this post?")) return;

    const supabase = createClient();
    await Promise.all([
      supabase.from("comments").delete().eq("post_id", post.id),
      supabase.from("likes").delete().eq("post_id", post.id),
    ]);
    await supabase.from("posts").delete().eq("id", post.id).eq("author_id", userId);
    setDeleted(true);
    router.refresh();
  };

  if (deleted) return null;

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    const supabase = createClient();
    const { error } = wasLiked
      ? await supabase.from("likes").delete().eq("post_id", post.id).eq("user_id", userId)
      : await supabase.from("likes").insert({ post_id: post.id, user_id: userId });

    // Revert on error
    if (error) {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="flex gap-3 py-4 group">
        <Link
          href={`/user/${post.author_id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0"
        >
          {post.author.avatar_url ? (
            <div className="w-10 h-10 rounded-full overflow-hidden ring-1 ring-border">
              <Image
                src={post.author.avatar_url}
                alt={post.author.full_name}
                width={40}
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-10 h-10 rounded-full bg-bg-input flex items-center justify-center text-[14px] font-semibold text-text-muted ring-1 ring-border">
              {post.author.full_name?.[0] || "?"}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <Link
              href={`/user/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[14px] font-semibold truncate hover:underline"
            >
              {post.author.full_name}
            </Link>
            <span className="text-[12px] text-text-muted/70 shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>

          <p className="text-[15px] leading-relaxed mt-1 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.image_url && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
              <Image
                src={post.image_url}
                alt="Post image"
                width={400}
                height={300}
                className="w-full object-cover"
                sizes="(max-width: 448px) 100vw, 400px"
              />
            </div>
          )}

          <div className="flex items-center gap-6 mt-3">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-[13px] press transition-colors ${
                liked ? "text-red-500" : "text-text-muted/60 hover:text-red-400"
              }`}
            >
              <Heart
                size={16}
                fill={liked ? "currentColor" : "none"}
                strokeWidth={1.5}
                className={liked ? "animate-[scale-pop_0.2s_ease-out]" : ""}
              />
              {likeCount > 0 && <span>{likeCount}</span>}
            </button>
            <span className="flex items-center gap-1.5 text-[13px] text-text-muted/60">
              <MessageCircle size={16} strokeWidth={1.5} />
              {post.comment_count > 0 && <span>{post.comment_count}</span>}
            </span>
            {userId && userId !== post.author_id && (
              <Link
                href={`/messages/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[13px] text-text-muted/60 hover:text-text press ml-auto"
              >
                <Send size={15} strokeWidth={1.5} />
              </Link>
            )}
            {userId && userId === post.author_id && (
              <button
                onClick={handleDelete}
                className="flex items-center gap-1 text-[13px] text-text-muted/40 hover:text-red-500 press ml-auto transition-colors"
              >
                <Trash2 size={15} strokeWidth={1.5} />
              </button>
            )}
          </div>

          {post.recent_comments?.length > 0 && (
            <div className="mt-3 space-y-0.5">
              {post.recent_comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 py-1">
                  <p className="text-[13px] leading-snug min-w-0">
                    <Link
                      href={`/user/${comment.author_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold hover:underline"
                    >
                      {comment.author.full_name}
                    </Link>{" "}
                    <span className="text-text-muted/80">
                      {comment.content.length > 80
                        ? comment.content.slice(0, 80) + "..."
                        : comment.content}
                    </span>
                  </p>
                </div>
              ))}
              {post.comment_count > 2 && (
                <p className="text-[12px] text-text-muted/60 pt-0.5">
                  View all {post.comment_count} comments
                </p>
              )}
            </div>
          )}
        </div>
      </article>
    </Link>
  );
}
