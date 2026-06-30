import { notFound } from "next/navigation";
import Image from "next/image";
import { serverFetch } from "@/lib/server-fetch";
import type { CourseDetail } from "@/types";
import { lessonCount, totalCourseDuration, formatPrice } from "@/lib/format";
import { CourseCurriculum } from "@/components/course/CourseCurriculum";
import { EnrollPanel } from "@/components/course/EnrollPanel";
import { PlayCircle, Clock, BookOpen } from "lucide-react";

interface CoursePageProps {
  params: { slug: string };
}

export default async function CoursePage({ params }: CoursePageProps) {
  // revalidate: 0 here on purpose — this page's lesson-access flags depend on
  // whether the visitor is enrolled, so we don't want a stale cached version
  // showing locked lessons to someone who just paid.
  const course = await serverFetch<CourseDetail>(`/courses/${params.slug}`, { revalidate: 0 });

  if (!course) notFound();

  const totalLessons = lessonCount(course.sections);
  const totalDuration = totalCourseDuration(course.sections);

  return (
    <div>
      <div className="border-b border-ink-700 bg-ink-900">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr,1fr]">
          <div>
            <p className="mb-3 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
              {course.instructorName}
            </p>
            <h1 className="font-display text-3xl font-bold leading-tight tracking-tight text-paper-50 sm:text-4xl">
              {course.title}
            </h1>
            {course.description && (
              <p className="mt-4 max-w-xl text-balance text-base leading-relaxed text-paper-200">
                {course.description}
              </p>
            )}

            <div className="mt-6 flex flex-wrap gap-6 font-mono text-sm text-ink-500">
              <span className="flex items-center gap-2">
                <BookOpen className="h-4 w-4" /> {totalLessons} lessons
              </span>
              <span className="flex items-center gap-2">
                <Clock className="h-4 w-4" /> {totalDuration}
              </span>
            </div>
          </div>

          <div className="lg:row-span-2">
            <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-950 shadow-card">
              <div className="relative aspect-video bg-ink-800">
                {course.thumbnailUrl ? (
                  <Image src={course.thumbnailUrl} alt="" fill className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-ink-600">
                    <PlayCircle className="h-12 w-12" />
                  </div>
                )}
              </div>
              <div className="p-6">
                <EnrollPanel course={course} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container-page py-14">
        <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-paper-50">
          Curriculum
        </h2>
        <CourseCurriculum sections={course.sections} courseSlug={course.slug} />
      </div>
    </div>
  );
}