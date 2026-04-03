import { createClient } from "@/lib/supabase/server";
import { sendAdminEmail } from "@/lib/email";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { post_id, content } = await req.json();
  if (!post_id) {
    return NextResponse.json({ error: "post_id required" }, { status: 400 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const authorName = profile?.full_name || "Someone";
  const preview = content?.slice(0, 200) || "(no content)";

  try {
    await sendAdminEmail(`New post from ${authorName}`, `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="margin: 0 0 8px;">New post pending approval</h2>
        <p style="margin: 0 0 4px;"><strong>${authorName}</strong> just posted:</p>
        <blockquote style="margin: 12px 0; padding: 12px 16px; background: #f5f5f5; border-radius: 8px; border-left: 3px solid #333;">
          ${preview}
        </blockquote>
        <a href="https://ardsleypost.com" style="display: inline-block; margin-top: 12px; padding: 8px 20px; background: #1a1a1a; color: #fff; text-decoration: none; border-radius: 20px; font-size: 14px;">
          Review posts
        </a>
      </div>
    `);
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true });
}
