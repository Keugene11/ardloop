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
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
              .then(() => {}, () => {});
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
    <>
      <div
        ref={scrollRef}
        className="space-y-1.5 overflow-y-auto px-1 pb-20"
        style={{ height: "calc(100dvh - 180px)" }}
      >
        {messages.length === 0 && (
          <p className="text-center text-text-muted text-[14px] py-12">
            Start the conversation
          </p>
        )}
        {messages.map((msg, i) => {
          const isMine = msg.sender_id === currentUserId;
          const prev = messages[i - 1];
          const next = messages[i + 1];
          const sameSenderPrev = prev?.sender_id === msg.sender_id;
          const sameSenderNext = next?.sender_id === msg.sender_id;

          // Show time if first message, different sender, or 5+ min gap
          const showTime = !sameSenderPrev ||
            (prev && new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > 5 * 60 * 1000);

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"} ${sameSenderPrev && !showTime ? "" : "mt-3"}`}
            >
              {showTime && (
                <p className="text-[10px] text-text-muted/50 mb-1 px-1">
                  {timeAgo(msg.created_at)}
                </p>
              )}
              <div
                className={`max-w-[75%] px-3.5 py-2 text-[15px] leading-relaxed ${
                  isMine
                    ? `bg-[#1a1a1a] text-white ${
                        sameSenderNext && !showTime ? "rounded-2xl rounded-br-md" : "rounded-2xl rounded-br-sm"
                      } ${sameSenderPrev && !showTime ? "rounded-tr-md" : ""}`
                    : `bg-bg-input ${
                        sameSenderNext && !showTime ? "rounded-2xl rounded-bl-md" : "rounded-2xl rounded-bl-sm"
                      } ${sameSenderPrev && !showTime ? "rounded-tl-md" : ""}`
                }`}
              >
                <p>{msg.content}</p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-bg z-50 border-t border-border pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <form onSubmit={handleSend} className="max-w-md md:max-w-2xl mx-auto flex gap-2 px-5 pt-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onFocus={() => setTimeout(scrollToBottom, 300)}
            placeholder="Message..."
            maxLength={5000}
            enterKeyHint="send"
            className="flex-1 bg-bg-input rounded-full pl-4 pr-4 py-2.5 text-[14px] placeholder:text-text-muted/50 outline-none focus:ring-1 focus:ring-text-muted/30 transition-all"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || sending}
            className="bg-[#1a1a1a] text-white p-3 rounded-full press disabled:opacity-30"
          >
            <Send size={18} strokeWidth={1.5} />
          </button>
        </form>
      </div>
    </>
  );
}
