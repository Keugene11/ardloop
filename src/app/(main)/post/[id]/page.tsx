import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CommentSection } from "@/components/comment-section";
import { DeletePostButton } from "@/components/delete-post-button";
import { EditPostContent } from "@/components/edit-post-content";

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("id", id)
    .single();

  if (!post) notFound();

  const { data: comments } = await supabase
    .from("comments")
    .select("*, author:profiles(*)")
    .eq("post_id", id)
    .order("created_at", { ascending: true });

  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("post_id", id);
  const impressionCount = 0;

  let userHasLiked = false;
  if (user) {
    const { data: like } = await supabase
      .from("likes")
      .select("id")
      .eq("post_id", id)
      .eq("user_id", user.id)
      .single();
    userHasLiked = !!like;
  }

  return (
    <div className="animate-slide-up">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-[13px] text-text-muted mb-5 press"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back
      </Link>

      <div className="flex gap-3 mb-4">
        {post.author.avatar_url ? (
          <div className="w-10 h-10 rounded-full overflow-hidden shrink-0">
            <Image
              src={post.author.avatar_url}
              alt={post.author.full_name}
              width={40}
              height={40}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-full bg-bg-input flex items-center justify-center text-[15px] font-semibold text-text-muted shrink-0">
            {post.author.full_name?.[0] || "?"}
          </div>
        )}
        <div>
          <p className="text-[15px] font-semibold">{post.author.full_name}</p>
          <p className="text-[12px] text-text-muted">
            {timeAgo(post.created_at)}
          </p>
        </div>
      </div>

      {user && user.id === post.author_id ? (
        <EditPostContent postId={id} initialContent={post.content} />
      ) : (
        <p className="text-[16px] leading-relaxed whitespace-pre-wrap mb-4">
          {post.content}
        </p>
      )}

      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden">
          <Image
            src={post.image_url}
            alt="Post image"
            width={400}
            height={300}
            className="w-full object-cover"
          />
        </div>
      )}

      {user && user.id === post.author_id && (
        <DeletePostButton postId={id} />
      )}

      <div className="border-t border-border pt-4">
        <CommentSection
          postId={id}
          userId={user?.id || null}
          initialComments={comments || []}
          likeCount={likeCount || 0}
          userHasLiked={userHasLiked}
          impressionCount={impressionCount || 0}
        />
      </div>
    </div>
  );
}
