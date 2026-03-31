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

  const { data: otherUser } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", otherUserId)
    .single();

  if (!otherUser) notFound();

  // Get messages between the two users
  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .or(
      `and(sender_id.eq.${user.id},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${user.id})`
    )
    .order("created_at", { ascending: true });

  // Mark unread messages as read
  await supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", otherUserId)
    .eq("receiver_id", user.id)
    .eq("read", false);

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/messages" className="press">
          <ArrowLeft size={20} strokeWidth={1.5} className="text-text-muted" />
        </Link>
        <Link href={`/user/${otherUserId}`} className="flex items-center gap-3 press">
          {otherUser.avatar_url ? (
            <div className="w-9 h-9 rounded-full overflow-hidden shrink-0">
              <Image
                src={otherUser.avatar_url}
                alt={otherUser.full_name}
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-9 h-9 rounded-full bg-bg-input flex items-center justify-center text-[14px] font-semibold text-text-muted">
              {otherUser.full_name?.[0] || "?"}
            </div>
          )}
          <h1 className="text-[18px] font-bold tracking-tight">
            {otherUser.full_name}
          </h1>
        </Link>
      </div>

      <ChatView
        messages={messages || []}
        currentUserId={user.id}
        otherUserId={otherUserId}
      />
    </div>
  );
}
