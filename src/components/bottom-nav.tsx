"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, LogIn, MessageCircle, User } from "lucide-react";

export function BottomNav({ isLoggedIn }: { isLoggedIn: boolean }) {
  const pathname = usePathname();

  if (!isLoggedIn) {
    return (
      <nav className="fixed bottom-0 left-0 right-0 bg-bg/80 backdrop-blur-lg border-t border-border/50 z-50">
        <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
          <NavLink href="/" icon={Home} label="Feed" active={pathname === "/"} />
          <NavLink href="/login" icon={LogIn} label="Sign in" active={false} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-bg/80 backdrop-blur-lg border-t border-border/50 z-50">
      <div className="max-w-md md:max-w-2xl mx-auto flex items-center justify-around py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
        <NavLink href="/" icon={Home} label="Feed" active={pathname === "/"} />
        <NavLink href="/messages" icon={MessageCircle} label="Messages" active={pathname.startsWith("/messages")} />
        <NavLink href="/profile" icon={User} label="Profile" active={pathname.startsWith("/profile")} />
      </div>
    </nav>
  );
}

function NavLink({
  href,
  icon: Icon,
  label,
  active,
}: {
  href: string;
  icon: React.ComponentType<{ size: number; strokeWidth: number }>;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`flex flex-col items-center gap-0.5 px-5 py-1.5 press transition-colors ${
        active ? "text-text" : "text-text-muted/60"
      }`}
    >
      <Icon size={20} strokeWidth={active ? 2 : 1.5} />
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}
