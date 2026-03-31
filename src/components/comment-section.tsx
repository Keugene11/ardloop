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
    if (!newComment.trim() || newComment.length > 2000 || !userId || submitting) return;

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
      <div className="flex items-center gap-5 mb-4">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 text-[13px] font-medium press ${
            liked ? "text-red-500" : "text-text-muted"
          }`}
        >
          <Heart
            size={16}
            fill={liked ? "currentColor" : "none"}
            strokeWidth={1.5}
          />
          {likeCount > 0 && likeCount}
        </button>
        <span className="text-[13px] text-text-muted">
          {comments.length} {comments.length === 1 ? "reply" : "replies"}
        </span>
      </div>

      {comments.length > 0 && (
        <div className="mb-4">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2.5 py-2.5">
              <Link
                href={`/user/${comment.author_id}`}
                className="shrink-0 mt-0.5"
              >
                {comment.author.avatar_url ? (
                  <div className="w-7 h-7 rounded-full overflow-hidden">
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
              <div className="min-w-0">
                <div className="flex items-baseline gap-2">
                  <Link
                    href={`/user/${comment.author_id}`}
                    className="text-[13px] font-semibold hover:underline"
                  >
                    {comment.author.full_name}
                  </Link>
                  <span className="text-[11px] text-text-muted">
                    {timeAgo(comment.created_at)}
                  </span>
                </div>
                <p className="text-[14px] leading-snug mt-0.5">
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
            maxLength={2000}
            className="flex-1 bg-bg-input rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:ring-1 focus:ring-text-muted/30 transition-all"
          />
          <button
            type="submit"
            disabled={!newComment.trim() || submitting}
            className="bg-[#1a1a1a] text-white p-3 rounded-full press disabled:opacity-30"
          >
            <Send size={18} strokeWidth={1.5} />
          </button>
        </form>
      )}
    </div>
  );
}
