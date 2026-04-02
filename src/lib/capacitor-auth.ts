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
 * Perform OAuth sign-in using ASWebAuthenticationSession (iOS) or Chrome Custom Tabs (Android).
 * ASWebAuthenticationSession shares cookies with Safari so users see their existing Google accounts.
 */
export async function nativeOAuthSignIn(provider: "google" | "apple") {
  const supabase = createClient();

  // Get the OAuth URL without auto-redirecting
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: "com.ardsleypost.app://auth/callback",
      skipBrowserRedirect: true,
      queryParams: provider === "google" ? { prompt: "select_account" } : {},
    },
  });

  if (error || !data?.url) {
    console.error("OAuth URL generation failed:", error);
    return;
  }

  // Try ASWebAuthenticationSession (shares Safari cookies — shows Google account picker)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const WebAuth = (window as any).Capacitor?.Plugins?.WebAuth;
  if (WebAuth) {
    try {
      const result = await WebAuth.start({
        url: data.url,
        callbackScheme: "com.ardsleypost.app",
      });
      if (result?.url) {
        // Extract code from callback URL and exchange for session
        const callbackUrl = new URL(result.url);
        const code = callbackUrl.searchParams.get("code");
        if (code) {
          await supabase.auth.exchangeCodeForSession(code);
          window.location.href = "/";
          return;
        }
      }
    } catch (err) {
      console.error("WebAuth failed:", err);
    }
    return;
  }

  // Fallback: Browser plugin (Android or if WebAuth unavailable)
  const { Browser } = await import("@capacitor/browser");
  await Browser.open({
    url: data.url,
    presentationStyle: "fullscreen",
    windowName: "_self",
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
