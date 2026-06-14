"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Hammer,
  Package,
  MessageSquare,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/supply-items", label: "Itens de Uso", icon: Package },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

const PLAN_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Starter",
  pro: "Pro",
};

function PlanBadge({ plan }: { plan: string }) {
  if (plan === "free") return null;
  return (
    <span
      className="text-xs font-bold px-2 py-0.5 rounded"
      style={
        plan === "pro"
          ? { background: "rgba(192,139,42,0.2)", color: "#C08B2A" }
          : { background: "rgba(250,247,242,0.1)", color: "#9C8A70" }
      }
    >
      {PLAN_LABELS[plan] ?? plan}
    </span>
  );
}

function UserAvatar({ name, email }: { name?: string; email?: string }) {
  const initials = name
    ? name
        .split(" ")
        .slice(0, 2)
        .map((n) => n[0])
        .join("")
        .toUpperCase()
    : email?.[0]?.toUpperCase() ?? "?";

  return (
    <div
      className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
      style={{ background: "rgba(192,139,42,0.2)", color: "#C08B2A" }}
    >
      {initials}
    </div>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
    fetch("/api/profile")
      .then((r) => r.json())
      .then((d) => {
        const plan = d?.plan ?? "free";
        setUserPlan(plan);
        if (plan === "pro") {
          fetch("/api/quote-requests?pendingOnly=1")
            .then((r) => r.json())
            .then((data) => setPendingCount(data?.count ?? 0))
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const userName = user?.user_metadata?.name as string | undefined;

  return (
    <aside
      className="hidden md:flex flex-col w-64 h-full"
      style={{ background: "#1A1208", borderRight: "1px solid rgba(192,139,42,0.1)" }}
    >
      {/* Logo */}
      <div
        className="flex items-center gap-2.5 px-5 py-5"
        style={{ borderBottom: "1px solid rgba(192,139,42,0.1)" }}
      >
        <div
          className="rounded-md p-1.5 shrink-0"
          style={{ background: "#C08B2A" }}
        >
          <Hammer className="h-4 w-4 text-white" />
        </div>
        <span
          className="font-bold text-base tracking-tight"
          style={{
            fontFamily: "var(--font-fraunces), serif",
            color: "#FAF7F2",
          }}
        >
          MarcenariaPro
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {baseNavItems.map(({ href, label, icon: Icon }) => {
          const isActive =
            pathname === href ||
            (href !== "/dashboard" && pathname.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative",
                isActive
                  ? "text-[#C08B2A]"
                  : "hover:text-[#FAF7F2]"
              )}
              style={
                isActive
                  ? {
                      background: "rgba(192,139,42,0.1)",
                      color: "#C08B2A",
                      borderLeft: "2px solid #C08B2A",
                      paddingLeft: "calc(0.75rem - 2px)",
                    }
                  : { color: "#9C8A70" }
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}

        {userPlan === "pro" && (
          <>
            <div className="px-3 pt-5 pb-2">
              <p
                className="text-xs font-semibold uppercase tracking-widest"
                style={{ color: "rgba(192,139,42,0.5)" }}
              >
                Pro
              </p>
            </div>

            {[
              {
                href: "/dashboard/quote-requests",
                label: "Solicitações",
                icon: MessageSquare,
                badge: pendingCount > 0 ? pendingCount : null,
                isBeta: true,
              },
              {
                href: "/dashboard/profile-public",
                label: "Perfil Público",
                icon: Globe,
                badge: null,
                isBeta: true,
              },
            ].map(({ href, label, icon: Icon, badge, isBeta }) => {
              const isActive =
                pathname === href || pathname.startsWith(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    isActive
                      ? {
                          background: "rgba(192,139,42,0.1)",
                          color: "#C08B2A",
                          borderLeft: "2px solid #C08B2A",
                          paddingLeft: "calc(0.75rem - 2px)",
                        }
                      : { color: "#9C8A70" }
                  }
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {badge && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {badge}
                    </span>
                  )}
                  {isBeta && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded"
                      style={{
                        background: "rgba(192,139,42,0.15)",
                        color: "#C08B2A",
                        fontSize: "0.65rem",
                      }}
                    >
                      Beta
                    </span>
                  )}
                </Link>
              );
            })}
          </>
        )}
      </nav>

      {/* User area */}
      <div
        className="px-3 py-4"
        style={{ borderTop: "1px solid rgba(192,139,42,0.1)" }}
      >
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg mb-1">
          <UserAvatar name={userName} email={user?.email} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p
                className="text-sm font-medium truncate"
                style={{ color: "#FAF7F2" }}
              >
                {userName ?? user?.email}
              </p>
              <PlanBadge plan={userPlan} />
            </div>
            {userName && (
              <p className="text-xs truncate" style={{ color: "#9C8A70" }}>
                {user?.email}
              </p>
            )}
          </div>
        </div>

        <button
          onClick={handleSignOut}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-all hover:text-red-400"
          style={{ color: "#9C8A70" }}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </button>
      </div>
    </aside>
  );
}
