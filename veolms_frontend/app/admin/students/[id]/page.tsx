"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/format";

interface StudentDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrollments: {
    enrolledAt: string;
    course: { id: string; title: string; slug: string };
    payment: { amount: number; status: string; provider: string; createdAt: string };
  }[];
}

export default function AdminStudentDetailPage() {
  const { id } = useParams();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminService.getStudent(id as string)
      .then(setStudent)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-sm text-ink-500">Student not found.</p>
        <Link href="/admin/students" className="mt-4 inline-flex items-center gap-2 font-mono text-sm text-signal-500">
          <ArrowLeft className="h-4 w-4" /> Back to students
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <Link href="/admin/students" className="mb-6 inline-flex items-center gap-2 font-mono text-sm text-ink-500 hover:text-paper-200">
        <ArrowLeft className="h-4 w-4" /> All students
      </Link>

      <div className="mb-6 rounded-lg border border-ink-700 bg-ink-900 p-5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-signal-500 font-display text-xl font-bold text-ink-950">
          {student.name.charAt(0).toUpperCase()}
        </div>
        <h1 className="mt-3 font-display text-2xl font-bold text-paper-50">{student.name}</h1>
        <p className="font-mono text-sm text-ink-500">{student.email}</p>
        <p className="mt-1 font-mono text-xs text-ink-600">
          Joined {new Date(student.createdAt).toLocaleDateString("en-IN")}
        </p>
      </div>

      <h2 className="mb-4 font-display text-lg font-semibold text-paper-50">
        Enrollments ({student.enrollments.length})
      </h2>

      {student.enrollments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-10 text-center">
          <p className="font-mono text-sm text-ink-500">Not enrolled in any courses yet.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {student.enrollments.map((enrollment, i) => (
            <div key={i} className="rounded-lg border border-ink-700 bg-ink-900 p-4">
              <div className="flex items-start justify-between">
                <div>
                  <Link
                    href={`/courses/${enrollment.course.slug}`}
                    className="font-display font-semibold text-paper-50 hover:text-signal-500"
                  >
                    {enrollment.course.title}
                  </Link>
                  <p className="mt-1 font-mono text-xs text-ink-500">
                    Enrolled {new Date(enrollment.enrolledAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold text-paper-50">
                    {formatPrice(enrollment.payment.amount)}
                  </p>
                  <span className={`mt-1 inline-block rounded-full px-2 py-0.5 font-mono text-xs ${
                    enrollment.payment.status === "PAID"
                      ? "bg-teal-500/10 text-teal-400"
                      : "bg-danger-500/10 text-danger-400"
                  }`}>
                    {enrollment.payment.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}