import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ardsleypost — Ardsley Community",
  description: "The social network built for Ardsley students, parents, and alumni.",
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
