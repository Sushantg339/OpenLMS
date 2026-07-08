import { Button } from "@/components/ui/Button";
import { Lock } from "lucide-react";

export default function LessonNotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <Lock className="h-10 w-10 text-ink-600" />
      <h1 className="font-display text-2xl font-bold text-paper-50">Lesson not found</h1>
      <p className="max-w-sm text-paper-200">
        This lesson doesn't exist, or you don't have access to it.
      </p>
      <Button href="/dashboard">Go to dashboard</Button>
    </div>
  );
}