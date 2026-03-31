import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ProfileActions } from "@/components/profile-actions";
import { ServicesEditor } from "@/components/services-editor";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";
import type { Services } from "@/types";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      like_count:likes(count),
      comment_count:comments(count)
    `
    )
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const formattedPosts = (posts || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
  }));

  return (
    <div className="animate-slide-up">
      <ProfileActions
        userId={user.id}
        fullName={profile?.full_name || ""}
        avatarUrl={profile?.avatar_url || null}
        email={profile?.email || ""}
        bio={profile?.bio || ""}
        role={profile?.role || null}
      />

      <ServicesEditor
        userId={user.id}
        services={(profile?.services as Services) || {}}
      />

      <div className="mt-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
          Posts
        </h3>
        <div className="space-y-3">
          {formattedPosts.length === 0 ? (
            <p className="text-[14px] text-text-muted text-center py-10">
              Nothing yet.
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
