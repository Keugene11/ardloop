"use client";

import { useEffect } from "react";
import { initNativeAuthListener } from "@/lib/capacitor-auth";

/**
 * Invisible component that initializes native deep link handling for OAuth.
 * Mount this in the root layout.
 */
export function NativeAuthInit() {
  useEffect(() => {
    initNativeAuthListener();
  }, []);

  return null;
}
