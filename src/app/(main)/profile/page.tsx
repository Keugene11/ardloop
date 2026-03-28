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

  return (
    <div className="animate-slide-up">
      <ProfileActions
        userId={user.id}
        fullName={profile?.full_name || ""}
        avatarUrl={profile?.avatar_url || null}
        email={profile?.email || ""}
        bio={profile?.bio || ""}
        stripeOnboarded={profile?.stripe_onboarded || false}
      />

      <div className="mt-8">
        <h3 className="text-[13px] font-semibold uppercase tracking-wide text-text-muted mb-3">
          Posts
        </h3>
        <div className="divide-y divide-border">
          {(posts || []).length === 0 ? (
            <p className="text-[14px] text-text-muted text-center py-10">
              Nothing yet.
            </p>
          ) : (
            (posts || []).map((post) => (
              <Link
                key={post.id}
                href={`/post/${post.id}`}
                className="block py-3 press"
              >
                <p className="text-[14px] leading-relaxed line-clamp-2">
                  {post.content}
                </p>
                <span className="text-[11px] text-text-muted mt-1 block">
                  {timeAgo(post.created_at)}
                </span>
              </Link>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
