import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ardsleypost — Ardsley Community",
  description: "Connect with your Ardsley community. Post, chat, and find local services.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
