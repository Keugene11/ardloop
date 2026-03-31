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

  const rows = post_ids.slice(0, 50).map((post_id: string) => ({
    post_id,
    viewer_id: user?.id || null,
  }));

  await supabase.from("post_impressions").insert(rows);

  return NextResponse.json({ ok: true });
}
