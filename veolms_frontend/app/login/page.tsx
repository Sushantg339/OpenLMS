"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api-client";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuth();

  const redirect = searchParams.get("redirect") ?? "/dashboard";

  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);
    try {
      const user = await authService.login(form);
      setUser(user);
      router.push(redirect);
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-flex items-center gap-2 font-display text-lg font-bold">
            <Terminal className="h-5 w-5 text-signal-500" />
            Veo<span className="text-signal-500">LMS</span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-paper-50">Welcome back</h1>
          <p className="mt-2 text-sm text-ink-500">Log in to continue learning</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900 p-6">
          <div className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              autoComplete="current-password"
              required
            />

            {error && (
              <p className="rounded border border-danger-500/30 bg-danger-500/10 px-3 py-2 font-mono text-xs text-danger-400">
                {error}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Logging in…" : "Log in"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Don't have an account?{" "}
          <Link href="/signup" className="text-signal-500 hover:text-signal-400">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}