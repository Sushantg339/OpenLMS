"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/providers";
import { Spinner } from "@/components/ui/Spinner";
import { LayoutDashboard, BookOpen, Users, ShieldCheck } from "lucide-react";
import { cx } from "@/lib/format";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/courses", label: "Courses", icon: BookOpen },
  { href: "/admin/students", label: "Students", icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated && user?.role !== "ADMIN") {
      router.replace("/dashboard");
    }
    if (!isAuthenticated) {
      router.replace("/login?redirect=/admin");
    }
  }, [isAuthenticated, user, router]);

  if (!user || user.role !== "ADMIN") {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-ink-700 bg-ink-900 lg:flex">
        <div className="border-b border-ink-700 px-4 py-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-signal-500" />
            <span className="font-mono text-xs uppercase tracking-wide text-ink-500">
              Admin panel
            </span>
          </div>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = exact ? pathname === href : pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                className={cx(
                  "flex items-center gap-3 rounded px-3 py-2 text-sm font-medium transition-colors",
                  active
                    ? "bg-ink-800 text-paper-50"
                    : "text-paper-200 hover:bg-ink-800/60 hover:text-paper-50"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}