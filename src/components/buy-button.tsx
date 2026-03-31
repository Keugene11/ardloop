"use client";

import { useState } from "react";

export function BuyButton({
  postId,
  sellerOnboarded,
}: {
  postId: string;
  sellerOnboarded: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    if (!sellerOnboarded) return;
    setLoading(true);

    try {
      const res = await fetch("/api/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || "Something went wrong");
        setLoading(false);
      }
    } catch {
      alert("Network error. Please try again.");
      setLoading(false);
    }
  };

  if (!sellerOnboarded) {
    return (
      <span className="text-[12px] text-text-muted">
        Seller hasn&apos;t set up payments
      </span>
    );
  }

  return (
    <button
      onClick={handleBuy}
      disabled={loading}
      className="bg-[#1a1a1a] text-white px-5 py-2 rounded-xl font-semibold text-[13px] press disabled:opacity-40"
    >
      {loading ? "Processing..." : "Buy Now"}
    </button>
  );
}
