import Image from "next/image";
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import type { CourseSummary } from "@/types";
import { formatPrice } from "@/lib/format";

interface CourseCardProps {
  course: CourseSummary;
  progressPercent?: number;
}

export function CourseCard({ course, progressPercent }: CourseCardProps) {
  const isEnrolled = typeof progressPercent === "number";

  return (
    <Link
      href={`/courses/${course.slug}`}
      className="group relative block overflow-hidden rounded-lg border border-ink-700 bg-ink-900 transition-transform duration-200 hover:-translate-y-1 hover:border-ink-600"
    >
      <div className="relative aspect-video overflow-hidden bg-ink-800">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt=""
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-600">
            <PlayCircle className="h-10 w-10" />
          </div>
        )}

        {isEnrolled && (
          <div className="absolute inset-x-0 bottom-0 h-1 bg-ink-950/60">
            <div
              className="h-full bg-signal-500 transition-[width] duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        )}
      </div>

      <div className="p-4">
        <p className="mb-1 font-mono text-[11px] uppercase tracking-wide text-ink-500">
          {course.instructorName}
        </p>
        <h3 className="line-clamp-2 font-display text-base font-semibold leading-snug text-paper-50">
          {course.title}
        </h3>

        <div className="mt-3 flex items-center justify-between">
          {isEnrolled ? (
            <span className="font-mono text-sm text-signal-500">{progressPercent}% complete</span>
          ) : (
            <span className="font-mono text-sm font-semibold text-paper-50">
              {course.price === 0 ? "Free" : formatPrice(course.price)}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900">
      <div className="aspect-video animate-pulse bg-ink-800" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-ink-800" />
        <div className="h-4 w-4/5 animate-pulse rounded bg-ink-800" />
        <div className="h-4 w-1/4 animate-pulse rounded bg-ink-800" />
      </div>
    </div>
  );
}