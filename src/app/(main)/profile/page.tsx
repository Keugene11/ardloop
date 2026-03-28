import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Image from "next/image";
import { ProfileActions } from "@/components/profile-actions";
import { timeAgo } from "@/lib/utils";
import Link from "next/link";

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
    .select("*")
    .eq("author_id", user.id)
    .order("created_at", { ascending: false });

  const { count: postCount } = await supabase
    .from("posts")
    .select("*", { count: "exact", head: true })
    .eq("author_id", user.id);

  return (
    <div className="animate-slide-up">
      <h1 className="text-[22px] font-bold tracking-tight mb-6">Profile</h1>

      <div className="bg-bg-card border border-border rounded-2xl px-5 py-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={profile.full_name}
              width={56}
              height={56}
              className="rounded-full"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-bg-input flex items-center justify-center text-[20px] font-semibold text-text-muted">
              {profile?.full_name?.[0] || "?"}
            </div>
          )}
          <div>
            <h2 className="text-[18px] font-bold">{profile?.full_name}</h2>
            <p className="text-[13px] text-text-muted">{profile?.email}</p>
          </div>
        </div>

        {profile?.bio && (
          <p className="text-[14px] text-text-muted mb-4 whitespace-pre-wrap">{profile.bio}</p>
        )}

        <div className="flex gap-6 text-center">
          <div>
            <p className="text-[22px] font-bold">{postCount || 0}</p>
            <p className="text-[11px] text-text-muted uppercase tracking-wide">
              Posts
            </p>
          </div>
        </div>
      </div>

      <ProfileActions
        userId={user.id}
        bio={profile?.bio || ""}
        stripeOnboarded={profile?.stripe_onboarded || false}
      />

      <div className="mt-6">
        <h3 className="text-[14px] font-semibold uppercase tracking-wide text-text-muted mb-3">
          Your Posts
        </h3>
        <div className="space-y-2">
          {(posts || []).length === 0 ? (
            <p className="text-[14px] text-text-muted text-center py-8">
              No posts yet.
            </p>
          ) : (
            (posts || []).map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block bg-bg-card border border-border rounded-xl px-4 py-3 hover:bg-bg-card-hover transition-colors press"
              >
                <div className="flex items-center justify-end mb-1">
                  <span className="text-[11px] text-text-muted">
                    {timeAgo(post.created_at)}
                  </span>
                </div>
                <p className="text-[14px] line-clamp-2">{post.content}</p>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
