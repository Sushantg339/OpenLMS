'use client';

import React, { useState } from 'react';
import { Section, Lesson } from '@/types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatDuration } from '@/lib/utils';
import { ChevronDown, PlayCircle, Lock, CheckCircle2, Video, FileText } from 'lucide-react';

interface CurriculumAccordionProps {
  sections: Section[];
  onSelectPreviewLesson?: (lesson: Lesson) => void;
  activeLessonId?: string;
  isEnrolled?: boolean;
}

export const CurriculumAccordion: React.FC<CurriculumAccordionProps> = ({
  sections,
  onSelectPreviewLesson,
  activeLessonId,
  isEnrolled = false,
}) => {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    // Open first section by default
    const initial: Record<string, boolean> = {};
    if (sections && sections.length > 0) {
      initial[sections[0].id] = true;
    }
    return initial;
  });

  const toggleSection = (id: string) => {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!sections || sections.length === 0) {
    return (
      <div className="p-8 text-center glass-panel rounded-2xl text-slate-400">
        No curriculum sections available yet.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {sections.map((section, idx) => {
        const isOpen = openSections[section.id];
        return (
          <div
            key={section.id}
            className="glass-panel rounded-xl overflow-hidden border-slate-800/80 transition-colors"
          >
            {/* Section Header */}
            <button
              onClick={() => toggleSection(section.id)}
              className="w-full px-5 py-4 flex items-center justify-between bg-slate-900/60 hover:bg-slate-800/40 transition-colors text-left"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                  {idx + 1}
                </span>
                <span className="font-semibold text-slate-100">{section.title}</span>
                <span className="text-xs text-slate-500">
                  ({section.lessons?.length || 0} lessons)
                </span>
              </div>
              <ChevronDown
                className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${
                  isOpen ? 'rotate-180 text-indigo-400' : ''
                }`}
              />
            </button>

            {/* Lessons List */}
            {isOpen && (
              <div className="divide-y divide-slate-800/60 bg-slate-950/40">
                {section.lessons && section.lessons.length > 0 ? (
                  section.lessons.map((lesson) => {
                    const isAccessible = lesson.isPreview || lesson.hasAccess || isEnrolled;
                    const isActive = lesson.id === activeLessonId;

                    return (
                      <div
                        key={lesson.id}
                        className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                          isActive
                            ? 'bg-indigo-950/50 border-l-4 border-indigo-500'
                            : 'hover:bg-slate-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {isAccessible ? (
                            <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                          ) : (
                            <Lock className="w-4 h-4 text-slate-500 flex-shrink-0" />
                          )}
                          <span
                            className={`text-sm font-medium ${
                              isActive ? 'text-indigo-300 font-semibold' : 'text-slate-300'
                            }`}
                          >
                            {lesson.title}
                          </span>
                        </div>

                        <div className="flex items-center gap-3">
                          {lesson.durationSeconds && (
                            <span className="text-xs text-slate-500">
                              {formatDuration(lesson.durationSeconds)}
                            </span>
                          )}

                          {lesson.isPreview && (
                            <Badge variant="cyan" className="cursor-pointer">
                              Preview
                            </Badge>
                          )}

                          {onSelectPreviewLesson && (isAccessible || lesson.isPreview) && (
                            <Button
                              variant="glass"
                              size="sm"
                              onClick={() => onSelectPreviewLesson(lesson)}
                              className="text-xs py-1 px-2.5"
                            >
                              Watch
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 text-xs text-slate-500 text-center">
                    No lessons in this section yet.
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
