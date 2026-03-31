import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { createClient } from "@/lib/supabase/server";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { calculateCommission } from "@/lib/commission";

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let postId: string;
  try {
    ({ postId } = await request.json());
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  if (!postId || typeof postId !== "string") {
    return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
  }

  const origin = request.headers.get("origin") || "";

  // Get the post and seller info
  const { data: post } = await supabase
    .from("posts")
    .select("*, author:profiles(*)")
    .eq("id", postId)
    .single();

  if (!post || !post.price) {
    return NextResponse.json({ error: "Post not found or has no price" }, { status: 400 });
  }

  if (post.author_id === user.id) {
    return NextResponse.json({ error: "Cannot purchase your own listing" }, { status: 400 });
  }

  if (!post.author.stripe_account_id || !post.author.stripe_onboarded) {
    return NextResponse.json(
      { error: "Seller hasn't set up payments yet" },
      { status: 400 }
    );
  }

  const stripe = getStripe();
  const amountCents = post.price;
  const commission = calculateCommission(amountCents);

  // Create a Checkout Session with destination charge
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: post.content.substring(0, 100),
            description: `Service from ${post.author.full_name}`,
          },
          unit_amount: amountCents,
        },
        quantity: 1,
      },
    ],
    payment_intent_data: {
      application_fee_amount: commission,
      transfer_data: {
        destination: post.author.stripe_account_id,
      },
    },
    success_url: `${origin}/post/${postId}?purchased=true`,
    cancel_url: `${origin}/post/${postId}`,
    metadata: {
      post_id: postId,
      buyer_id: user.id,
      seller_id: post.author_id,
    },
  });

  // Record the purchase as pending
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  await supabaseAdmin.from("purchases").insert({
    post_id: postId,
    buyer_id: user.id,
    seller_id: post.author_id,
    amount: amountCents,
    commission,
    stripe_session_id: session.id,
    status: "pending",
  });

  return NextResponse.json({ url: session.url });
}
