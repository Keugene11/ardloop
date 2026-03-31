import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 1 || q.length > 100) {
    return NextResponse.json([]);
  }

  const supabase = await createClient();

  const { data } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .ilike("full_name", `%${q}%`)
    .limit(6);

  return NextResponse.json(data || []);
}
