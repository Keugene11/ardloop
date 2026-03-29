"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";

export default function NewPostPage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const removeImage = () => {
    setImageFile(null);
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    let imageUrl: string | null = null;

    if (imageFile) {
      const formData = new FormData();
      formData.append("file", imageFile);
      const res = await fetch("/api/posts/image", { method: "POST", body: formData });
      if (res.ok) {
        const data = await res.json();
        imageUrl = data.image_url;
      }
    }

    const { error } = await supabase.from("posts").insert({
      author_id: user.id,
      content: content.trim(),
      image_url: imageUrl,
    });

    if (!error) {
      router.push("/");
      router.refresh();
    }
    setSubmitting(false);
  };

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/"
          className="text-[13px] text-text-muted press flex items-center gap-1"
        >
          <ArrowLeft size={16} strokeWidth={1.5} />
          Cancel
        </Link>
        <button
          onClick={handleSubmit}
          disabled={!content.trim() || submitting}
          className="bg-[#1a1a1a] text-white px-5 py-2 rounded-full font-semibold text-[13px] press disabled:opacity-30"
        >
          {submitting ? "Posting..." : "Post"}
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's happening in Ardsley?"
          className="w-full bg-transparent text-[16px] placeholder:text-text-muted/40 outline-none resize-none min-h-[160px]"
          autoFocus
        />

        {imagePreview && (
          <div className="relative mt-2 mb-3">
            <div className="rounded-xl overflow-hidden">
              <Image
                src={imagePreview}
                alt="Selected image"
                width={400}
                height={300}
                className="w-full object-cover max-h-[300px]"
              />
            </div>
            <button
              type="button"
              onClick={removeImage}
              className="absolute top-2 right-2 w-7 h-7 bg-black/60 rounded-full flex items-center justify-center press"
            >
              <X size={16} strokeWidth={2} className="text-white" />
            </button>
          </div>
        )}

        <div className="border-t border-border pt-3 mt-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleImageSelect}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 text-[13px] text-text-muted press"
          >
            <ImagePlus size={18} strokeWidth={1.5} />
            {imageFile ? "Change image" : "Add image"}
          </button>
        </div>
      </form>
    </div>
  );
}
