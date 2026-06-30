import { serverFetch } from "@/lib/server-fetch";
import type { CourseSummary } from "@/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Reveal } from "@/components/ui/Reveal";

interface CoursesPageProps {
  searchParams: { search?: string };
}

export default async function CoursesPage({ searchParams }: CoursesPageProps) {
  const search = searchParams.search;

  const courses = await serverFetch<CourseSummary[]>("/courses", {
    params: { limit: 24, search },
    revalidate: 30,
  });

  return (
    <div className="container-page py-16">
      <div className="mb-10">
        <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          {search ? "Search results" : "All courses"}
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-paper-50 sm:text-4xl">
          {search ? `Results for "${search}"` : "Browse the catalog"}
        </h1>
      </div>

      {!courses || courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-20 text-center">
          <p className="font-mono text-sm text-ink-500">
            {search ? `No courses match "${search}".` : "No courses published yet — check back soon."}
          </p>
        </div>
      ) : (
        <Reveal className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </Reveal>
      )}
    </div>
  );
}