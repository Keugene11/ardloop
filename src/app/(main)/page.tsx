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

  // Check which posts the user has liked
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
  }));

  return (
    <>
      <header className="mb-6">
        <h1 className="text-[28px] font-extrabold tracking-tight">ardloop</h1>
        <p className="text-[14px] text-text-muted">What&apos;s happening in Ardsley</p>
      </header>
      <Feed initialPosts={formattedPosts} userId={user?.id || null} />
    </>
  );
}
