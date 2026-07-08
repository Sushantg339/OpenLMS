"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { PlayCircle, Clock, BookOpen } from "lucide-react";
import { dashboardService } from "@/lib/services/dashboard.service";
import type { MyCourseProgress, ContinueLearningItem } from "@/types";
import { CourseCard } from "@/components/course/CourseCard";
import { Spinner } from "@/components/ui/Spinner";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/app/providers";
import { formatDuration } from "@/lib/format";

export default function DashboardPage() {
  const { user } = useAuth();
  const [courses, setCourses] = useState<MyCourseProgress[]>([]);
  const [continueItems, setContinueItems] = useState<ContinueLearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesData, continueData] = await Promise.all([
          dashboardService.myCourses(),
          dashboardService.continueLearning(),
        ]);
        setCourses(coursesData ?? []);
        setContinueItems(continueData ?? []);
      } catch {
        // silent — user sees empty state
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="container-page py-14">
      <div className="mb-10">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          Dashboard
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-paper-50">
          Welcome back{user?.name ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
      </div>

      {/* Continue Learning */}
      {continueItems.length > 0 && (
        <section className="mb-14">
          <h2 className="mb-5 font-display text-xl font-semibold text-paper-50">
            Continue learning
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {continueItems.slice(0, 3).map((item) => (
              <Link
                key={item.lesson.id}
                href={`/learn/${item.lesson.id}`}
                onClick={() =>
                  localStorage.setItem(
                    "veolms-current-course-slug",
                    item.lesson.section.course.slug
                  )
                }
                className="group flex items-center gap-4 overflow-hidden rounded-lg border border-ink-700 bg-ink-900 p-4 transition-colors hover:border-ink-600"
              >
                <div className="relative h-14 w-24 shrink-0 overflow-hidden rounded bg-ink-800">
                  {item.lesson.section.course.thumbnailUrl ? (
                    <Image
                      src={item.lesson.section.course.thumbnailUrl}
                      alt=""
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <PlayCircle className="h-6 w-6 text-ink-600" />
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-mono text-[11px] uppercase text-ink-500">
                    {item.lesson.section.course.title}
                  </p>
                  <p className="mt-0.5 truncate text-sm font-medium text-paper-100">
                    {item.lesson.title}
                  </p>
                  <p className="mt-1 flex items-center gap-1 font-mono text-xs text-ink-500">
                    <Clock className="h-3 w-3" />
                    {formatDuration(item.watchedSeconds)} watched
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* My Courses */}
      <section>
        <h2 className="mb-5 font-display text-xl font-semibold text-paper-50">
          My courses
        </h2>

        {courses.length === 0 ? (
          <div className="rounded-lg border border-dashed border-ink-700 py-20 text-center">
            <BookOpen className="mx-auto mb-4 h-10 w-10 text-ink-600" />
            <p className="mb-2 font-display text-lg font-semibold text-paper-50">
              No courses yet
            </p>
            <p className="mb-6 text-sm text-ink-500">
              Enroll in your first course to get started.
            </p>
            <Button href="/courses">Browse courses</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  thumbnailUrl: course.thumbnailUrl,
                  price: 0,
                  instructorName: "",
                  isPublished: true,
                  createdAt: course.enrolledAt,
                  description: null,
                  trailerVideoUrl: null,
                }}
                progressPercent={course.progressPercent}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}