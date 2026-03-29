"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Heart, MessageCircle, Send } from "lucide-react";
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
      <article className="flex gap-3 py-3.5">
        <Link
          href={`/user/${post.author_id}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 mt-0.5"
        >
          {post.author.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden">
              <Image
                src={post.author.avatar_url}
                alt={post.author.full_name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-[13px] font-semibold text-text-muted">
              {post.author.full_name?.[0] || "?"}
            </div>
          )}
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <Link
              href={`/user/${post.author_id}`}
              onClick={(e) => e.stopPropagation()}
              className="text-[14px] font-semibold truncate hover:underline"
            >
              {post.author.full_name}
            </Link>
            <span className="text-[12px] text-text-muted shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>

          <p className="text-[14px] leading-relaxed mt-0.5 whitespace-pre-wrap">
            {post.content}
          </p>

          {post.image_url && (
            <div className="mt-2.5 rounded-xl overflow-hidden">
              <Image
                src={post.image_url}
                alt="Post image"
                width={400}
                height={300}
                className="w-full object-cover"
              />
            </div>
          )}

          <div className="flex items-center gap-5 mt-2.5">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 text-[13px] press ${
                liked ? "text-red-500" : "text-text-muted"
              }`}
            >
              <Heart
                size={15}
                fill={liked ? "currentColor" : "none"}
                strokeWidth={1.5}
              />
              {likeCount > 0 && likeCount}
            </button>
            <span className="flex items-center gap-1 text-[13px] text-text-muted">
              <MessageCircle size={15} strokeWidth={1.5} />
              {post.comment_count > 0 && post.comment_count}
            </span>
            {userId && userId !== post.author_id && (
              <Link
                href={`/messages/${post.author_id}`}
                onClick={(e) => e.stopPropagation()}
                className="flex items-center gap-1 text-[13px] text-text-muted press ml-auto"
              >
                <Send size={14} strokeWidth={1.5} />
              </Link>
            )}
          </div>

          {post.recent_comments?.length > 0 && (
            <div className="mt-2.5 pl-1 border-l-2 border-border ml-1">
              {post.recent_comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 py-1.5 pl-2.5">
                  <Link
                    href={`/user/${comment.author_id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 mt-0.5"
                  >
                    {comment.author.avatar_url ? (
                      <div className="w-5 h-5 rounded-full overflow-hidden">
                        <Image
                          src={comment.author.avatar_url}
                          alt={comment.author.full_name}
                          width={20}
                          height={20}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-bg-input flex items-center justify-center text-[8px] font-semibold text-text-muted">
                        {comment.author.full_name?.[0] || "?"}
                      </div>
                    )}
                  </Link>
                  <p className="text-[13px] leading-snug min-w-0">
                    <Link
                      href={`/user/${comment.author_id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="font-semibold hover:underline"
                    >
                      {comment.author.full_name}
                    </Link>{" "}
                    <span className="text-text-muted">
                      {comment.content.length > 100
                        ? comment.content.slice(0, 100) + "..."
                        : comment.content}
                    </span>
                  </p>
                </div>
              ))}
              {post.comment_count > 2 && (
                <p className="text-[12px] text-text-muted pl-2.5 pt-0.5">
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
