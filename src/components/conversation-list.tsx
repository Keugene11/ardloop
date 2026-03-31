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
      <div className="text-center py-16 text-text-muted text-[14px]">
        No messages yet.
      </div>
    );
  }

  return (
    <div className="divide-y divide-border">
      {conversations.map((conv) => (
        <Link
          key={conv.user.id}
          href={`/messages/${conv.user.id}`}
          className="flex items-center gap-3 py-3.5 press"
        >
          {conv.user.avatar_url ? (
            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0">
              <Image
                src={conv.user.avatar_url}
                alt={conv.user.full_name}
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="w-11 h-11 rounded-full bg-bg-input flex items-center justify-center text-[15px] font-semibold text-text-muted shrink-0">
              {conv.user.full_name?.[0] || "?"}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline justify-between">
              <p className={`text-[14px] truncate ${conv.unreadCount > 0 ? "font-bold" : "font-semibold"}`}>
                {conv.user.full_name}
              </p>
              <span className="text-[11px] text-text-muted shrink-0 ml-2">
                {timeAgo(conv.lastMessage.created_at)}
              </span>
            </div>
            <p className={`text-[13px] truncate mt-0.5 ${conv.unreadCount > 0 ? "text-text font-medium" : "text-text-muted"}`}>
              {conv.lastMessage.content}
            </p>
          </div>
          {conv.unreadCount > 0 && (
            <span className="bg-[#1a1a1a] text-white text-[10px] font-bold min-w-[20px] h-5 rounded-full flex items-center justify-center shrink-0 px-1.5">
              {conv.unreadCount}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}
