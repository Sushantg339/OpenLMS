"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div suppressHydrationWarning>{children}</div>;
  }

  return <>{children}</>;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  return { user, setUser, logout, isAuthenticated: !!user };
}