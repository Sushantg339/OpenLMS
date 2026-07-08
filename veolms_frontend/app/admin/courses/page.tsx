"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, Pencil, Eye, EyeOff } from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import type { CourseSummary } from "@/types";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/format";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseSummary[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchCourses = async () => {
    try {
      const data = await adminService.listCourses();
      setCourses(data ?? []);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const togglePublish = async (course: CourseSummary) => {
    try {
      await adminService.updateCourse(course.id, { isPublished: !course.isPublished });
      fetchCourses();
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
            Admin
          </p>
          <h1 className="font-display text-2xl font-bold text-paper-50">Courses</h1>
        </div>
        <Button href="/admin/courses/new" size="sm">
          <Plus className="h-4 w-4" /> New course
        </Button>
      </div>

      {courses.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-20 text-center">
          <p className="mb-4 font-mono text-sm text-ink-500">No courses yet.</p>
          <Button href="/admin/courses/new" size="sm">
            <Plus className="h-4 w-4" /> Create your first course
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500">Title</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500 hidden sm:table-cell">Price</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-mono text-xs uppercase text-ink-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {courses.map((course) => (
                <tr key={course.id} className="bg-ink-950 hover:bg-ink-900/60">
                  <td className="px-4 py-3 font-medium text-paper-100">{course.title}</td>
                  <td className="px-4 py-3 font-mono text-paper-200 hidden sm:table-cell">
                    {formatPrice(course.price)}
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-mono text-xs ${
                      course.isPublished
                        ? "bg-teal-500/10 text-teal-400"
                        : "bg-ink-800 text-ink-500"
                    }`}>
                      {course.isPublished ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => togglePublish(course)}
                        className="rounded p-1.5 text-ink-500 transition-colors hover:bg-ink-800 hover:text-paper-200"
                        title={course.isPublished ? "Unpublish" : "Publish"}
                      >
                        {course.isPublished ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                      <Link
                        href={`/admin/courses/${course.id}`}
                        className="rounded p-1.5 text-ink-500 transition-colors hover:bg-ink-800 hover:text-paper-200"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}