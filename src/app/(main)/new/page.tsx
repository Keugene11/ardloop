"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [price, setPrice] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    const priceValue = price ? Math.round(parseFloat(price) * 100) : null;

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      price: priceValue,
    });

    if (!error) {
      router.push("/");
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="animate-slide-up">
      <h1 className="text-[22px] font-bold tracking-tight mb-6">New Post</h1>

      <form onSubmit={handleSubmit}>
        <div className="bg-bg-card border border-border rounded-2xl px-5 py-5 mb-4">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="What's on your mind? Share with Ardsley..."
            className="w-full bg-transparent text-[15px] placeholder:text-text-muted/50 outline-none resize-none min-h-[120px]"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="text-[12px] font-semibold uppercase tracking-wide text-text-muted mb-2 block">
            Price (optional)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[14px] text-text-muted">
              $
            </span>
            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0.00"
              className="w-full bg-bg-card border border-border rounded-full pl-8 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
            />
          </div>
          <p className="text-[11px] text-text-muted mt-1.5">
            Add a price if you&apos;re offering a paid service. A 10% platform fee applies.
          </p>
        </div>

        <button
          type="submit"
          disabled={!content.trim() || submitting}
          className="w-full bg-[#1a1a1a] text-white py-3.5 rounded-2xl font-semibold press text-[15px] disabled:opacity-40"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}
