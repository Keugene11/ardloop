"use client";

import Link from "next/link";
import Image from "next/image";
import { timeAgo } from "@/lib/utils";

interface ConversationItem {
  user: {
    id: string;
    full_name: string;
    avatar_url: string | null;
  };
  lastMessage: {
    content: string;
    created_at: string;
  };
  unreadCount: number;
}

export function ConversationList({
  conversations,
}: {
  conversations: ConversationItem[];
}) {
  if (conversations.length === 0) {
    return (
      <div className="text-center py-12 text-text-muted text-[14px]">
        No messages yet. Tap the send icon on a post to start a conversation.
      </div>
    );
  }

  return (
    <div className="space-y-2 stagger">
      {conversations.map((conv) => (
        <Link
          key={conv.user.id}
          href={`/messages/${conv.user.id}`}
          className="flex items-center gap-3 bg-bg-card border border-border rounded-2xl px-4 py-3.5 hover:bg-bg-card-hover transition-colors press"
        >
          {conv.user.avatar_url ? (
            <Image
              src={conv.user.avatar_url}
              alt={conv.user.full_name}
              width={44}
              height={44}
              className="rounded-full"
            />
          ) : (
            <div className="w-11 h-11 rounded-full bg-bg-input flex items-center justify-center text-[16px] font-semibold text-text-muted">
              {conv.user.full_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <p className="text-[14px] font-semibold truncate">
                {conv.user.full_name}
              </p>
              <span className="text-[11px] text-text-muted shrink-0 ml-2">
                {timeAgo(conv.lastMessage.created_at)}
              </span>
            </div>
            <p className="text-[13px] text-text-muted truncate">
              {conv.lastMessage.content}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="bg-[#1a1a1a] text-white text-[11px] font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0">
              {conv.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
