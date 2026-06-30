import { api, type ApiEnvelope } from "../api-client";
import type { User } from "@/types";

export const authService = {
  signup: (data: { name: string; email: string; password: string }) =>
    api.post<ApiEnvelope<User>>("/auth/signup", data).then((r) => r.data.data),

  login: (data: { email: string; password: string }) =>
    api.post<ApiEnvelope<User>>("/auth/login", data).then((r) => r.data.data),

  logout: () => api.post("/auth/logout"),
};