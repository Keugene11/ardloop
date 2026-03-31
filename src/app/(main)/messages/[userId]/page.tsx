import { createClient } from "@/lib/supabase/server";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { ChatView } from "@/components/chat-view";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  const { userId: otherUserId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Parallelize queries
  const [otherUserResult, messagesResult] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", otherUserId).single(),
    supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
      )
      .order("created_at", { ascending: true }),
  ]);

  const otherUser = otherUserResult.data;
  if (!otherUser) notFound();

  // Mark unread messages as read (non-blocking)
  supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", user.id)
    .eq("read", false)
    .then();

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-border/60">
        <Link href="/messages" className="press p-1 -ml-1 hover:bg-bg-input rounded-full transition-colors">
          <ArrowLeft size={20} strokeWidth={1.5} />
        </Link>
        <Link href={`/user/${otherUserId}`} className="flex items-center gap-2.5 press">
          {otherUser.avatar_url ? (
            <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-border">
              <Image
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center text-[13px] font-semibold text-text-muted">
              {otherUser.full_name?.[0] || "?"}
            </div>
          )}
          <h1 className="text-[16px] font-semibold">
            {otherUser.full_name}
          </h1>
        </Link>
      </div>

      <ChatView
        messages={messagesResult.data || []}
        currentUserId={user.id}
        otherUserId={otherUserId}
      />
    </div>
  );
}
