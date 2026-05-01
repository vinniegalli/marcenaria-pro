"use client";

import { useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

const OPTIONS = [
  { value: "mes", label: "Este mês" },
  { value: "ano", label: "Este ano" },
  { value: "tudo", label: "Tudo" },
];

export function PeriodFilter({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  function select(value: string) {
    if (value === current) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set("periodo", value);
    startTransition(() => {
      router.push(`/dashboard?${params.toString()}`);
    });
  }

  return (
    <div
      className={cn(
        "flex gap-1 bg-gray-100 rounded-lg p-1 w-fit transition-opacity",
        isPending && "opacity-70",
      )}
    >
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => select(opt.value)}
          disabled={isPending}
          className={cn(
            "px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-1.5",
            current === opt.value
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700",
          )}
        >
          {isPending && current === opt.value && (
            <Loader2 className="h-3 w-3 animate-spin" />
          )}
          {opt.label}
        </button>
      ))}
    </div>
  );
}
