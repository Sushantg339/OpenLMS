"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Terminal } from "lucide-react";
import { authService } from "@/lib/services/auth.service";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api-client";

export default function SignupPage() {
  const router = useRouter();
  const { setUser } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "", general: "" }));
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!form.name || form.name.trim().length < 3) newErrors.name = "Name must be at least 3 characters.";
    if (!form.email) newErrors.email = "Email is required.";
    if (!form.password || form.password.length < 8) newErrors.password = "Password must be at least 8 characters.";
    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      const user = await authService.signup(form);
      setUser(user);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setErrors({ general: err.message });
      } else {
        setErrors({ general: "Something went wrong. Please try again." });
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
          <h1 className="font-display text-2xl font-bold text-paper-50">Create your account</h1>
          <p className="mt-2 text-sm text-ink-500">Start learning for free today</p>
        </div>

        <form onSubmit={handleSubmit} className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900 p-6">
          <div className="flex flex-col gap-4">
            <Input
              label="Full name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Ada Lovelace"
              autoComplete="name"
              error={errors.name}
              required
            />
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              error={errors.email}
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              placeholder="8+ characters"
              autoComplete="new-password"
              error={errors.password}
              required
            />

            {errors.general && (
              <p className="rounded border border-danger-500/30 bg-danger-500/10 px-3 py-2 font-mono text-xs text-danger-400">
                {errors.general}
              </p>
            )}

            <Button type="submit" disabled={loading} className="mt-1 w-full">
              {loading ? "Creating account…" : "Create account"}
            </Button>
          </div>
        </form>

        <p className="mt-6 text-center text-sm text-ink-500">
          Already have an account?{" "}
          <Link href="/login" className="text-signal-500 hover:text-signal-400">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}