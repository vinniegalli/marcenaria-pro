"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Hammer,
  Menu,
  X,
  Package,
  MessageSquare,
  Globe,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
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

  return (
    <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-gray-200">
      <div className="flex items-center gap-2">
        <div className="bg-amber-500 rounded-lg p-1.5">
          <Hammer className="h-4 w-4 text-white" />
        </div>
        <span className="font-bold text-base text-gray-900">MarcenariaPro</span>
      </div>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="inline-flex items-center justify-center rounded-lg p-2 text-gray-600 hover:bg-gray-100 transition-colors">
          <Menu className="h-5 w-5" />
        </SheetTrigger>
        <SheetContent side="right" className="w-72 p-0">
          <div className="flex items-center justify-between px-6 py-5 border-b">
            <span className="font-bold text-gray-900">Menu</span>
            <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <nav className="px-3 py-4 space-y-1">
            {baseNavItems.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  pathname === href ||
                    (href !== "/dashboard" && pathname.startsWith(href))
                    ? "bg-amber-50 text-amber-700"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
            {userPlan === "pro" && (
              <>
                <div className="px-3 pt-3 pb-1">
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pro</p>
                </div>
                <Link
                  href="/dashboard/quote-requests"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/dashboard/quote-requests" || pathname.startsWith("/dashboard/quote-requests")
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <MessageSquare className="h-4 w-4" />
                  <span className="flex-1">Solicitações</span>
                  {pendingCount > 0 && (
                    <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 min-w-5 flex items-center justify-center px-1">
                      {pendingCount}
                    </span>
                  )}
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Beta</span>
                </Link>
                <Link
                  href="/dashboard/profile-public"
                  onClick={() => setOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    pathname === "/dashboard/profile-public" || pathname.startsWith("/dashboard/profile-public")
                      ? "bg-amber-50 text-amber-700"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                  )}
                >
                  <Globe className="h-4 w-4" />
                  <span className="flex-1">Perfil Público</span>
                  <span className="text-xs bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded font-semibold">Beta</span>
                </Link>
              </>
            )}
          </nav>
          <div className="px-3 py-4 border-t absolute bottom-0 w-full">
            <div className="px-3 py-2 mb-2">
              <p className="text-sm font-medium truncate">
                {user?.user_metadata?.name ?? user?.email}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-gray-600 hover:text-red-600"
              onClick={handleSignOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </header>
  );
}
