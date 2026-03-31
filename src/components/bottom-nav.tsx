"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, MessageCircle, User } from "lucide-react";

export function BottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  const items = isLoggedIn
    ? [
        { href: "/", icon: Home, label: "Home", active: pathname === "/" },
        {
          href: "/messages",
          icon: MessageCircle,
          label: "Messages",
          active: pathname.startsWith("/messages"),
        },
        {
          href: "/profile",
          icon: User,
          label: "Profile",
          active: pathname.startsWith("/profile"),
        },
      ]
    : [
        { href: "/", icon: Home, label: "Home", active: pathname === "/" },
        { href: "/login", icon: LogIn, label: "Sign in", active: false },
      ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg/90 backdrop-blur-xl border-t border-border/60 z-50">
      <div className="max-w-md mx-auto flex items-center justify-around py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center gap-1 px-6 py-1 press transition-all duration-200 ${
              item.active
                ? "text-text"
                : "text-text-muted/50 hover:text-text-muted"
            }`}
          >
            <item.icon
              size={22}
              strokeWidth={item.active ? 2.2 : 1.5}
              className={`transition-transform duration-200 ${item.active ? "scale-105" : ""}`}
            />
            <span
              className={`text-[10px] ${
                item.active ? "font-semibold" : "font-medium"
              }`}
            >
              {item.label}
            </span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
