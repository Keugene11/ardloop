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
      <div className="text-center py-20">
        <p className="text-text-muted/50 text-[14px]">
          No messages yet.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-border/60">
      {conversations.map((conv) => (
        <Link
          key={conv.user.id}
          href={`/messages/${conv.user.id}`}
          className="flex items-center gap-3.5 py-4 press hover:bg-bg-card-hover/50 -mx-2 px-2 rounded-xl transition-colors"
        >
          <div className="relative shrink-0">
            {conv.user.avatar_url ? (
              <div className="w-12 h-12 rounded-full overflow-hidden ring-1 ring-border">
                <Image
                  src={conv.user.avatar_url}
                  alt={conv.user.full_name}
                  width={48}
                  height={48}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 rounded-full bg-bg-input flex items-center justify-center text-[16px] font-semibold text-text-muted ring-1 ring-border">
                {conv.user.full_name?.[0] || "?"}
              </div>
            )}
            {conv.unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-[#1a1a1a] text-white text-[9px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 ring-2 ring-bg">
                {conv.unreadCount}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <p className={`text-[15px] truncate ${conv.unreadCount > 0 ? "font-bold" : "font-medium"}`}>
                {conv.user.full_name}
              </p>
              <span className="text-[11px] text-text-muted/60 shrink-0">
                {timeAgo(conv.lastMessage.created_at)}
              </span>
            </div>
            <p className={`text-[13px] truncate mt-0.5 ${conv.unreadCount > 0 ? "text-text font-medium" : "text-text-muted/70"}`}>
              {conv.lastMessage.content}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
}
