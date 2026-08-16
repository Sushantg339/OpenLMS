'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { CourseCard } from '@/components/courses/CourseCard';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { PlusCircle, BookOpen } from 'lucide-react';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminCourses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/courses/admin');
      setCourses(res.data.data || []);
    } catch (err) {
      console.error('Error fetching admin courses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminCourses();
  }, []);

  const handleUnpublish = async (id: string) => {
    try {
      await api.delete(`/courses/${id}`);
      fetchAdminCourses();
    } catch (err) {
      console.error('Error unpublishing course', err);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Managed Courses</h2>
          <p className="text-xs text-slate-400">View, update curriculum, upload video assets, or adjust publication status.</p>
        </div>

        <Link href="/admin/courses/new">
          <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            New Course
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((idx) => (
            <div key={idx} className="glass-panel h-80 rounded-2xl animate-pulse bg-slate-900/50" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdminView
              onDelete={handleUnpublish}
            />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 flex flex-col items-center gap-4">
          <BookOpen className="w-12 h-12 text-slate-600" />
          <span>No courses created yet. Click above to create your first course.</span>
        </div>
      )}
    </div>
  );
}
