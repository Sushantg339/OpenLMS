"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import { Spinner } from "@/components/ui/Spinner";

interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrolledCourseCount: number;
}

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (s?: string) => {
    setLoading(true);
    try {
      const data = await adminService.listStudents({ limit: 20, search: s });
      setStudents(data?.students ?? []);
      setTotalCount(data?.totalCount ?? 0);
    } catch {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStudents(); }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents(search);
  };

  return (
    <div>
      <div className="mb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          Admin
        </p>
        <h1 className="font-display text-2xl font-bold text-paper-50">
          Students
          <span className="ml-3 font-mono text-base font-normal text-ink-500">
            {totalCount} total
          </span>
        </h1>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6 max-w-sm">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-500" />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full rounded border border-ink-700 bg-ink-900 py-2 pl-9 pr-4 text-sm text-paper-100 placeholder:text-ink-600 focus:border-signal-500 focus:outline-none"
        />
      </form>

      {loading ? (
        <div className="flex min-h-[30vh] items-center justify-center">
          <Spinner className="h-8 w-8" />
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-lg border border-dashed border-ink-700 py-16 text-center">
          <p className="font-mono text-sm text-ink-500">No students found.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-ink-700">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-ink-700 bg-ink-900">
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500">Name</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500 hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500">Enrollments</th>
                <th className="px-4 py-3 text-left font-mono text-xs uppercase text-ink-500 hidden md:table-cell">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-800">
              {students.map((student) => (
                <tr key={student.id} className="bg-ink-950 hover:bg-ink-900/60">
                  <td className="px-4 py-3">
                    <Link href={`/admin/students/${student.id}`} className="font-medium text-paper-100 hover:text-signal-500">
                      {student.name}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-paper-200 hidden sm:table-cell">{student.email}</td>
                  <td className="px-4 py-3 font-mono text-paper-200">{student.enrolledCourseCount}</td>
                  <td className="px-4 py-3 font-mono text-xs text-ink-500 hidden md:table-cell">
                    {new Date(student.createdAt).toLocaleDateString("en-IN")}
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