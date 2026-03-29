import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

const DEMO_EMAIL = "demo@ardsleypost.com";
const DEMO_PASSWORD = "AppReview2026!";

export async function POST() {
  const supabase = await createClient();

  // Try to sign in first
  const { data, error } = await supabase.auth.signInWithPassword({
    email: DEMO_EMAIL,
    password: DEMO_PASSWORD,
  });

  if (error) {
    // If sign in fails, try to create the account
    const { data: signUpData, error: signUpError } =
      await supabase.auth.signUp({
        email: DEMO_EMAIL,
        password: DEMO_PASSWORD,
        options: {
          data: { full_name: "Demo User" },
        },
      });

    if (signUpError) {
      return NextResponse.json({ error: signUpError.message }, { status: 400 });
    }

    // Update profile
    if (signUpData.user) {
      await supabase.from("profiles").upsert({
        id: signUpData.user.id,
        email: DEMO_EMAIL,
        full_name: "Demo User",
        bio: "This is a demo account for App Store review.",
      });
    }

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ success: true });
}
