import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Delete user data in order (respecting foreign keys)
  await supabaseAdmin.from("reports").delete().eq("reporter_id", user.id);
  await supabaseAdmin.from("blocks").delete().eq("blocker_id", user.id);
  await supabaseAdmin.from("blocks").delete().eq("blocked_id", user.id);
  await supabaseAdmin.from("messages").delete().eq("sender_id", user.id);
  await supabaseAdmin.from("messages").delete().eq("receiver_id", user.id);
  await supabaseAdmin.from("likes").delete().eq("user_id", user.id);
  await supabaseAdmin.from("comments").delete().eq("author_id", user.id);
  await supabaseAdmin.from("post_impressions").delete().eq("viewer_id", user.id);
  await supabaseAdmin.from("profile_views").delete().eq("viewer_id", user.id);
  await supabaseAdmin.from("profile_views").delete().eq("profile_id", user.id);

  // Delete comments and likes on user's posts before deleting posts
  const { data: userPosts } = await supabaseAdmin
    .from("posts")
    .select("id")
    .eq("author_id", user.id);

  if (userPosts?.length) {
    const postIds = userPosts.map((p) => p.id);
    await supabaseAdmin.from("comments").delete().in("post_id", postIds);
    await supabaseAdmin.from("likes").delete().in("post_id", postIds);
    await supabaseAdmin.from("post_impressions").delete().in("post_id", postIds);
    await supabaseAdmin.from("purchases").delete().in("post_id", postIds);
  }

  await supabaseAdmin.from("posts").delete().eq("author_id", user.id);
  await supabaseAdmin.from("purchases").delete().eq("buyer_id", user.id);
  await supabaseAdmin.from("purchases").delete().eq("seller_id", user.id);
  await supabaseAdmin.from("profiles").delete().eq("id", user.id);

  // Delete the auth user
  await supabaseAdmin.auth.admin.deleteUser(user.id);

  return NextResponse.json({ success: true });
}
