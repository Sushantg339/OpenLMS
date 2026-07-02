"use client";

import { useState } from "react";
import { useAuthStore } from "@/lib/stores/auth.store";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

export default function Providers({ children }: { children: React.ReactNode }) {
  const [showLoader, setShowLoader] = useState(true);

  if (showLoader) {
    return <LoadingScreen onFinish={() => setShowLoader(false)} />;
  }

  return <>{children}</>;
}

export function useAuth() {
  const user = useAuthStore((s) => s.user);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  return { user, setUser, logout, isAuthenticated: !!user };
}