import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const DEMO_EMAIL = process.env.DEMO_EMAIL || "demo@ardsleypost.com";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD!;

export async function POST() {
  if (!DEMO_PASSWORD) {
    return NextResponse.json({ error: "Demo login not configured" }, { status: 404 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

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

    // Sign in again to get session
    const { data: signInData } = await supabase.auth.signInWithPassword({
      email: DEMO_EMAIL,
      password: DEMO_PASSWORD,
    });

    return NextResponse.json({
      access_token: signInData.session?.access_token,
      refresh_token: signInData.session?.refresh_token,
    });
  }

  return NextResponse.json({
    access_token: data.session?.access_token,
    refresh_token: data.session?.refresh_token,
  });
}
