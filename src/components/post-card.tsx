"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Send, Trash2, Flag, Pencil, Check, X, Eye } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Post } from "@/types";
import { timeAgo } from "@/lib/utils";
import { ReportModal } from "./report-modal";

export function PostCard({
  post,
  userId,
  onVisible,
}: {
  post: Post;
  userId: string | null;
  onVisible?: (postId: string) => void;
}) {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onVisible || !cardRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onVisible(post.id);
          observer.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, [post.id, onVisible]);
  const [liked, setLiked] = useState(post.user_has_liked);
  const [likeCount, setLikeCount] = useState(post.like_count);
  const [deleted, setDeleted] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [displayContent, setDisplayContent] = useState(post.content);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }

    const supabase = createClient();
    await supabase.from("comments").delete().eq("post_id", post.id);
    await supabase.from("likes").delete().eq("post_id", post.id);
    await supabase.from("posts").delete().eq("id", post.id).eq("author_id", userId);
    setDeleted(true);
    router.refresh();
  };

  const cancelDelete = () => {
    setConfirmingDelete(false);
  };

  if (deleted) return null;

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

  const handleEdit = () => {
    setEditContent(displayContent);
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim() || editContent.length > 5000 || saving) return;
    setSaving(true);
    const supabase = createClient();
    const { error } = await supabase
      .from("posts")
      .update({ content: editContent.trim() })
      .eq("id", post.id)
      .eq("author_id", userId);
    if (!error) {
      setDisplayContent(editContent.trim());
      setEditing(false);
    }
    setSaving(false);
  };

  const handleCancelEdit = () => {
    setEditing(false);
  };

  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if user is selecting text
    const selection = window.getSelection();
    if (selection && selection.toString().length > 0) return;
    // Don't navigate if clicking on interactive elements or text content
    const target = e.target as HTMLElement;
    if (target.closest("a, button, textarea, input, [data-no-navigate]")) return;
    router.push(`/post/${post.id}`);
  };

  return (
    <>
      <article ref={cardRef} className="flex gap-3 py-3.5 cursor-pointer" onClick={handleCardClick}>
        <Link
          href={`/user/${post.author_id}`}
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
              className="text-[14px] font-semibold truncate hover:underline"
            >
              {post.author.full_name}
            </Link>
            <span className="text-[12px] text-text-muted shrink-0">
              {timeAgo(post.created_at)}
            </span>
          </div>

          {editing ? (
            <div className="mt-1" data-no-navigate>
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full bg-bg-input border border-border rounded-xl px-3 py-2 text-[14px] leading-relaxed outline-none focus:border-text-muted transition-colors resize-none min-h-[60px]"
                autoFocus
                rows={3}
              />
              <div className="flex items-center gap-2 mt-1.5">
                <button
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim() || editContent.length > 5000 || saving}
                  className="flex items-center gap-1 text-[12px] font-semibold text-green-600 press disabled:opacity-30"
                >
                  <Check size={14} strokeWidth={2} />
                  {saving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="flex items-center gap-1 text-[12px] text-text-muted press"
                >
                  <X size={14} strokeWidth={1.5} />
                  Cancel
                </button>
                {editContent.length > 4500 && (
                  <span className={`text-[11px] ml-auto ${editContent.length > 5000 ? "text-red-500 font-semibold" : "text-text-muted"}`}>
                    {editContent.length}/5000
                  </span>
                )}
              </div>
            </div>
          ) : (
            <p className="text-[14px] leading-relaxed mt-0.5 whitespace-pre-wrap select-text" data-no-navigate>
              {displayContent}
            </p>
          )}

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
            <span className="flex items-center gap-1 text-[13px] text-text-muted">
              <Eye size={15} strokeWidth={1.5} />
              {post.impression_count > 0 && post.impression_count}
            </span>
            {userId && userId !== post.author_id && (
              <span className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setShowReport(true)}
                  className="flex items-center gap-1 text-[13px] text-text-muted hover:text-orange-500 press"
                >
                  <Flag size={14} strokeWidth={1.5} />
                </button>
                <Link
                  href={`/messages/${post.author_id}`}
                  className="flex items-center gap-1 text-[13px] text-text-muted press"
                >
                  <Send size={14} strokeWidth={1.5} />
                </Link>
              </span>
            )}
            {userId && userId === post.author_id && !editing && (
              confirmingDelete ? (
                <span className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleDelete}
                    className="text-[12px] text-red-500 font-semibold press"
                  >
                    Delete
                  </button>
                  <button
                    onClick={cancelDelete}
                    className="text-[12px] text-text-muted press"
                  >
                    Cancel
                  </button>
                </span>
              ) : (
                <span className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1 text-[13px] text-text-muted hover:text-text press"
                  >
                    <Pencil size={14} strokeWidth={1.5} />
                  </button>
                  <button
                    onClick={handleDelete}
                    className="flex items-center gap-1 text-[13px] text-text-muted hover:text-red-500 press"
                  >
                    <Trash2 size={14} strokeWidth={1.5} />
                  </button>
                </span>
              )
            )}
          </div>

          {post.recent_comments?.length > 0 && (
            <div className="mt-2.5 pl-1 border-l-2 border-border ml-1">
              {post.recent_comments.map((comment) => (
                <div key={comment.id} className="flex gap-2 py-1.5 pl-2.5">
                  <Link
                    href={`/user/${comment.author_id}`}
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
    {showReport && (
      <ReportModal
        type="post"
        targetId={post.id}
        onClose={() => setShowReport(false)}
      />
    )}
    </>
  );
}
