import type { ApiEnvelope } from "./api-client";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function serverFetch<T>(
  path: string,
  options?: { revalidate?: number; params?: Record<string, string | number | undefined> }
): Promise<T | null> {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (options?.params) {
    Object.entries(options.params).forEach(([key, value]) => {
      if (value !== undefined) url.searchParams.set(key, String(value));
    });
  }

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: options?.revalidate ?? 60 },
    });

    if (!res.ok) return null;

    const json: ApiEnvelope<T> = await res.json();
    return json.data;
  } catch {
    return null;
  }
}