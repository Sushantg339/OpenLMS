'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Lesson, Section } from '@/types';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { ArrowLeft, PlayCircle, CheckCircle2, Lock, ChevronRight, BookOpen, Layers } from 'lucide-react';

export default function StudentLearningPortalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { user, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [course, setCourse] = useState<Course | null>(null);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [videoLoading, setVideoLoading] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [videoType, setVideoType] = useState<"external" | "hls" | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    const loadPortal = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${slug}`);
        const courseData: Course = res.data.data;
        setCourse(courseData);

        // Find first lesson to auto-play
        if (courseData.sections && courseData.sections.length > 0) {
          const firstSection = courseData.sections[0];
          if (firstSection.lessons && firstSection.lessons.length > 0) {
            selectLesson(firstSection.lessons[0]);
          }
        }
      } catch (err) {
        console.error('Error loading course portal', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadPortal();
    }
  }, [slug, user, authLoading, router]);

  const selectLesson = async (lesson: Lesson) => {
    setActiveLesson(lesson);
    setActiveVideoUrl(null);
    setVideoType(null);

    try {
      const res = await api.get(
        `/lessons/${lesson.id}/video`
      );

      setActiveVideoUrl(
        res.data.data.videoUrl
      );

      setVideoType(
        res.data.data.type
      );

      const progRes = await api.get(
        `/lessons/${lesson.id}/progress`
      );

      if (progRes.data.data?.completed) {
        setCompletedLessons((prev) => {
          const next = new Set(prev);
          next.add(lesson.id);
          return next;
        });
      }
    } catch (err) {
      console.warn(
        'Playback URL fetch warning',
        err
      );

      setActiveVideoUrl(null);
      setVideoType(null);
    }
  };

  const handleVideoEnded = () => {
    if (activeLesson) {
      setCompletedLessons((prev) => new Set(prev).add(activeLesson.id));
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-sm text-slate-400">Loading Learning Portal...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-200">Course Not Found</h2>
        <Link href="/dashboard" className="mt-4 inline-block">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col bg-[#080C14]">
      {/* Top Breadcrumb Bar */}
      <div className="border-b border-slate-800/80 px-6 py-3 bg-slate-950/60 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">
            Learning Portal
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-sm font-bold text-slate-100 line-clamp-1">{course.title}</span>
        </div>
      </div>

      {/* Main Learning Portal Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 overflow-hidden">
        {/* Left 3 Cols: Video Player & Active Lesson Info */}
        <div className="lg:col-span-3 p-6 flex flex-col gap-6 overflow-y-auto">
          <VideoPlayer
            lessonId={activeLesson?.id}
            videoUrl={activeVideoUrl}
            videoType={videoType}
            title={activeLesson?.title}
            onEnded={handleVideoEnded}
            autoPlay
          />

          <div className="glass-panel p-6 rounded-2xl border-slate-800 flex flex-col gap-3">
            <div className="flex justify-between items-center">
              <Badge variant="indigo">Lesson {activeLesson?.orderIndex || 1}</Badge>
              {completedLessons.has(activeLesson?.id || '') && (
                <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  Completed
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold text-slate-100">{activeLesson?.title || 'Select a lesson to start'}</h1>
            <p className="text-xs text-slate-400">
              Instructor: <strong className="text-slate-200">{course.instructorName}</strong>
            </p>
          </div>
        </div>

        {/* Right 1 Col: Curriculum Navigation Sidebar */}
        <div className="lg:col-span-1 border-l border-slate-800/80 bg-slate-950/40 p-4 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Layers className="w-4 h-4 text-indigo-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Course Curriculum</span>
          </div>

          <div className="flex flex-col gap-4">
            {course.sections?.map((section, sIdx) => (
              <div key={section.id} className="flex flex-col gap-1.5">
                <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">
                  Section {sIdx + 1}: {section.title}
                </span>

                <div className="flex flex-col gap-1">
                  {section.lessons?.map((lesson) => {
                    const isActive = lesson.id === activeLesson?.id;
                    const isDone = completedLessons.has(lesson.id);

                    return (
                      <button
                        key={lesson.id}
                        onClick={() => selectLesson(lesson)}
                        className={`w-full p-3 rounded-xl text-left flex items-center justify-between text-xs transition-all ${
                          isActive
                            ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 font-semibold'
                            : 'hover:bg-slate-900/60 text-slate-300 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 line-clamp-1">
                          {isDone ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
