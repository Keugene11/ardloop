import { createClient } from "@/lib/supabase/server";
import { BottomNav } from "@/components/bottom-nav";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen bg-bg">
      <main className="max-w-md md:max-w-2xl mx-auto px-5 pt-6 pb-24">{children}</main>
      <BottomNav isLoggedIn={!!user} />
    </div>
  );
}
