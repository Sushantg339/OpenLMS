"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authService } from "../services/auth.service";

interface AuthState {
  user: User | null;
  isHydrated: boolean;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isHydrated: false,
      setUser: (user) => set({ user }),
      logout: async () => {
        try {
          await authService.logout();
        } finally {
          set({ user: null });
        }
      },
    }),
    {
      name: "veolms-auth",
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true;
      },
    }
  )
);

if (typeof window !== "undefined") {
  window.addEventListener("auth:expired", () => {
    useAuthStore.getState().setUser(null);
  });
}