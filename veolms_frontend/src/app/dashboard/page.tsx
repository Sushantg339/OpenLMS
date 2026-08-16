'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { StudentProgressItem, ContinueLearningItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { PlayCircle, BookOpen, Clock, Award, ArrowRight } from 'lucide-react';

export default function DashboardPage() {
  const { user, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();
  const [myCourses, setMyCourses] = useState<StudentProgressItem[]>([]);
  const [continueItems, setContinueItems] = useState<ContinueLearningItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const fetchDashboardData = async () => {
        setLoading(true);
        try {
          const [coursesRes, continueRes] = await Promise.all([
            api.get('/dashboard/my-courses'),
            api.get('/dashboard/continue-learning'),
          ]);
          setMyCourses(coursesRes.data.data || []);
          setContinueItems(continueRes.data.data || []);
        } catch (err: any) {
          if (err.response?.status === 401) {
            await logout();
            router.push('/login');
          } else {
            console.error('Error fetching dashboard data', err);
          }
        } finally {
          setLoading(false);
        }
      };
      fetchDashboardData();
    }
  }, [user, authLoading, router, logout]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-sm text-slate-400">Loading your learning space...</span>
      </div>
    );
  }

  const latestContinue = continueItems.length > 0 ? continueItems[0] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex flex-col gap-10">
      {/* Welcome Banner */}
      <div className="glass-panel p-8 rounded-3xl border-slate-800 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 relative z-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-400">Student Portal</span>
            <h1 className="text-3xl font-extrabold text-slate-100 mt-1">Welcome back, {user?.name}!</h1>
            <p className="text-xs text-slate-400 mt-1">
              You are enrolled in {myCourses.length} course{myCourses.length === 1 ? '' : 's'}. Keep up the momentum!
            </p>
          </div>
          <Link href="/courses">
            <Button variant="glass" size="md" icon={<BookOpen className="w-4 h-4" />}>
              Explore More Courses
            </Button>
          </Link>
        </div>
      </div>

      {/* Continue Learning Banner */}
      {latestContinue && (
        <div className="glass-panel p-6 rounded-2xl border-indigo-500/30 bg-slate-900/80">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                <PlayCircle className="w-6 h-6" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Continue Watching</span>
                <h3 className="font-bold text-slate-100">{latestContinue.lesson.title}</h3>
                <span className="text-xs text-slate-400">{latestContinue.lesson.section.course.title}</span>
              </div>
            </div>
            <Link href={`/dashboard/learn/${latestContinue.lesson.section.course.slug}`}>
              <Button variant="primary" size="md" icon={<ArrowRight className="w-4 h-4" />}>
                Resume Lesson
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Enrolled Courses Grid */}
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-6 flex items-center gap-2">
          <BookOpen className="w-6 h-6 text-indigo-400" />
          My Enrolled Courses
        </h2>

        {myCourses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((item) => (
              <Card key={item.id} className="flex flex-col justify-between h-full border-slate-800">
                <div className="flex flex-col gap-4">
                  {item.thumbnailUrl && (
                    <div className="w-full h-40 rounded-xl overflow-hidden bg-slate-900">
                      <img src={item.thumbnailUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}

                  <div>
                    <h3 className="font-bold text-lg text-slate-100 line-clamp-1">{item.title}</h3>
                    <span className="text-xs text-slate-400">
                      {item.completedLessons} of {item.totalLessons} lessons completed
                    </span>
                  </div>

                  <ProgressBar progress={item.progressPercent} showLabel />
                </div>

                <div className="pt-4 border-t border-slate-800 mt-4">
                  <Link href={`/dashboard/learn/${item.slug}`}>
                    <Button variant="primary" size="sm" className="w-full">
                      {item.progressPercent > 0 ? 'Continue Learning' : 'Start Course'}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center glass-panel rounded-2xl text-slate-400 flex flex-col items-center gap-4">
            <Award className="w-12 h-12 text-slate-600" />
            <span>You haven&apos;t enrolled in any courses yet.</span>
            <Link href="/courses">
              <Button variant="primary" size="md">
                Browse Course Catalog
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
