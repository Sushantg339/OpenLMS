"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Lock, PlayCircle,
  ChevronDown, Menu, X, Terminal,
} from "lucide-react";
import { courseService } from "@/lib/services/course.service";
import type { LessonVideo, CourseDetail, LessonPublic } from "@/types";
import { VideoPlayer } from "@/components/course/VideoPlayer";
import { Spinner } from "@/components/ui/Spinner";
import { cx } from "@/lib/format";
import { formatDuration } from "@/lib/format";

export default function LearnPage() {
  const params = useParams();
  const router = useRouter();
  const lessonId = params.lessonId as string;

  const [video, setVideo] = useState<LessonVideo & { startAt?: number } | null>(null);
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);

  const allLessons = course?.sections.flatMap((s) => s.lessons) ?? [];
  const currentIndex = allLessons.findIndex((l) => l.id === lessonId);
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : null;
  const nextLesson = currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null;

  // Fetch video URL and course sidebar data together
  useEffect(() => {
    const slug = localStorage.getItem("veolms-current-course-slug");

    const fetchAll = async () => {
      setLoading(true);
      setError("");
      try {
        const [videoData, courseData] = await Promise.all([
          courseService.getLessonVideo(lessonId),
          slug ? courseService.getBySlug(slug) : Promise.resolve(null),
        ]);

        // Try to get saved progress for resume
        let startAt = 0;
        try {
          const prog = await courseService.getProgress?.(lessonId);
          startAt = prog?.watchedSeconds ?? 0;
        } catch {}

        setVideo({ ...videoData, startAt });
        setCourse(courseData);

        // Open the section this lesson belongs to automatically
        if (courseData) {
          const section = courseData.sections.find((s) =>
            s.lessons.some((l) => l.id === lessonId)
          );
          if (section) setOpenSectionId(section.id);
        }
      } catch (err: any) {
        if (err?.status === 403) setError("You are not enrolled in this course.");
        else if (err?.status === 409) setError("This lesson doesn't have a video yet.");
        else setError("Could not load this lesson. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [lessonId]);

  const handleProgress = useCallback(async (watchedSeconds: number) => {
    try {
      await courseService.updateLessonProgress(lessonId, { watchedSeconds });
    } catch {}
  }, [lessonId]);

  const handleComplete = useCallback(async () => {
    try {
      await courseService.updateLessonProgress(lessonId, { watchedSeconds: 0, completed: true });
      setCompletedIds((prev) => new Set([...prev, lessonId]));
    } catch {}
  }, [lessonId]);

  const goToLesson = (lesson: LessonPublic) => {
    if (!lesson.hasAccess) return;
    router.push(`/learn/${lesson.id}`);
    setSidebarOpen(false);
  };

  const goNext = () => { if (nextLesson?.hasAccess) goToLesson(nextLesson); };
  const goPrev = () => { if (prevLesson?.hasAccess) goToLesson(prevLesson); };

  // Keyboard shortcut for prev/next lesson
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) return;
      if (e.shiftKey && e.key === "N") goNext();
      if (e.shiftKey && e.key === "P") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [nextLesson, prevLesson]);

  if (loading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 text-center px-4">
        <Lock className="h-10 w-10 text-ink-600" />
        <p className="font-display text-lg font-semibold text-paper-50">{error}</p>
        <Link href="/dashboard" className="font-mono text-sm text-signal-500 hover:underline">
          Go to dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-64px)] bg-ink-950">
      {/* ── Sidebar overlay (mobile) ──────────────────────────── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-ink-950/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ───────────────────────────────────────────── */}
      <aside
        className={cx(
          "fixed right-0 top-0 z-40 flex h-full w-80 flex-col border-l border-ink-700 bg-ink-900 transition-transform duration-200 lg:relative lg:translate-x-0 lg:pt-0",
          sidebarOpen ? "translate-x-0" : "translate-x-full lg:translate-x-0"
        )}
        style={{ paddingTop: "64px" }}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between border-b border-ink-700 px-4 py-3">
          <div className="flex items-center gap-2 min-w-0">
            <Terminal className="h-4 w-4 shrink-0 text-signal-500" />
            <span className="truncate font-display text-sm font-semibold text-paper-50">
              {course?.title ?? "Course contents"}
            </span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="ml-2 shrink-0 text-ink-500 hover:text-paper-200 lg:hidden">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Progress summary */}
        {course && (
          <div className="border-b border-ink-700 px-4 py-3">
            <div className="mb-1.5 flex justify-between font-mono text-xs text-ink-500">
              <span>{completedIds.size} / {allLessons.length} completed</span>
              <span>{allLessons.length > 0 ? Math.round((completedIds.size / allLessons.length) * 100) : 0}%</span>
            </div>
            <div className="h-1 overflow-hidden rounded-full bg-ink-700">
              <div
                className="h-full bg-signal-500 transition-[width] duration-500"
                style={{ width: `${allLessons.length > 0 ? (completedIds.size / allLessons.length) * 100 : 0}%` }}
              />
            </div>
          </div>
        )}

        {/* Sections & lessons */}
        <div className="flex-1 overflow-y-auto">
          {course?.sections.map((section) => {
            const isOpen = openSectionId === section.id;
            const sectionCompleted = section.lessons.filter((l) => completedIds.has(l.id)).length;

            return (
              <div key={section.id} className="border-b border-ink-700 last:border-b-0">
                <button
                  onClick={() => setOpenSectionId(isOpen ? null : section.id)}
                  className="flex w-full items-start gap-3 px-4 py-3 text-left hover:bg-ink-800/60 transition-colors"
                  aria-expanded={isOpen}
                >
                  <ChevronDown className={cx("mt-0.5 h-4 w-4 shrink-0 text-ink-500 transition-transform", isOpen && "rotate-180")} />
                  <div className="min-w-0">
                    <p className="font-display text-sm font-semibold text-paper-50">{section.title}</p>
                    <p className="font-mono text-[11px] text-ink-500">
                      {sectionCompleted}/{section.lessons.length} · {section.lessons.reduce((s, l) => s + (l.durationSeconds ?? 0), 0) > 0
                        ? formatDuration(section.lessons.reduce((s, l) => s + (l.durationSeconds ?? 0), 0))
                        : "—"}
                    </p>
                  </div>
                </button>

                {isOpen && (
                  <ul>
                    {section.lessons.map((lesson) => {
                      const isActive = lesson.id === lessonId;
                      const isDone = completedIds.has(lesson.id);
                      const locked = !lesson.hasAccess;

                      return (
                        <li key={lesson.id}>
                          <button
                            onClick={() => goToLesson(lesson)}
                            disabled={locked}
                            className={cx(
                              "flex w-full items-start gap-3 px-4 py-3 text-left transition-colors",
                              isActive
                                ? "bg-signal-500/10 border-l-2 border-signal-500"
                                : "hover:bg-ink-800/60 border-l-2 border-transparent",
                              locked && "cursor-not-allowed opacity-40"
                            )}
                          >
                            <div className="mt-0.5 shrink-0">
                              {isDone ? (
                                <CheckCircle className="h-4 w-4 text-teal-500" />
                              ) : locked ? (
                                <Lock className="h-4 w-4 text-ink-600" />
                              ) : isActive ? (
                                <PlayCircle className="h-4 w-4 text-signal-500" />
                              ) : (
                                <div className="h-4 w-4 rounded-full border border-ink-600" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className={cx(
                                "truncate text-sm leading-snug",
                                isActive ? "font-semibold text-paper-50" : "text-paper-200"
                              )}>
                                {lesson.title}
                              </p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="font-mono text-xs text-ink-500">
                                  {formatDuration(lesson.durationSeconds)}
                                </span>
                                {lesson.isPreview && (
                                  <span className="rounded-full border border-teal-500/30 px-1.5 font-mono text-[9px] uppercase text-teal-400">
                                    Free
                                  </span>
                                )}
                              </div>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── Main content ──────────────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-y-auto">
        {/* Mobile header */}
        <div className="flex items-center gap-3 border-b border-ink-700 bg-ink-900 px-4 py-2 lg:hidden">
          <Link href="/dashboard" className="text-ink-500 hover:text-paper-200">
            <Terminal className="h-4 w-4" />
          </Link>
          <p className="flex-1 truncate font-mono text-xs text-ink-500">
            {course?.sections.find((s) => s.lessons.some((l) => l.id === lessonId))?.title ?? ""}
          </p>
          <button onClick={() => setSidebarOpen(true)} className="text-paper-200 hover:text-paper-50">
            <Menu className="h-5 w-5" />
          </button>
        </div>

        {/* Video player */}
        <div className="w-full bg-ink-950">
          {video ? (
            <VideoPlayer
              video={video}
              onProgress={handleProgress}
              onComplete={handleComplete}
              startAt={video.startAt ?? 0}
              onNext={goNext}
              onPrev={goPrev}
              hasNext={!!nextLesson?.hasAccess}
              hasPrev={!!prevLesson?.hasAccess}
            />
          ) : (
            <div className="flex aspect-video items-center justify-center">
              <Spinner className="h-8 w-8" />
            </div>
          )}
        </div>

        {/* Lesson info below video */}
        <div className="px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="mb-1 font-mono text-xs uppercase tracking-wide text-ink-500">
                {course?.sections.find((s) => s.lessons.some((l) => l.id === lessonId))?.title}
              </p>
              <h1 className="font-display text-xl font-bold text-paper-50">
                {allLessons.find((l) => l.id === lessonId)?.title ?? "Lesson"}
              </h1>
            </div>

            <div className="flex shrink-0 gap-2">
              {prevLesson?.hasAccess && (
                <button
                  onClick={goPrev}
                  className="rounded border border-ink-700 px-3 py-1.5 font-mono text-xs text-paper-200 hover:border-ink-600 hover:text-paper-50 transition-colors"
                >
                  ← Prev
                </button>
              )}
              {nextLesson?.hasAccess && (
                <button
                  onClick={goNext}
                  className="rounded bg-signal-500 px-3 py-1.5 font-mono text-xs font-semibold text-ink-950 hover:bg-signal-400 transition-colors"
                >
                  Next →
                </button>
              )}
              {!nextLesson && (
                <span className="rounded border border-teal-500/30 bg-teal-500/10 px-3 py-1.5 font-mono text-xs text-teal-400">
                  🎉 Course complete
                </span>
              )}
            </div>
          </div>

          {/* Keyboard shortcuts reference */}
          <details className="mt-6 rounded-lg border border-ink-700">
            <summary className="cursor-pointer px-4 py-3 font-mono text-xs text-ink-500 hover:text-paper-200 transition-colors">
              Keyboard shortcuts
            </summary>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 px-4 pb-4 pt-2 sm:grid-cols-3">
              {[
                ["Space / K", "Play / Pause"],
                ["← / J", "Back 10s"],
                ["→ / L", "Forward 10s"],
                ["↑ / ↓", "Volume"],
                ["M", "Mute"],
                ["F", "Fullscreen"],
                ["I", "Picture in Picture"],
                ["0–9", "Seek to %"],
                ["< / >", "Speed"],
                ["Shift+N", "Next lesson"],
                ["Shift+P", "Prev lesson"],
              ].map(([key, label]) => (
                <div key={key} className="flex items-center gap-2">
                  <kbd className="rounded bg-ink-800 px-2 py-0.5 font-mono text-xs text-paper-200">
                    {key}
                  </kbd>
                  <span className="font-mono text-xs text-ink-500">{label}</span>
                </div>
              ))}
            </div>
          </details>
        </div>
      </div>
    </div>
  );
}