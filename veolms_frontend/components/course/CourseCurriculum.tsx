"use client";

import { useState } from "react";
import { ChevronDown, Lock, PlayCircle } from "lucide-react";
import type { SectionPublic } from "@/types";
import { formatDuration } from "@/lib/format";
import { useRouter } from "next/navigation";

interface CourseCurriculumProps {
  sections: SectionPublic[];
  courseSlug: string;
}

export function CourseCurriculum({ sections }: CourseCurriculumProps) {
  const [openSectionId, setOpenSectionId] = useState<string | null>(sections[0]?.id ?? null);
  const router = useRouter();

  const handleLessonClick = (lessonId: string, hasAccess: boolean) => {
    if (!hasAccess) return; // locked lessons aren't clickable
    router.push(`/learn/${lessonId}`);
  };

  return (
    <div className="overflow-hidden rounded-lg border border-ink-700">
      {sections.map((section) => {
        const isOpen = openSectionId === section.id;

        return (
          <div key={section.id} className="border-b border-ink-700 last:border-b-0">
            <button
              onClick={() => setOpenSectionId(isOpen ? null : section.id)}
              className="flex w-full items-center justify-between bg-ink-900 px-5 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="font-display font-semibold text-paper-50">{section.title}</span>
              <ChevronDown
                className={`h-4 w-4 text-ink-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <ul className="bg-ink-950">
                {section.lessons.map((lesson) => (
                  <li key={lesson.id} className="border-t border-ink-800 first:border-t-0">
                    <button
                      onClick={() => handleLessonClick(lesson.id, lesson.hasAccess)}
                      disabled={!lesson.hasAccess}
                      className="flex w-full items-center justify-between gap-4 px-5 py-3.5 text-left transition-colors enabled:hover:bg-ink-900 disabled:cursor-not-allowed"
                    >
                      <span className="flex items-center gap-3">
                        {lesson.hasAccess ? (
                          <PlayCircle className="h-4 w-4 shrink-0 text-signal-500" />
                        ) : (
                          <Lock className="h-4 w-4 shrink-0 text-ink-600" />
                        )}
                        <span className={lesson.hasAccess ? "text-paper-200" : "text-ink-600"}>
                          {lesson.title}
                        </span>
                        {lesson.isPreview && (
                          <span className="rounded-full border border-teal-500/40 px-2 py-0.5 font-mono text-[10px] uppercase text-teal-400">
                            Preview
                          </span>
                        )}
                      </span>
                      <span className="shrink-0 font-mono text-xs text-ink-500">
                        {formatDuration(lesson.durationSeconds)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}