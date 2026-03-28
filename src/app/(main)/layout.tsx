import { BottomNav } from "@/components/bottom-nav";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md mx-auto px-5 pt-6 pb-24">{children}</main>
      <BottomNav />
    </div>
  );
}
