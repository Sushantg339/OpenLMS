'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Course, Student, EnrollmentRecord } from '@/types';
import api from '@/lib/api';
import { BookOpen, Users, CreditCard, PlusCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default function AdminOverviewPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [studentCount, setStudentCount] = useState(0);
  const [enrollmentCount, setEnrollmentCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminStats = async () => {
      setLoading(true);
      try {
        const [coursesRes, studentsRes, enrollmentsRes] = await Promise.all([
          api.get('/courses/admin'),
          api.get('/admin/students?limit=1'),
          api.get('/admin/enrollments?limit=1'),
        ]);

        setCourses(coursesRes.data.data || []);
        setStudentCount(studentsRes.data.data?.totalCount || 0);
        setEnrollmentCount(enrollmentsRes.data.data?.totalCount || 0);
      } catch (err) {
        console.error('Error loading admin stats', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminStats();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading analytics metrics...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4 border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
            <BookOpen className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-slate-100">{courses.length}</span>
            <span className="text-xs text-slate-400 font-medium">Total Managed Courses</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-cyan-600/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Users className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-slate-100">{studentCount}</span>
            <span className="text-xs text-slate-400 font-medium">Registered Students</span>
          </div>
        </Card>

        <Card className="flex items-center gap-4 border-slate-800">
          <div className="w-14 h-14 rounded-2xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <CreditCard className="w-7 h-7" />
          </div>
          <div className="flex flex-col">
            <span className="text-3xl font-extrabold text-slate-100">{enrollmentCount}</span>
            <span className="text-xs text-slate-400 font-medium">Total Paid Enrollments</span>
          </div>
        </Card>
      </div>

      {/* Courses Overview Table */}
      <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col gap-4">
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <h3 className="font-bold text-lg text-slate-100">Managed Courses Summary</h3>
          <Link href="/admin/courses">
            <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
              View All
            </Button>
          </Link>
        </div>

        {courses.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/60 uppercase text-[10px] tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="p-3">Course Title</th>
                  <th className="p-3">Instructor</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {courses.slice(0, 5).map((course) => (
                  <tr key={course.id} className="hover:bg-slate-900/40">
                    <td className="p-3 font-semibold text-slate-100">{course.title}</td>
                    <td className="p-3 text-slate-400">{course.instructorName}</td>
                    <td className="p-3 font-bold text-indigo-400">{formatPrice(course.price)}</td>
                    <td className="p-3">
                      {course.isPublished ? (
                        <Badge variant="emerald">Published</Badge>
                      ) : (
                        <Badge variant="amber">Draft</Badge>
                      )}
                    </td>
                    <td className="p-3 text-right">
                      <Link href={`/admin/courses/${course.id}`}>
                        <Button variant="glass" size="sm" className="py-1 px-3">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-slate-500">No courses created yet.</div>
        )}
      </div>
    </div>
  );
}
