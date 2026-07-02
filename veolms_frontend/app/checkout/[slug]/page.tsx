import { notFound, redirect } from "next/navigation";
import { serverFetch } from "@/lib/server-fetch";
import type { CourseDetail } from "@/types";
import { CheckoutClient } from "@/components/course/CheckoutClient";

interface CheckoutPageProps {
  params: { slug: string };
}

export default async function CheckoutPage({ params }: CheckoutPageProps) {
  const course = await serverFetch<CourseDetail>(`/courses/${params.slug}`, { revalidate: 0 });

  if (!course) notFound();

  // If every lesson is already accessible, the user is already enrolled —
  // redirect them straight to learning instead of showing payment again.
  const allLessons = course.sections.flatMap((s) => s.lessons);
  const alreadyEnrolled = allLessons.length > 0 && allLessons.every((l) => l.hasAccess);
  if (alreadyEnrolled) redirect(`/courses/${params.slug}`);

  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center py-16">
      <CheckoutClient course={course} />
    </div>
  );
}