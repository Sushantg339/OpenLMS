'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Course } from '@/types';
import { CourseCard } from '@/components/courses/CourseCard';
import { Input } from '@/components/ui/Input';
import api from '@/lib/api';
import { gsap } from '@/lib/gsap';
import { Search, BookOpen, SlidersHorizontal } from 'lucide-react';

export default function CoursesCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const gridRef = useRef<HTMLDivElement>(null);

  const fetchCourses = async (searchTerm = '') => {
    setLoading(true);
    try {
      const res = await api.get(`/courses?search=${encodeURIComponent(searchTerm)}&limit=20`);
      const courseList = res.data.data || [];
      setCourses(courseList);
    } catch (err) {
      console.error('Error fetching course catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCourses(search);
  };

  useEffect(() => {
    if (!loading && gridRef.current && courses.length > 0) {
      gsap.fromTo(
        gridRef.current.children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, ease: 'power2.out' }
      );
    }
  }, [loading, courses]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Catalog Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-3">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Course Directory</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">Explore All Courses</h1>
          <p className="text-sm text-slate-400 mt-1">Discover expert-crafted curriculum to advance your career.</p>
        </div>

        {/* Search Bar Form */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input rounded-xl pl-10 pr-4 py-2.5 text-sm w-full focus:outline-none"
            />
          </div>
        </form>
      </div>

      {/* Grid Content */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div key={idx} className="glass-panel h-80 rounded-2xl animate-pulse bg-slate-900/50" />
          ))}
        </div>
      ) : courses.length > 0 ? (
        <div ref={gridRef} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        <div className="p-12 text-center glass-panel rounded-2xl text-slate-400">
          No courses matching &quot;{search}&quot; found.
        </div>
      )}
    </div>
  );
}
