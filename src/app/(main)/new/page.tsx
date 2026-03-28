"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { categories } from "@/lib/categories";
import type { PostCategory } from "@/types";

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<PostCategory>("general");
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

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      category,
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
            Category
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(cat.value)}
                className={`text-[12px] font-semibold px-3.5 py-1.5 rounded-full press transition-colors ${
                  category === cat.value
                    ? "bg-[#1a1a1a] text-white"
                    : "bg-bg-card border border-border text-text-muted"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
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
