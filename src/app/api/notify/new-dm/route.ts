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

  const { sender_name, receiver_name, content } = await req.json();
  const preview = content?.slice(0, 200) || "(no content)";

  try {
    await sendAdminEmail(`DM: ${sender_name} → ${receiver_name}`, `
      <div style="font-family: sans-serif; max-width: 480px;">
        <h2 style="margin: 0 0 8px;">New direct message</h2>
        <p style="margin: 0 0 4px;"><strong>${sender_name}</strong> sent a message to <strong>${receiver_name}</strong>:</p>
        <blockquote style="margin: 12px 0; padding: 12px 16px; background: #f5f5f5; border-radius: 8px; border-left: 3px solid #333;">
          ${preview}
        </blockquote>
      </div>
    `);
  } catch {
    // Don't fail the request if email fails
  }

  return NextResponse.json({ ok: true });
}
