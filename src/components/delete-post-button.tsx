"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function DeletePostButton({ postId }: { postId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = async () => {
    const supabase = createClient();
    await supabase.from("comments").delete().eq("post_id", postId);
    await supabase.from("likes").delete().eq("post_id", postId);
    await supabase.from("posts").delete().eq("id", postId);
    router.push("/");
    router.refresh();
  };

  if (confirming) {
    return (
      <div className="flex items-center gap-3 mb-4">
        <span className="text-[13px] text-text-muted">Delete this post?</span>
        <button
          onClick={handleDelete}
          className="text-[13px] text-red-500 font-semibold press"
        >
          Delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-[13px] text-text-muted press"
        >
          Cancel
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="flex items-center gap-1.5 text-[13px] text-text-muted hover:text-red-500 press mb-4"
    >
      <Trash2 size={14} strokeWidth={1.5} />
      Delete post
    </button>
  );
}
