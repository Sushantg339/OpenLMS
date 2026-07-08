"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api-client";
import { BookOpen, Users, ShieldCheck } from "lucide-react";
import { Spinner } from "@/components/ui/Spinner";

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<{
    totalCourses: number;
    totalStudents: number;
    totalEnrollments: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [coursesRes, studentsRes, enrollmentsRes] = await Promise.all([
          api.get("/courses/admin"),
          api.get("/admin/students?limit=1"),
          api.get("/admin/enrollments?limit=1"),
        ]);
        setStats({
          totalCourses: coursesRes.data.data?.length ?? 0,
          totalStudents: studentsRes.data.data?.totalCount ?? 0,
          totalEnrollments: enrollmentsRes.data.data?.totalCount ?? 0,
        });
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  const cards = [
    { label: "Courses", value: stats?.totalCourses ?? 0, icon: BookOpen, href: "/admin/courses" },
    { label: "Students", value: stats?.totalStudents ?? 0, icon: Users, href: "/admin/students" },
    { label: "Enrollments", value: stats?.totalEnrollments ?? 0, icon: ShieldCheck, href: "/admin/students" },
  ];

  return (
    <div>
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          Admin
        </p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-paper-50">
          Overview
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {cards.map(({ label, value, icon: Icon, href }) => (
          <Link
            key={label}
            href={href}
            className="flex items-center gap-4 rounded-lg border border-ink-700 bg-ink-900 p-5 transition-colors hover:border-ink-600"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded bg-ink-800">
              <Icon className="h-5 w-5 text-signal-500" />
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-paper-50">{value}</p>
              <p className="font-mono text-xs text-ink-500">{label}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}