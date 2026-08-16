'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { Course, Section, Lesson } from '@/types';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { CourseForm } from '@/components/admin/CourseForm';
import { SectionModal } from '@/components/admin/SectionModal';
import { LessonModal } from '@/components/admin/LessonModal';
import { DirectVideoUploader } from '@/components/admin/DirectVideoUploader';
import api from '@/lib/api';
import { ArrowLeft, Plus, Edit, Trash2, Layers, Video, Film, Image as ImageIcon, PlayCircle } from 'lucide-react';

export default function AdminCourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);

  // Section Modal State
  const [isSectionModalOpen, setIsSectionModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  // Lesson Modal State
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  // Video Upload Target Lesson ID State
  const [selectedLessonForVideo, setSelectedLessonForVideo] = useState<Lesson | null>(null);

  const fetchCourseData = async () => {
    try {
      const res = await api.get(`/courses/admin/${id}`);
      setCourse(res.data.data);
    } catch (err) {
      console.error('Error fetching admin course details', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourseData();
  }, [id]);

  const handleUpdateCourseDetails = async (data: any) => {
    try {
      await api.patch(`/courses/${id}`, data);
      await fetchCourseData();
    } catch (err: any) {
      throw err;
    }
  };

  // Section Handlers
  const handleSaveSection = async (title: string, orderIndex: number) => {
    if (editingSection) {
      await api.patch(`/sections/${editingSection.id}`, { title, orderIndex });
    } else {
      await api.post(`/courses/${id}/sections`, { title, orderIndex });
    }
    await fetchCourseData();
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Are you sure you want to delete this section?')) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      await fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting section');
    }
  };

  // Lesson Handlers
  const handleSaveLesson = async (data: { title: string; orderIndex: number; isPreview: boolean; videoUrl?: string }) => {
    if (editingLesson) {
      await api.patch(`/lessons/${editingLesson.id}`, data);
    } else if (targetSectionId) {
      await api.post(`/sections/${targetSectionId}/lessons`, data);
    }
    await fetchCourseData();
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Are you sure you want to delete this lesson?')) return;
    try {
      await api.delete(`/lessons/${lessonId}`);
      await fetchCourseData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting lesson');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        <div className="w-10 h-10 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        Loading course editor...
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center text-slate-400">
        Course not found.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Top Header */}
      <div className="flex justify-between items-center pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/admin/courses" className="text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold text-slate-100">{course.title}</h1>
              {course.isPublished ? <Badge variant="emerald">Published</Badge> : <Badge variant="amber">Draft</Badge>}
            </div>
            <span className="text-xs text-slate-400">Slug: /{course.slug}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Section & Lesson Curriculum Builder */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <h2 className="text-xl font-bold text-slate-100">Curriculum Sections & Lessons</h2>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Plus className="w-4 h-4" />}
              onClick={() => {
                setEditingSection(null);
                setIsSectionModalOpen(true);
              }}
            >
              Add Section
            </Button>
          </div>

          {/* Sections List */}
          <div className="flex flex-col gap-6">
            {course.sections && course.sections.length > 0 ? (
              course.sections.map((section, sIdx) => (
                <div key={section.id} className="glass-panel p-5 rounded-2xl border-slate-800 flex flex-col gap-4">
                  {/* Section Bar */}
                  <div className="flex justify-between items-center pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
                        {sIdx + 1}
                      </span>
                      <span className="font-bold text-slate-100">{section.title}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Edit className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setEditingSection(section);
                          setIsSectionModalOpen(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        icon={<Trash2 className="w-3.5 h-3.5" />}
                        onClick={() => handleDeleteSection(section.id)}
                      >
                        Delete
                      </Button>
                      <Button
                        variant="glass"
                        size="sm"
                        icon={<Plus className="w-3.5 h-3.5" />}
                        onClick={() => {
                          setTargetSectionId(section.id);
                          setEditingLesson(null);
                          setIsLessonModalOpen(true);
                        }}
                      >
                        Add Lesson
                      </Button>
                    </div>
                  </div>

                  {/* Lessons inside Section */}
                  <div className="flex flex-col gap-2">
                    {section.lessons && section.lessons.length > 0 ? (
                      section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          className="glass-panel p-3.5 rounded-xl border-slate-800/60 bg-slate-950/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"
                        >
                          <div className="flex items-center gap-3">
                            <PlayCircle className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-200">{lesson.title}</span>
                            {lesson.isPreview && <Badge variant="cyan">Free Preview</Badge>}
                            <Badge variant={lesson.status === 'READY' ? 'emerald' : 'amber'}>
                              {lesson.status}
                            </Badge>
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <Button
                              variant="glass"
                              size="sm"
                              icon={<Video className="w-3.5 h-3.5 text-indigo-400" />}
                              onClick={() => setSelectedLessonForVideo(lesson)}
                              className="text-xs py-1 px-2.5"
                            >
                              Upload Video
                            </Button>

                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Edit className="w-3.5 h-3.5" />}
                              onClick={() => {
                                setEditingLesson(lesson);
                                setIsLessonModalOpen(true);
                              }}
                            />
                            <Button
                              variant="ghost"
                              size="sm"
                              icon={<Trash2 className="w-3.5 h-3.5 text-rose-400" />}
                              onClick={() => handleDeleteLesson(lesson.id)}
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-xs text-slate-500 text-center">No lessons in this section.</div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center glass-panel rounded-2xl text-slate-400">
                No sections added yet. Click &quot;Add Section&quot; above to create curriculum sections.
              </div>
            )}
          </div>
        </div>

        {/* Right 1 Col: Course Settings & Media Assets Uploaders */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Presigned Direct Video Uploader Modal / Section */}
          {selectedLessonForVideo && (
            <Card className="border-indigo-500/40 bg-indigo-950/20 p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-indigo-300">
                  Upload Presigned Video for: {selectedLessonForVideo.title}
                </span>
                <button
                  onClick={() => setSelectedLessonForVideo(null)}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  ✕ Close
                </button>
              </div>

              <DirectVideoUploader
                entityId={selectedLessonForVideo.id}
                type="lesson-video"
                onSuccess={() => {
                  fetchCourseData();
                  setSelectedLessonForVideo(null);
                }}
              />
            </Card>
          )}

          {/* Media Assets (Thumbnail & Trailer Uploads) */}
          <Card className="border-slate-800 p-5 flex flex-col gap-4">
            <h3 className="font-bold text-sm text-slate-200">Course Media Assets</h3>

            <DirectVideoUploader
              entityId={course.id}
              type="course-thumbnail"
              label="Upload Thumbnail Image"
              onSuccess={fetchCourseData}
            />

            <DirectVideoUploader
              entityId={course.id}
              type="course-trailer"
              label="Upload Trailer Video"
              onSuccess={fetchCourseData}
            />
          </Card>

          {/* Course Metadata Form */}
          <Card className="border-slate-800 p-5">
            <h3 className="font-bold text-sm text-slate-200 mb-4">Edit Course Settings</h3>
            <CourseForm initialValues={course} onSubmit={handleUpdateCourseDetails} />
          </Card>
        </div>
      </div>

      {/* Section Modal */}
      <SectionModal
        isOpen={isSectionModalOpen}
        onClose={() => setIsSectionModalOpen(false)}
        onSubmit={handleSaveSection}
        initialData={editingSection}
        defaultOrderIndex={(course.sections?.length || 0) + 1}
      />

      {/* Lesson Modal */}
      <LessonModal
        isOpen={isLessonModalOpen}
        onClose={() => setIsLessonModalOpen(false)}
        onSubmit={handleSaveLesson}
        initialData={editingLesson}
      />
    </div>
  );
}
