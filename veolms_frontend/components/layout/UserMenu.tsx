"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ChevronDown, LayoutDashboard, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/app/providers";
import { useOnClickOutside } from "@/hooks/useOnClickOutside";

export function UserMenu() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null!);

  useOnClickOutside(ref, () => setOpen(false));

  if (!user) return null;

  const handleLogout = async () => {
    setOpen(false);
    await logout();
    router.push("/");
    router.refresh();
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-full border border-ink-700 bg-ink-900 py-1.5 pl-1.5 pr-3 text-sm font-medium text-paper-100 transition-colors hover:border-ink-600"
        aria-expanded={open}
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-signal-500 text-xs font-bold text-ink-950">
          {user.name.charAt(0).toUpperCase()}
        </span>
        {user.name.split(" ")[0]}
        <ChevronDown className="h-3.5 w-3.5 text-ink-500" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 py-1 shadow-card">
          <Link href="/dashboard" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-paper-200 hover:bg-ink-800">
            <LayoutDashboard className="h-4 w-4" /> Dashboard
          </Link>
          {user.role === "ADMIN" && (
            <Link href="/admin" onClick={() => setOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-paper-200 hover:bg-ink-800">
              <ShieldCheck className="h-4 w-4" /> Admin panel
            </Link>
          )}
          <div className="my-1 rule" />
          <button onClick={handleLogout} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-danger-400 hover:bg-ink-800">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      )}
    </div>
  );
}