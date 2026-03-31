import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { profile_id } = await req.json();
  if (!profile_id) {
    return NextResponse.json({ error: "profile_id required" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id === profile_id) {
    return NextResponse.json({ ok: true });
  }

  await supabase.from("profile_views").insert({
    profile_id,
    viewer_id: user.id,
  });

  return NextResponse.json({ ok: true });
}
