import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <p className="font-mono text-sm text-ink-500">404</p>
      <h1 className="font-display text-3xl font-bold text-paper-50">Page not found</h1>
      <p className="max-w-sm text-paper-200">
        The page you're looking for doesn't exist or has moved.
      </p>
      <Button href="/">Go home</Button>
    </div>
  );
}