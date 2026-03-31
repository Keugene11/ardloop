import { createClient } from "@/lib/supabase/client";

/**
 * Check if running inside a Capacitor native app (iOS/Android)
 */
export function isNativePlatform(): boolean {
  if (typeof window === "undefined") return false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cap = (window as any).Capacitor;
  return cap?.isNativePlatform?.() ?? false;
}

/**
 * Perform OAuth sign-in using SFSafariViewController (iOS) or Chrome Custom Tabs (Android)
 * instead of redirecting to the system browser.
 */
export async function nativeOAuthSignIn(provider: "google" | "apple") {
  const supabase = createClient();

  // Get the OAuth URL without auto-redirecting
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "com.ardsleypost.app://auth/callback",
      skipBrowserRedirect: true,
    },
  });

  if (error || !data?.url) {
    console.error("OAuth URL generation failed:", error);
    return;
  }

  // Open in SFSafariViewController / Chrome Custom Tabs (stays in-app)
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({
    url: data.url,
    presentationStyle: "popover",
  });
}

/**
 * Initialize deep link listener for OAuth callbacks.
 * Call this once on app mount (e.g., in root layout).
 */
export function initNativeAuthListener() {
  if (!isNativePlatform()) return;

  import("@capacitor/app").then(({ App }) => {
    App.addListener("appUrlOpen", async ({ url }) => {
      // Handle OAuth callback deep links
      if (url.includes("auth/callback")) {
        try {
          const urlObj = new URL(url);

          // PKCE flow: Supabase redirects with ?code=...
          const code = urlObj.searchParams.get("code");
          if (code) {
            const supabase = createClient();
            const { error } = await supabase.auth.exchangeCodeForSession(code);
            if (error) {
              console.error("Session exchange failed:", error);
            }
          }

          // Implicit flow: Supabase redirects with #access_token=...
          if (url.includes("access_token")) {
            const hashParams = new URLSearchParams(
              urlObj.hash.substring(1)
            );
            const accessToken = hashParams.get("access_token");
            const refreshToken = hashParams.get("refresh_token");
            if (accessToken && refreshToken) {
              const supabase = createClient();
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
            }
          }
        } catch (err) {
          console.error("Auth callback handling failed:", err);
        }

        // Close the in-app browser and navigate home
        try {
          const { Browser } = await import("@capacitor/browser");
          await Browser.close();
        } catch {
          // Browser may already be closed
        }

        // Reload to pick up the new session
        window.location.href = "/";
      }
    });
  });
}
