import { Button } from "@/components/ui/Button";

export default function CourseNotFound() {
  return (
    <div className="container-page flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="mb-3 font-mono text-sm text-ink-500">404</p>
      <h1 className="mb-4 font-display text-2xl font-bold text-paper-50">Course not found</h1>
      <p className="mb-8 max-w-sm text-paper-200">
        This course doesn't exist, isn't published yet, or the link is wrong.
      </p>
      <Button href="/courses">Browse all courses</Button>
    </div>
  );
}