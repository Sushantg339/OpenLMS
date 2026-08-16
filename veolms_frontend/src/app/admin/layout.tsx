'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Shield, BookOpen, Users, CreditCard, PlusCircle, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (!user || user.role !== 'ADMIN') {
        router.push('/login');
      }
    }
  }, [user, isLoading, router]);

  if (isLoading || !user || user.role !== 'ADMIN') {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-sm text-slate-400">Verifying Admin Credentials...</span>
      </div>
    );
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-8">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100">Admin Control Center</h1>
            <p className="text-xs text-slate-400">Manage courses, section curriculum, video uploads & students</p>
          </div>
        </div>

        <Link href="/admin/courses/new">
          <Button variant="primary" size="md" icon={<PlusCircle className="w-4 h-4" />}>
            Create New Course
          </Button>
        </Link>
      </div>

      {/* Admin Sub-Nav Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        <Link
          href="/admin"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive('/admin')
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Overview
        </Link>

        <Link
          href="/admin/courses"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive('/admin/courses')
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          All Courses
        </Link>

        <Link
          href="/admin/students"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive('/admin/students')
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          Students
        </Link>

        <Link
          href="/admin/enrollments"
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            isActive('/admin/enrollments')
              ? 'bg-purple-600/20 text-purple-300 border border-purple-500/30'
              : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Enrollments Ledger
        </Link>
      </div>

      <div>{children}</div>
    </div>
  );
}
