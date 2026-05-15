export type PlanId = "free" | "starter" | "pro";

export const PLAN_LIMITS = {
  free: {
    clients: 2,
    projects: 3,
    uploads: 3,
    reviews: 1,
    supplyItems: 10,
  },
  starter: {
    clients: 15,
    projects: 30,
    uploads: 20,
    reviews: Infinity,
    supplyItems: Infinity,
  },
  pro: {
    clients: Infinity,
    projects: Infinity,
    uploads: Infinity,
    reviews: Infinity,
    supplyItems: Infinity,
  },
} as const satisfies Record<PlanId, Record<string, number>>;

export function getLimit(
  plan: string,
  key: keyof (typeof PLAN_LIMITS)["free"],
): number {
  const limits = PLAN_LIMITS[plan as PlanId] ?? PLAN_LIMITS.free;
  return limits[key];
}

export const PLAN_LABELS: Record<PlanId, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

export const PLAN_PRICES: Record<PlanId, number> = {
  free: 0,
  starter: 49,
  pro: 129,
};
