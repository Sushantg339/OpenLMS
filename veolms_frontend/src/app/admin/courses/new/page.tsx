'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { CourseForm } from '@/components/admin/CourseForm';
import api from '@/lib/api';
import { BookOpen } from 'lucide-react';

export default function NewCoursePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreateCourse = async (data: any) => {
    setLoading(true);
    try {
      const res = await api.post('/courses', data);
      const newCourse = res.data.data;
      router.push(`/admin/courses/${newCourse.id}`);
    } catch (err: any) {
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
          <BookOpen className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-2xl font-extrabold text-slate-100">Create New Course</h2>
          <p className="text-xs text-slate-400">Fill in details. You can add sections, lessons, and videos after creation.</p>
        </div>
      </div>

      <Card className="border-slate-800 p-8 shadow-2xl">
        <CourseForm onSubmit={handleCreateCourse} isLoading={loading} />
      </Card>
    </div>
  );
}
