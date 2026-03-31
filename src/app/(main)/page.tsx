import { createClient } from "@/lib/supabase/server";
import { Feed } from "@/components/feed";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Parallelize independent queries
  const [postsResult, userCountResult, userProfileResult] = await Promise.all([
    supabase
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
      .limit(50),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    user
      ? supabase
          .from("profiles")
          .select("avatar_url, full_name")
          .eq("id", user.id)
          .single()
      : Promise.resolve({ data: null }),
  ]);

  const posts = postsResult.data;
  const userCount = userCountResult.count;
  const userProfile = userProfileResult.data;
  const postIds = (posts || []).map((p) => p.id);

  // Parallelize comments + likes fetch
  const [commentsResult, likesResult] = await Promise.all([
    postIds.length
      ? supabase
          .from("comments")
          .select("*, author:profiles(*)")
          .in("post_id", postIds)
          .order("created_at", { ascending: false })
          .limit(200)
      : Promise.resolve({ data: [] }),
    user
      ? supabase.from("likes").select("post_id").eq("user_id", user.id)
      : Promise.resolve({ data: [] }),
  ]);

  const commentsByPost = new Map<string, typeof commentsResult.data>();
  (commentsResult.data || []).forEach((c) => {
    const existing = commentsByPost.get(c.post_id) || [];
    if (existing.length < 2) {
      existing.push(c);
      commentsByPost.set(c.post_id, existing);
    }
  });

  const likedPostIds = new Set(
    (likesResult.data || []).map((l) => l.post_id)
  );

  const formattedPosts = (posts || []).map((post) => ({
    ...post,
    like_count: post.like_count?.[0]?.count || 0,
    comment_count: post.comment_count?.[0]?.count || 0,
    user_has_liked: likedPostIds.has(post.id),
    recent_comments: (commentsByPost.get(post.id) || []).reverse(),
  }));

  return (
    <>
      <header className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-[28px] font-extrabold tracking-tight">Ardsleypost</h1>
          {userCount !== null && userCount > 0 && (
            <span className="text-[11px] text-text-muted bg-bg-input px-2.5 py-1 rounded-full font-medium">
              {userCount} {userCount === 1 ? "member" : "members"}
            </span>
          )}
        </div>
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
