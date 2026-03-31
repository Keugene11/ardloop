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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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

    const content = newMessage.trim();
    setNewMessage("");
    setSending(true);

    const supabase = createClient();
    const { data } = await supabase
      .from("messages")
      .insert({
        sender_id: currentUserId,
        receiver_id: otherUserId,
        content,
      })
      .select()
      .single();

    if (data) {
      setMessages((prev) => [...prev, data]);
    }
    setSending(false);
  };

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 180px)" }}>
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto space-y-1 px-1 pb-4"
      >
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full">
            <p className="text-text-muted/50 text-[14px]">
              Start the conversation
            </p>
          </div>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          const prevMsg = messages[i - 1];
          const sameSender = prevMsg?.sender_id === msg.sender_id;
          const showGap = !sameSender && i > 0;

          return (
            <div
              key={msg.id}
              className={`flex ${isMine ? "justify-end" : "justify-start"} ${showGap ? "pt-2" : ""}`}
            >
              <div
                className={`max-w-[75%] px-3.5 py-2 text-[14px] leading-snug ${
                  isMine
                    ? "bg-[#1a1a1a] text-white rounded-2xl rounded-br-md"
                    : "bg-bg-input text-text rounded-2xl rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.content}</p>
                <p
                  className={`text-[10px] mt-0.5 ${
                    isMine ? "text-white/30" : "text-text-muted/50"
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

      <form
        onSubmit={handleSend}
        className="flex gap-2 pt-3 border-t border-border/60"
      >
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Message..."
          className="flex-1 bg-bg-input/70 border border-transparent focus:border-border rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/40 outline-none transition-all"
        />
        <button
          type="submit"
          disabled={!newMessage.trim() || sending}
          className="bg-[#1a1a1a] text-white p-2.5 rounded-full press disabled:opacity-20 transition-opacity"
        >
          <Send size={16} strokeWidth={1.5} />
        </button>
      </form>
    </div>
  );
}
