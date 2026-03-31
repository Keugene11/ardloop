import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ProfileActions } from "@/components/profile-actions";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";
import { Heart, MessageCircle } from "lucide-react";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Parallelize queries
  const [profileResult, postsResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("posts")
      .select(`*, like_count:likes(count), comment_count:comments(count)`)
      .eq("author_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const profile = profileResult.data;
  const formattedPosts = (postsResult.data || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
  }));

  return (
    <div className="animate-fade-in">
      <ProfileActions
        userId={user.id}
        fullName={profile?.full_name || ""}
        avatarUrl={profile?.avatar_url || null}
        email={profile?.email || ""}
        bio={profile?.bio || ""}
      />

      <div className="mt-6 border-t border-border/60 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[13px] font-semibold uppercase tracking-wider text-text-muted/60">
            Your Posts
          </h3>
          <span className="text-[12px] text-text-muted/40">{formattedPosts.length}</span>
        </div>
        <div className="space-y-2.5">
          {formattedPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[14px] text-text-muted/50">
                Nothing yet.
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
