"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { LogOut, Trash2 } from "lucide-react";

export function AccountActions() {
  const router = useRouter();
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch("/api/account/delete", { method: "POST" });
      if (res.ok) {
        const supabase = createClient();
        await supabase.auth.signOut();
        window.location.href = "/login";
      } else {
        showToast("Failed to delete account. Please try again.");
        setDeleting(false);
        setConfirmDelete(false);
      }
    } catch {
      showToast("Network error. Please try again.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="mt-10 pt-6 border-t border-border">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/terms" className="text-[12px] text-text-muted/60 press">
            Terms
          </Link>
          <Link href="/privacy" className="text-[12px] text-text-muted/60 press">
            Privacy
          </Link>
        </div>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-1.5 text-[13px] text-red-400 press"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Sign out
        </button>
      </div>

      <div className="mt-6 pt-4 border-t border-border">
        {confirmDelete ? (
          <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3.5">
            <p className="text-[14px] font-semibold text-red-700 mb-1">
              Delete your account?
            </p>
            <p className="text-[12px] text-red-600/70 mb-3">
              This will permanently delete all your data, posts, messages, and cannot be undone.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleting}
                className="bg-red-600 text-white px-4 py-2 rounded-xl font-semibold text-[13px] press disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Yes, delete my account"}
              </button>
              <button
                onClick={() => setConfirmDelete(false)}
                className="text-[13px] text-text-muted px-3 py-2 press"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-1.5 text-[13px] text-text-muted/50 press"
          >
            <Trash2 size={13} strokeWidth={1.5} />
            Delete account
          </button>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#1a1a1a] text-white px-5 py-3 rounded-2xl text-[14px] font-medium shadow-lg z-50 animate-slide-up">
          {toast}
        </div>
      )}
    </div>
  );
}
