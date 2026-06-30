"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/providers";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import type { CourseDetail } from "@/types";

interface EnrollPanelProps {
  course: CourseDetail;
}

export function EnrollPanel({ course }: EnrollPanelProps) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // A simple, honest signal for "already enrolled": every lesson in the
  // curriculum already has hasAccess true. Not perfect for a course with zero
  // lessons yet, but correct for any real course.
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const isEnrolled = allLessons.length > 0 && allLessons.every((l) => l.hasAccess);

  if (isEnrolled) {
    return (
      <div>
        <p className="mb-4 font-mono text-sm text-teal-400">You're enrolled in this course.</p>
        <Button
          onClick={() => {
            const firstLesson = allLessons[0];
            if (firstLesson) router.push(`/learn/${firstLesson.id}`);
          }}
          size="lg"
          className="w-full"
        >
          Continue learning
        </Button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-5 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-bold text-paper-50">
          {course.price === 0 ? "Free" : formatPrice(course.price)}
        </span>
      </div>

      {isAuthenticated ? (
        <Button onClick={() => router.push(`/checkout/${course.slug}`)} size="lg" className="w-full">
          Enroll now
        </Button>
      ) : (
        <Button href={`/login?redirect=/courses/${course.slug}`} size="lg" className="w-full">
          Log in to enroll
        </Button>
      )}

      <p className="mt-4 text-center font-mono text-xs text-ink-500">
        Full lifetime access · Pay once
      </p>
    </div>
  );
}