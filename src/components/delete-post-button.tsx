"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;

    const supabase = createClient();
    await Promise.all([
      supabase.from("comments").delete().eq("post_id", postId),
      supabase.from("likes").delete().eq("post_id", postId),
    ]);
    await supabase.from("posts").delete().eq("id", postId);
    router.push("/");
    router.refresh();
  };

  return (
    <button
      onClick={handleDelete}
      className="flex items-center gap-1.5 text-[13px] text-text-muted/50 hover:text-red-500 press transition-colors"
    >
      <Trash2 size={14} strokeWidth={1.5} />
    </button>
  );
}
