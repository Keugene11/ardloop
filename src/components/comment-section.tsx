"use client";

import { useState } from "react";
import Image from "next/image";
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
    const supabase = createClient();

    if (liked) {
      await supabase
        .from("likes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", userId);
      setLiked(false);
      setLikeCount((c) => c - 1);
    } else {
      await supabase
        .from("likes")
        .insert({ post_id: postId, user_id: userId });
      setLiked(true);
      setLikeCount((c) => c + 1);
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
      <div className="flex items-center gap-4 mb-4 px-1">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-[14px] font-medium press ${
            liked ? "text-red-500" : "text-text-muted"
          }`}
        >
          <Heart
            size={18}
            fill={liked ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          {likeCount} {likeCount === 1 ? "like" : "likes"}
        </button>
        <span className="text-[14px] text-text-muted">
          {comments.length} {comments.length === 1 ? "comment" : "comments"}
        </span>
      </div>

      <div className="space-y-3 mb-4">
        {comments.map((comment) => (
          <div
            key={comment.id}
            className="bg-bg-card border border-border rounded-xl px-4 py-3"
          >
            <div className="flex items-center gap-2 mb-1.5">
              {comment.author.avatar_url ? (
                <Image
                  src={comment.author.avatar_url}
                  alt={comment.author.full_name}
                  width={24}
                  height={24}
                  className="rounded-full"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-bg-input flex items-center justify-center text-[10px] font-semibold text-text-muted">
                  {comment.author.full_name?.[0] || "?"}
                </div>
              )}
              <span className="text-[13px] font-semibold">
                {comment.author.full_name}
              </span>
              <span className="text-[11px] text-text-muted">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-[14px] leading-relaxed">{comment.content}</p>
          </div>
        ))}
      </div>

      {userId && (
        <form onSubmit={handleSubmitComment} className="flex gap-2">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 bg-bg-card border border-border rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-[#1a1a1a] text-white p-2.5 rounded-full press disabled:opacity-40"
          >
            <Send size={18} strokeWidth={1.5} />
          </button>
        </form>
      )}
    </div>
  );
}
