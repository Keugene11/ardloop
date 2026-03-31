import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CommentSection } from "@/components/comment-section";
import { DeletePostButton } from "@/components/delete-post-button";

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

  // Parallelize queries
  const [postResult, commentsResult, likeCountResult] = await Promise.all([
    supabase.from("posts").select("*, author:profiles(*)").eq("id", id).single(),
    supabase.from("comments").select("*, author:profiles(*)").eq("post_id", id).order("created_at", { ascending: true }),
    supabase.from("likes").select("*", { count: "exact", head: true }).eq("post_id", id),
  ]);

  const post = postResult.data;
  if (!post) notFound();

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
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-5">
        <Link
          href="/"
          className="press p-1 -ml-1 hover:bg-bg-input rounded-full transition-colors"
        >
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-[16px] font-semibold">Post</h1>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <Link href={`/user/${post.author_id}`} className="shrink-0">
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
            <div className="w-10 h-10 rounded-full bg-bg-input flex items-center justify-center text-[15px] font-semibold text-text-muted ring-1 ring-border">
              {post.author.full_name?.[0] || "?"}
            </div>
          )}
        </Link>
        <div className="flex-1 min-w-0">
          <Link href={`/user/${post.author_id}`} className="text-[15px] font-semibold hover:underline">
            {post.author.full_name}
          </Link>
          <p className="text-[12px] text-text-muted/60">
            {timeAgo(post.created_at)}
          </p>
        </div>
        {user && user.id === post.author_id && (
          <DeletePostButton postId={id} />
        )}
      </div>

      <p className="text-[16px] leading-relaxed whitespace-pre-wrap mb-4">
        {post.content}
      </p>

      {post.image_url && (
        <div className="mb-4 rounded-xl overflow-hidden border border-border/50">
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

      <div className="border-t border-border/60 pt-4">
        <CommentSection
          postId={id}
          userId={user?.id || null}
          initialComments={commentsResult.data || []}
          likeCount={likeCountResult.count || 0}
          userHasLiked={userHasLiked}
        />
      </div>
    </div>
  );
}
