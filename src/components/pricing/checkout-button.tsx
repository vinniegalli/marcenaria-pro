"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

interface CheckoutButtonProps {
  plan: "free" | "starter" | "pro";
  label: string;
  className: string;
}

export function CheckoutButton({
  plan,
  label,
  className,
}: CheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleClick() {
    if (plan === "free") {
      router.push("/register");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan }),
      });

      if (res.status === 401) {
        // Not logged in — send to register with plan hint
        router.push(`/register?plan=${plan}`);
        return;
      }

      const json = (await res.json().catch(() => ({}))) as { url?: string };
      if (!res.ok || !json.url) {
        // Fallback to register
        router.push(`/register?plan=${plan}`);
        return;
      }

      window.location.href = json.url;
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={`flex items-center justify-center gap-2 w-full font-semibold py-3 rounded-xl transition-colors text-sm mb-6 disabled:opacity-70 ${className}`}
    >
      {loading && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  );
}
