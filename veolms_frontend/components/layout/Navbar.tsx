"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Menu, X, Terminal } from "lucide-react";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/Button";
import { UserMenu } from "@/components/layout/UserMenu";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    router.push(`/courses?search=${encodeURIComponent(query.trim())}`);
    setMobileOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-ink-700 bg-ink-950/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center gap-6">
        <Link href="/" className="flex shrink-0 items-center gap-2 font-display text-lg font-bold tracking-tight">
          <Terminal className="h-5 w-5 text-signal-500" strokeWidth={2.5} />
          Open<span className="text-signal-500">LMS</span>
        </Link>

        <form onSubmit={handleSearch} className="relative hidden flex-1 max-w-md md:block">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search courses…"
            className="w-full rounded-full border border-ink-700 bg-ink-900 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder:text-ink-500 transition-colors focus:border-signal-500 focus:outline-none"
            aria-label="Search courses"
          />
        </form>

        <nav className="ml-auto hidden items-center gap-6 md:flex">
          <Link href="/courses" className="text-sm font-medium text-paper-200 transition-colors hover:text-paper-50">
            Courses
          </Link>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-paper-200 transition-colors hover:text-paper-50">
                Log in
              </Link>
              <Button href="/signup" size="sm">
                Sign up
              </Button>
            </>
          )}
        </nav>

        <button className="ml-auto md:hidden" onClick={() => setMobileOpen((v) => !v)} aria-label={mobileOpen ? "Close menu" : "Open menu"}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-ink-700 bg-ink-950 px-5 py-4 md:hidden">
          <form onSubmit={handleSearch} className="relative mb-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search courses…"
              className="w-full rounded-full border border-ink-700 bg-ink-900 py-2 pl-9 pr-4 text-sm placeholder:text-ink-500 focus:border-signal-500 focus:outline-none"
            />
          </form>
          <div className="flex flex-col gap-3">
            <Link href="/courses" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-paper-200">
              Courses
            </Link>
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-paper-200">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)} className="text-sm font-medium text-paper-200">
                  Log in
                </Link>
                <Button href="/signup" size="sm" className="w-fit">
                  Sign up
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}