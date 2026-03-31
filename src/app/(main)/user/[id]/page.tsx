import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Heart, MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isOwnProfile = user?.id === id;

  // Parallelize queries
  const [profileResult, postsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", id).single(),
    supabase
      .from("posts")
      .select(`*, like_count:likes(count), comment_count:comments(count)`)
      .eq("author_id", id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  if (!profile) notFound();

  const formattedPosts = (postsResult.data || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
  }));

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="press p-1 -ml-1 hover:bg-bg-input rounded-full transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-[16px] font-semibold">Profile</h1>
      </div>

      <div className="flex flex-col items-center text-center mb-8">
        {profile.avatar_url ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3 ring-2 ring-border">
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-bg-input flex items-center justify-center text-[28px] font-bold text-text-muted mb-3 ring-2 ring-border">
            {profile.full_name?.[0] || "?"}
          </div>
        )}

        <h2 className="text-[22px] font-bold tracking-tight">
          {profile.full_name || "Anonymous"}
        </h2>

        <p className="text-[12px] text-text-muted/60 mt-0.5">
          Member since {memberSince}
        </p>

        {profile.bio && (
          <p className="text-[14px] text-text-muted/80 mt-2.5 max-w-[280px] leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="flex gap-3 mt-4">
          {user && !isOwnProfile && (
            <Link
              href={`/messages/${id}`}
              className="flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold press"
            >
              <Send size={14} strokeWidth={1.5} />
              Message
            </Link>
          )}

          {isOwnProfile && (
            <Link
              href="/profile"
              className="text-[13px] text-text-muted/60 hover:text-text transition-colors"
            >
              Edit profile
            </Link>
          )}
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-muted/60">
            Posts
          </h3>
          <span className="text-[12px] text-text-muted/40">{formattedPosts.length}</span>
        </div>
        <div className="space-y-2.5">
          {formattedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-text-muted/50">
                No posts yet.
              </p>
            </div>
          ) : (
            formattedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block bg-bg-card border border-border/60 rounded-2xl px-4 py-3.5 press hover:bg-bg-card-hover transition-colors"
              >
                <p className="text-[14px] leading-relaxed line-clamp-3 whitespace-pre-wrap">
                  {post.content}
                </p>

                {post.price && (
                  <span className="inline-block mt-2 text-[13px] font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                    ${(post.price / 100).toFixed(2)}
                  </span>
                )}

                {post.image_url && (
                  <div className="mt-2.5 rounded-xl overflow-hidden border border-border/30">
                    <Image
                      src={post.image_url}
                      alt="Post image"
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover"
                      sizes="(max-width: 448px) 100vw, 400px"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2.5 text-text-muted/60">
                  <span className="text-[12px]">
                    {timeAgo(post.created_at)}
                  </span>
                  {post.like_count > 0 && (
                    <span className="flex items-center gap-1 text-[12px]">
                      <Heart size={12} strokeWidth={1.5} />
                      {post.like_count}
                    </span>
                  )}
                  {post.comment_count > 0 && (
                    <span className="flex items-center gap-1 text-[12px]">
                      <MessageCircle size={12} strokeWidth={1.5} />
                      {post.comment_count}
                    </span>
                  )}
                </div>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
