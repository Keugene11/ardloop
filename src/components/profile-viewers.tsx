"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Eye, ChevronDown } from "lucide-react";

interface Viewer {
  id: string;
  full_name: string;
  avatar_url: string | null;
  viewed_at: string;
}

export function ProfileViewers({
  viewers,
  totalCount,
}: {
  viewers: Viewer[];
  totalCount: number;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="mb-5">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full press"
      >
        <Eye size={14} strokeWidth={1.5} className="text-text-muted" />
        <span className="text-[13px] font-semibold uppercase tracking-wide text-text-muted">
          Profile views
        </span>
        <span className="text-[13px] text-text-muted font-medium">
          · {totalCount}
        </span>
        <ChevronDown
          size={14}
          strokeWidth={2}
          className={`text-text-muted ml-auto transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
        />
      </button>

      {expanded && (
        <div className="mt-3 space-y-1 animate-fade-in">
          {viewers.length === 0 ? (
            <p className="text-[13px] text-text-muted/50 py-4 text-center">
              No profile views yet.
            </p>
          ) : (
            viewers.map((viewer) => (
              <Link
                key={viewer.id + viewer.viewed_at}
                href={`/user/${viewer.id}`}
                className="flex items-center gap-3 py-2 px-1 rounded-xl hover:bg-bg-card-hover transition-colors press"
              >
                {viewer.avatar_url ? (
                  <Image
                    src={viewer.avatar_url}
                    alt={viewer.full_name}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-bg-input flex items-center justify-center text-[12px] font-semibold text-text-muted">
                    {viewer.full_name?.[0] || "?"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <span className="text-[14px] font-medium">{viewer.full_name}</span>
                </div>
                <span className="text-[11px] text-text-muted">
                  {timeAgo(viewer.viewed_at)}
                </span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  );
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  const weeks = Math.floor(days / 7);
  return `${weeks}w`;
}
