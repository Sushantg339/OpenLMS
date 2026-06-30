import { serverFetch } from "@/lib/server-fetch";
import type { CourseSummary } from "@/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export async function FeaturedCourses() {
  const courses = await serverFetch<CourseSummary[]>("/courses", {
    params: { limit: 6 },
  });

  return (
    <section className="container-page py-20">
      <div className="mb-10 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
            Featured
          </p>
          <h2 className="font-display text-2xl font-bold tracking-tight text-paper-50 sm:text-3xl">
            Start with these
          </h2>
        </div>
        <Button href="/courses" variant="secondary" size="sm" className="hidden sm:inline-flex">
          View all
        </Button>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-16 text-center">
          <p className="font-mono text-sm text-ink-500">No courses published yet — check back soon.</p>
        </div>
      ) : (
        <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Reveal>
      )}
    </section>
  );
}