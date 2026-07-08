import { Button } from "@/components/ui/Button";

export default function AdminCourseNotFound() {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4 text-center">
      <p className="font-mono text-sm text-ink-500">404</p>
      <h1 className="font-display text-xl font-bold text-paper-50">Course not found</h1>
      <Button href="/admin/courses">Back to courses</Button>
    </div>
  );
}