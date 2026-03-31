import { createClient } from "@/lib/supabase/server";
import { Feed } from "@/components/feed";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: posts } = await supabase
    .from("posts")
    .select(
      `
      *,
      author:profiles(*),
      like_count:likes(count),
      comment_count:comments(count)
    `
    )
    .order("created_at", { ascending: false })
    .limit(50);

  const postIds = (posts || []).map((p) => p.id);

  // Fetch recent comments for all posts in one query
  const { data: recentComments } = postIds.length
    ? await supabase
        .from("comments")
        .select("*, author:profiles(*)")
        .in("post_id", postIds)
        .order("created_at", { ascending: false })
        .limit(200)
    : { data: [] };

  // Group comments by post_id, keep latest 2 per post
  const commentsByPost = new Map<string, typeof recentComments>();
  (recentComments || []).forEach((c) => {
    const existing = commentsByPost.get(c.post_id) || [];
    if (existing.length < 2) {
      existing.push(c);
      commentsByPost.set(c.post_id, existing);
    }
  });

  let likedPostIds: Set<string> = new Set();
  if (user) {
    const { data: likes } = await supabase
      .from("likes")
      .select("post_id")
      .eq("user_id", user.id);
    likedPostIds = new Set(likes?.map((l) => l.post_id) || []);
  }

  const formattedPosts = (posts || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
    user_has_liked: likedPostIds.has(post.id),
    recent_comments: (commentsByPost.get(post.id) || []).reverse(),
  }));

  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true });

  let userProfile: { avatar_url: string | null; full_name: string } | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("avatar_url, full_name")
      .eq("id", user.id)
      .single();
    userProfile = profile;
  }

  return (
    <>
      <header className="mb-5">
        <div className="flex items-baseline justify-between">
          <h1 className="text-[26px] font-extrabold tracking-tight">Ardsleypost</h1>
          {userCount !== null && userCount > 0 && (
            <span className="text-[12px] text-text-muted font-medium">
              {userCount} {userCount === 1 ? "member" : "members"}
            </span>
          )}
        </div>
        <p className="text-[13px] text-text-muted mt-1 leading-snug">
          The social network built for Ardsley students, parents, and alumni.
        </p>
      </header>
      <Feed
        initialPosts={formattedPosts}
        userId={user?.id || null}
        userAvatarUrl={userProfile?.avatar_url || null}
        userFullName={userProfile?.full_name || null}
      />
    </>
  );
}
