"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
  Package,
  MessageSquare,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

const baseNavItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/clients", label: "Clientes", icon: Users },
  { href: "/dashboard/supply-items", label: "Itens de Uso", icon: Package },
  { href: "/dashboard/settings", label: "Configurações", icon: Settings },
];

export function MobileHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userPlan, setUserPlan] = useState<string>("free");
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
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
    <header
      className="md:hidden flex items-center justify-between px-4 py-3"
      style={{
        background: "#1A1208",
        borderBottom: "1px solid rgba(192,139,42,0.1)",
      }}
    >
      <span
        className="text-xl"
        style={{
          fontFamily: "var(--font-fraunces), serif",
          fontStyle: "italic",
          color: "#FAF7F2",
        }}
      >
        Projetta
      </span>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger
          className="inline-flex items-center justify-center rounded-lg p-2 transition-colors"
          style={{ color: "#9C8A70" }}
        >
          <Menu className="h-5 w-5" />
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-72 p-0"
          style={{ background: "#1A1208", border: "none" }}
        >
          {/* Header */}
          <div
            className="px-5 py-5"
            style={{ borderBottom: "1px solid rgba(192,139,42,0.1)" }}
          >
            <span
              className="text-xl"
              style={{
                fontFamily: "var(--font-fraunces), serif",
                fontStyle: "italic",
                color: "#FAF7F2",
              }}
            >
              Projetta
            </span>
          </div>

          {/* Nav */}
          <nav className="px-3 py-4 space-y-0.5">
            {baseNavItems.map(({ href, label, icon: Icon }) => {
              const isActive =
                pathname === href ||
                (href !== "/dashboard" && pathname.startsWith(href));
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
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

                <Link
                  href="/dashboard/quote-requests"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    pathname.startsWith("/dashboard/quote-requests")
                      ? {
                          background: "rgba(192,139,42,0.1)",
                          color: "#C08B2A",
                          borderLeft: "2px solid #C08B2A",
                          paddingLeft: "calc(0.75rem - 2px)",
                        }
                      : { color: "#9C8A70" }
                  }
                >
                  <MessageSquare className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Solicitações</span>
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {pendingCount}
                    </span>
                  )}
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
                </Link>

                <Link
                  href="/dashboard/profile-public"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all"
                  style={
                    pathname.startsWith("/dashboard/profile-public")
                      ? {
                          background: "rgba(192,139,42,0.1)",
                          color: "#C08B2A",
                          borderLeft: "2px solid #C08B2A",
                          paddingLeft: "calc(0.75rem - 2px)",
                        }
                      : { color: "#9C8A70" }
                  }
                >
                  <Globe className="h-4 w-4 shrink-0" />
                  <span className="flex-1">Perfil Público</span>
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
                </Link>
              </>
            )}
          </nav>

          {/* User footer */}
          <div
            className="px-3 py-4 absolute bottom-0 w-full"
            style={{ borderTop: "1px solid rgba(192,139,42,0.1)" }}
          >
            <div className="px-3 py-2 mb-1">
              <p className="text-sm font-medium truncate" style={{ color: "#FAF7F2" }}>
                {userName ?? user?.email}
              </p>
              {userName && (
                <p className="text-xs truncate" style={{ color: "#9C8A70" }}>
                  {user?.email}
                </p>
              )}
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:text-red-400"
              style={{ color: "#9C8A70" }}
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
