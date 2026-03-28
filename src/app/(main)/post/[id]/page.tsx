import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, DollarSign } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { CommentSection } from "@/components/comment-section";
import { BuyButton } from "@/components/buy-button";

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
        className="inline-flex items-center gap-1.5 text-[13px] text-text-muted mb-4 press"
      >
        <ArrowLeft size={16} strokeWidth={1.5} />
        Back
      </Link>

      <article className="bg-bg-card border border-border rounded-2xl px-5 py-5 mb-4">
        <div className="flex items-center gap-3 mb-4">
          {post.author.avatar_url ? (
            <Image
              src={post.author.avatar_url}
              alt={post.author.full_name}
              width={40}
              height={40}
              className="rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-bg-input flex items-center justify-center text-[15px] font-semibold text-text-muted">
              {post.author.full_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1">
            <p className="text-[15px] font-semibold">{post.author.full_name}</p>
            <p className="text-[12px] text-text-muted">
              {timeAgo(post.created_at)}
            </p>
          </div>
        </div>

        <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>

        {post.image_url && (
          <div className="mt-4 rounded-xl overflow-hidden">
            <Image
              src={post.image_url}
              alt="Post image"
              width={400}
              height={300}
              className="w-full object-cover"
            />
          </div>
        )}

        {post.price && (
          <div className="mt-4 flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-4 py-3">
            <div className="flex items-center gap-1.5 text-green-700">
              <DollarSign size={18} strokeWidth={2} />
              <span className="text-[20px] font-bold">
                {(post.price / 100).toFixed(2)}
              </span>
            </div>
            {user && user.id !== post.author_id && (
              <BuyButton
                postId={id}
                sellerOnboarded={post.author.stripe_onboarded}
              />
            )}
          </div>
        )}
      </article>

      <CommentSection
        postId={id}
        userId={user?.id || null}
        initialComments={comments || []}
        likeCount={likeCount || 0}
        userHasLiked={userHasLiked}
      />
    </div>
  );
}
