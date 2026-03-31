import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let full_name: string;
  try {
    ({ full_name } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!full_name || typeof full_name !== "string" || !full_name.trim()) {
    return NextResponse.json(
      { error: "Name is required" },
      { status: 400 }
    );
  }

  if (full_name.trim().length > 50) {
    return NextResponse.json(
      { error: "Name must be 50 characters or less" },
      { status: 400 }
    );
  }

  const { error } = await supabase
    .from("profiles")
    .update({ full_name: full_name.trim() })
    .eq("id", user.id);

  if (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
