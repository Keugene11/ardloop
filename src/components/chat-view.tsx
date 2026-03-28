"use client";

import { useState, useEffect, useRef } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/utils";

interface ChatMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
  read: boolean;
}

export function ChatView({
  messages: initialMessages,
  currentUserId,
  otherUserId,
}: {
  messages: ChatMessage[];
  currentUserId: string;
  otherUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Subscribe to new messages in real-time
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("messages")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `sender_id=eq.${otherUserId}`,
        },
        (payload) => {
          const msg = payload.new as ChatMessage;
          if (msg.receiver_id === currentUserId) {
            setMessages((prev) => [...prev, msg]);
            // Mark as read
            supabase
              .from("messages")
              .update({ read: true })
              .eq("id", msg.id)
              .then();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, otherUserId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const supabase = createClient();

    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content: newMessage.trim(),
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data]);
      setNewMessage("");
    }
    setSending(false);
  };

  return (
    <div>
      <div className="space-y-2 mb-4 max-h-[60vh] overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-center text-text-muted text-[14px] py-8">
            Start the conversation!
          </p>
        )}
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[14px] ${
                  isMine
                    ? "bg-[#1a1a1a] text-white rounded-br-md"
                    : "bg-bg-card border border-border rounded-bl-md"
                }`}
              >
                <p>{msg.content}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    isMine ? "text-white/50" : "text-text-muted"
                  }`}
                >
                  {timeAgo(msg.created_at)}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-bg-card border border-border rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:border-text-muted transition-colors"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-[#1a1a1a] text-white p-2.5 rounded-full press disabled:opacity-40"
        >
          <Send size={18} strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
}
