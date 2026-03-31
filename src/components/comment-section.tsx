"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";
import type { Comment } from "@/types";

export function CommentSection({
  postId,
  userId,
  initialComments,
  likeCount: initialLikeCount,
  userHasLiked: initialHasLiked,
}: {
  postId: string;
  userId: string | null;
  initialComments: Comment[];
  likeCount: number;
  userHasLiked: boolean;
}) {
  const [comments, setComments] = useState(initialComments);
  const [newComment, setNewComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [liked, setLiked] = useState(initialHasLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);

  const handleLike = async () => {
    if (!userId) return;

    // Optimistic update
    const wasLiked = liked;
    setLiked(!wasLiked);
    setLikeCount((c) => (wasLiked ? c - 1 : c + 1));

    const supabase = createClient();
    const { error } = wasLiked
      ? await supabase.from("likes").delete().eq("post_id", postId).eq("user_id", userId)
      : await supabase.from("likes").insert({ post_id: postId, user_id: userId });

    if (error) {
      setLiked(wasLiked);
      setLikeCount((c) => (wasLiked ? c + 1 : c - 1));
    }
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !userId || submitting) return;

    setSubmitting(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("comments")
      .insert({
        post_id: postId,
        author_id: userId,
        content: newComment.trim(),
      })
      .select("*, author:profiles(*)")
      .single();

    if (data) {
      setComments((prev) => [...prev, data]);
      setNewComment("");
    }
    setSubmitting(false);
  };

  return (
    <div>
      <div className="flex items-center gap-6 mb-5">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-[14px] font-medium press transition-colors ${
            liked ? "text-red-500" : "text-text-muted/60 hover:text-red-400"
          }`}
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          {likeCount > 0 && <span>{likeCount}</span>}
        </button>
        <span className="text-[14px] text-text-muted/60">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      {comments.length > 0 && (
        <div className="space-y-0.5 mb-5">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 py-2.5">
              <Link
                href={`/user/${comment.author_id}`}
                className="shrink-0 mt-0.5"
              >
                {comment.author.avatar_url ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden ring-1 ring-border">
                    <Image
                      src={comment.author.avatar_url}
                      alt={comment.author.full_name}
                      width={28}
                      height={28}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full bg-bg-input flex items-center justify-center text-[10px] font-semibold text-text-muted">
                    {comment.author.full_name?.[0] || "?"}
                  </div>
                )}
              </Link>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/user/${comment.author_id}`}
                    className="text-[13px] font-semibold hover:underline"
                  >
                    {comment.author.full_name}
                  </Link>
                  <span className="text-[11px] text-text-muted/50">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-[14px] leading-snug mt-0.5 whitespace-pre-wrap break-words">
                  {comment.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {userId && (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Reply..."
            className="flex-1 bg-bg-input/70 border border-transparent focus:border-border rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/40 outline-none transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-[#1a1a1a] text-white p-2.5 rounded-full press disabled:opacity-20 transition-opacity"
          >
            <Send size={16} strokeWidth={1.5} />
          </button>
        </form>
      )}
    </div>
  );
}
