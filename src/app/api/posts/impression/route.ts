import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { post_ids } = await req.json();
  if (!Array.isArray(post_ids) || post_ids.length === 0) {
    return NextResponse.json({ error: "post_ids required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const viewerId = user?.id || null;

  // Get the authors of these posts so we can skip self-views
  const { data: posts } = await supabase
    .from("posts")
    .select("id, author_id")
    .in("id", post_ids.slice(0, 50));

  const filteredIds = (posts || [])
    .filter((p) => p.author_id !== viewerId)
    .map((p) => p.id);

  if (filteredIds.length === 0) {
    return NextResponse.json({ ok: true });
  }

  const rows = filteredIds.map((post_id: string) => ({
    post_id,
    viewer_id: viewerId,
  }));

  await supabase.from("post_impressions").insert(rows);

  return NextResponse.json({ ok: true });
}
