import Link from "next/link";
import { Terminal } from "lucide-react";

export function Footer() {
  return (
    <footer className="rule mt-24 bg-ink-950">
      <div className="container-page flex flex-col gap-8 py-12 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
            <Terminal className="h-5 w-5 text-signal-500" strokeWidth={2.5} />
            Open<span className="text-signal-500">LMS</span>
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-500">
            Practical, project-based courses for people who learn by building.
          </p>
        </div>

        <div className="flex gap-12 font-mono text-sm">
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Platform</p>
            <ul className="space-y-2 text-paper-200">
              <li><Link href="/courses" className="hover:text-paper-50">Courses</Link></li>
              <li><Link href="/dashboard" className="hover:text-paper-50">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 text-xs uppercase tracking-wide text-ink-500">Account</p>
            <ul className="space-y-2 text-paper-200">
              <li><Link href="/login" className="hover:text-paper-50">Log in</Link></li>
              <li><Link href="/signup" className="hover:text-paper-50">Sign up</Link></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="rule">
        <div className="container-page flex items-center justify-between py-5 font-mono text-xs text-ink-500">
          <span>© {new Date().getFullYear()} OpenLMS</span>
          <span>Built for the OpenLMS core team challenge</span>
        </div>
      </div>
    </footer>
  );
}