import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Send, Heart, MessageCircle } from "lucide-react";
import { timeAgo } from "@/lib/utils";
import { ServicesDisplay } from "@/components/services-display";
import { UserActions } from "@/components/user-actions";
import type { Services, UserRole } from "@/types";
import { ROLE_LABELS } from "@/types";

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

  // If viewing your own profile, could redirect, but let's just show it
  const isOwnProfile = user?.id === id;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", id)
    .single();

  if (!profile) notFound();

  let isBlocked = false;
  if (user && !isOwnProfile) {
    const { data: block } = await supabase
      .from("blocks")
      .select("id")
      .eq("blocker_id", user.id)
      .eq("blocked_id", id)
      .maybeSingle();
    isBlocked = !!block;
  }

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      like_count:likes(count),
      comment_count:comments(count)
    `
    )
    .eq("author_id", id)
    .order("created_at", { ascending: false });

  const formattedPosts = (posts || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
  }));

  const memberSince = new Date(profile.created_at).toLocaleDateString(
    "en-US",
    { month: "long", year: "numeric" }
  );

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/" className="press">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <h1 className="text-[18px] font-bold">Profile</h1>
      </div>

      <div className="flex flex-col items-center text-center mb-6">
        {profile.avatar_url ? (
          <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-full bg-bg-input flex items-center justify-center text-[28px] font-bold text-text-muted mb-3">
            {profile.full_name?.[0] || "?"}
          </div>
        )}

        <h2 className="text-[22px] font-bold tracking-tight">
          {profile.full_name || "Anonymous"}
        </h2>

        {profile.role && (
          <span className="inline-block mt-1 px-3 py-0.5 rounded-full bg-bg-input text-[12px] font-semibold text-text-muted">
            {ROLE_LABELS[profile.role as UserRole]}
          </span>
        )}

        <p className="text-[13px] text-text-muted mt-0.5">
          Member since {memberSince}
        </p>

        {profile.bio && (
          <p className="text-[14px] text-text-muted mt-2 max-w-[280px] leading-relaxed">
            {profile.bio}
          </p>
        )}

        {user && !isOwnProfile && (
          <>
            <Link
              href={`/messages/${id}`}
              className="mt-4 flex items-center gap-2 bg-[#1a1a1a] text-white px-5 py-2.5 rounded-full text-[14px] font-semibold press"
            >
              <Send size={14} strokeWidth={1.5} />
              Message
            </Link>
            <UserActions userId={id} isBlocked={isBlocked} />
          </>
        )}

        {isOwnProfile && (
          <Link
            href="/profile"
            className="mt-4 text-[13px] text-text-muted underline underline-offset-2"
          >
            Edit profile
          </Link>
        )}

        {profile.services && (
          <ServicesDisplay services={profile.services as Services} />
        )}
      </div>

      <div>
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
          Posts · {formattedPosts.length}
        </h3>
        <div className="space-y-3">
          {formattedPosts.length === 0 ? (
            <p className="text-[14px] text-text-muted text-center py-10">
              No posts yet.
            </p>
          ) : (
            formattedPosts.map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block bg-bg-card border border-border rounded-2xl px-4 py-3.5 press hover:bg-bg-card-hover transition-colors"
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
                  <div className="mt-2.5 rounded-xl overflow-hidden">
                    <Image
                      src={post.image_url}
                      alt="Post image"
                      width={400}
                      height={200}
                      className="w-full h-32 object-cover"
                    />
                  </div>
                )}

                <div className="flex items-center gap-4 mt-2.5 text-text-muted">
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
