import Link from "next/link";
import { Plus } from "lucide-react";
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
          Talk about events in Ardsley, ask for services such as tutors, babysitters, dogwalkers, and more from Ardsley students and alumni.
        </p>
      </header>
      <Feed initialPosts={formattedPosts} userId={user?.id || null} />
      <Link
        href="/new"
        className="fixed bottom-20 right-5 w-12 h-12 bg-[#1a1a1a] text-white rounded-full flex items-center justify-center shadow-lg press z-40 hover:scale-105 transition-transform"
      >
        <Plus size={22} strokeWidth={2.5} />
      </Link>
    </>
  );
}
