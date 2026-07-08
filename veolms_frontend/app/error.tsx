"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/Button";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="font-mono text-sm text-ink-500">Something went wrong</p>
      <h1 className="font-display text-2xl font-bold text-paper-50">{error.message}</h1>
      <div className="flex gap-3">
        <Button onClick={reset}>Try again</Button>
        <Button href="/" variant="secondary">Go home</Button>
      </div>
    </div>
  );
}