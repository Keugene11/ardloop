import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ConversationList } from "@/components/conversation-list";

export default async function MessagesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  // Get all messages where the user is sender or receiver
  const { data: messages } = await supabase
    .from("messages")
    .select("*, sender:profiles!messages_sender_id_fkey(*), receiver:profiles!messages_receiver_id_fkey(*)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  // Group into conversations
  const conversationMap = new Map<
    string,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    { user: any; lastMessage: any; unreadCount: number }
  >();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (messages || []).forEach((msg: any) => {
    const otherUser =
      msg.sender_id === user.id ? msg.receiver : msg.sender;
    const otherUserId: string =
      msg.sender_id === user.id ? msg.receiver_id : msg.sender_id;

    if (!conversationMap.has(otherUserId)) {
      conversationMap.set(otherUserId, {
        user: otherUser,
        lastMessage: msg,
        unreadCount: 0,
      });
    }

    if (!msg.read && msg.receiver_id === user.id) {
      const conv = conversationMap.get(otherUserId)!;
      conv.unreadCount++;
    }
  });

  const conversations = Array.from(conversationMap.values());

  return (
    <div className="animate-slide-up">
      <h1 className="text-[22px] font-bold tracking-tight mb-6">Messages</h1>
      <ConversationList conversations={conversations} />
    </div>
  );
}
