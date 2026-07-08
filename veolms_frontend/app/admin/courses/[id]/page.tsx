"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { Plus, Trash2, Upload, ExternalLink, ChevronDown } from "lucide-react";
import { adminService } from "@/lib/services/admin.service";
import type { CourseAdminDetail, SectionAdmin, LessonAdmin } from "@/types";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { formatPrice } from "@/lib/format";
import { ApiRequestError } from "@/lib/api-client";
import { cx } from "@/lib/format";

export default function AdminCourseEditPage() {
  const { id } = useParams();
  const courseId = id as string;

  const [course, setCourse] = useState<CourseAdminDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openSectionId, setOpenSectionId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const thumbnailRef = useRef<HTMLInputElement>(null);
  const trailerRef = useRef<HTMLInputElement>(null);

  const fetchCourse = async () => {
    try {
      const data = await adminService.getCourseById(courseId);
      setCourse(data);
      if (data?.sections[0]) setOpenSectionId(data.sections[0].id);
    } catch {
      setError("Failed to load course.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourse(); }, [courseId]);

  const showSuccess = (msg: string) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(""), 3000);
  };

  // --- Course-level actions ---
  const handleTogglePublish = async () => {
    if (!course) return;
    setSaving(true);
    try {
      await adminService.updateCourse(courseId, { isPublished: !course.isPublished });
      fetchCourse();
      showSuccess(course.isPublished ? "Course unpublished." : "Course published!");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      await adminService.uploadThumbnail(courseId, file);
      fetchCourse();
      showSuccess("Thumbnail updated.");
    } catch {
      setError("Thumbnail upload failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleTrailerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setSaving(true);
    try {
      await adminService.uploadTrailer(courseId, file);
      fetchCourse();
      showSuccess("Trailer uploaded.");
    } catch {
      setError("Trailer upload failed.");
    } finally {
      setSaving(false);
    }
  };

  // --- Section actions ---
  const handleAddSection = async () => {
    if (!course) return;
    const title = prompt("Section title:");
    if (!title?.trim()) return;
    setSaving(true);
    try {
      await adminService.createSection(courseId, {
        title: title.trim(),
        orderIndex: course.sections.length,
      });
      fetchCourse();
      showSuccess("Section added.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm("Delete this section and all its lessons?")) return;
    setSaving(true);
    try {
      await adminService.deleteSection(sectionId);
      fetchCourse();
      showSuccess("Section deleted.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  };

  // --- Lesson actions ---
  const handleAddLesson = async (section: SectionAdmin) => {
    const title = prompt("Lesson title:");
    if (!title?.trim()) return;
    const videoUrl = prompt("YouTube URL (leave blank to upload a file later):");
    setSaving(true);
    try {
      await adminService.createLesson(section.id, {
        title: title.trim(),
        orderIndex: section.lessons.length,
        ...(videoUrl?.trim() && { videoUrl: videoUrl.trim() }),
      });
      fetchCourse();
      showSuccess("Lesson added.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePreview = async (lesson: LessonAdmin) => {
    setSaving(true);
    try {
      await adminService.updateLesson(lesson.id, { isPreview: !lesson.isPreview });
      fetchCourse();
    } catch {
      setError("Failed to update lesson.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm("Delete this lesson?")) return;
    setSaving(true);
    try {
      await adminService.deleteLesson(lessonId);
      fetchCourse();
      showSuccess("Lesson deleted.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Failed.");
    } finally {
      setSaving(false);
    }
  };

  const handleVideoUpload = async (lesson: LessonAdmin, file: File) => {
    setSaving(true);
    try {
      const { uploadUrl, key } = await adminService.requestUploadUrl(lesson.id, {
        fileName: file.name,
        contentType: file.type,
      });

      // Upload directly to R2 — file never goes through your Express server
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      if (!uploadRes.ok) throw new Error("Upload to storage failed.");

      await adminService.confirmUpload(lesson.id);
      fetchCourse();
      showSuccess("Video uploaded successfully.");
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : "Upload failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <p className="font-mono text-sm text-ink-500">{error || "Course not found."}</p>
        <Button href="/admin/courses" variant="ghost" className="mt-4">
          ← Back to courses
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
            Admin · Courses
          </p>
          <h1 className="font-display text-2xl font-bold text-paper-50">{course.title}</h1>
          <p className="mt-1 font-mono text-sm text-ink-500">
            {formatPrice(course.price)} ·{" "}
            <span className={course.isPublished ? "text-teal-400" : "text-ink-500"}>
              {course.isPublished ? "Published" : "Draft"}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button
            onClick={handleTogglePublish}
            variant={course.isPublished ? "secondary" : "primary"}
            size="sm"
            disabled={saving}
          >
            {course.isPublished ? "Unpublish" : "Publish"}
          </Button>
          <Button href={`/courses/${course.slug}`} variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <p className="mb-4 rounded border border-danger-500/30 bg-danger-500/10 px-3 py-2 font-mono text-xs text-danger-400">
          {error}
        </p>
      )}
      {success && (
        <p className="mb-4 rounded border border-teal-500/30 bg-teal-500/10 px-3 py-2 font-mono text-xs text-teal-400">
          {success}
        </p>
      )}

      {/* Media uploads */}
      <div className="mb-8 grid grid-cols-2 gap-4">
        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-500">Thumbnail</p>
          <div
            onClick={() => thumbnailRef.current?.click()}
            className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-700 bg-ink-900 transition-colors hover:border-ink-600"
          >
            {course.thumbnailUrl ? (
              <img src={course.thumbnailUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-600">
                <Upload className="h-6 w-6" />
                <span className="font-mono text-xs">Click to upload</span>
              </div>
            )}
          </div>
          <input ref={thumbnailRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleThumbnailUpload} />
        </div>

        <div>
          <p className="mb-2 font-mono text-xs uppercase tracking-wide text-ink-500">Trailer</p>
          <div
            onClick={() => trailerRef.current?.click()}
            className="flex aspect-video cursor-pointer items-center justify-center overflow-hidden rounded-lg border border-dashed border-ink-700 bg-ink-900 transition-colors hover:border-ink-600"
          >
            {course.trailerVideoUrl ? (
              <video src={course.trailerVideoUrl} className="h-full w-full object-cover" muted />
            ) : (
              <div className="flex flex-col items-center gap-2 text-ink-600">
                <Upload className="h-6 w-6" />
                <span className="font-mono text-xs">Click to upload</span>
              </div>
            )}
          </div>
          <input ref={trailerRef} type="file" accept="video/mp4,video/webm" className="hidden" onChange={handleTrailerUpload} />
        </div>
      </div>

      {/* Sections & lessons */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold text-paper-50">Curriculum</h2>
        <Button onClick={handleAddSection} variant="secondary" size="sm" disabled={saving}>
          <Plus className="h-4 w-4" /> Add section
        </Button>
      </div>

      <div className="overflow-hidden rounded-lg border border-ink-700">
        {course.sections.length === 0 ? (
          <div className="py-12 text-center">
            <p className="font-mono text-sm text-ink-500">No sections yet.</p>
          </div>
        ) : (
          course.sections.map((section) => {
            const isOpen = openSectionId === section.id;
            return (
              <div key={section.id} className="border-b border-ink-700 last:border-b-0">
                <div className="flex items-center justify-between bg-ink-900 px-4 py-3">
                  <button
                    onClick={() => setOpenSectionId(isOpen ? null : section.id)}
                    className="flex flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown className={cx("h-4 w-4 text-ink-500 transition-transform", isOpen && "rotate-180")} />
                    <span className="font-display font-semibold text-paper-50">{section.title}</span>
                    <span className="font-mono text-xs text-ink-500">
                      {section.lessons.length} lesson{section.lessons.length !== 1 ? "s" : ""}
                    </span>
                  </button>
                  <button onClick={() => handleDeleteSection(section.id)} className="rounded p-1.5 text-ink-600 hover:bg-ink-800 hover:text-danger-400">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {isOpen && (
                  <div className="bg-ink-950">
                    {section.lessons.map((lesson) => (
                      <LessonRow
                        key={lesson.id}
                        lesson={lesson}
                        onTogglePreview={() => handleTogglePreview(lesson)}
                        onDelete={() => handleDeleteLesson(lesson.id)}
                        onVideoUpload={(file) => handleVideoUpload(lesson, file)}
                        saving={saving}
                      />
                    ))}
                    <div className="border-t border-ink-800 px-4 py-2">
                      <button
                        onClick={() => handleAddLesson(section)}
                        disabled={saving}
                        className="flex items-center gap-2 font-mono text-xs text-signal-500 hover:text-signal-400 disabled:opacity-50"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add lesson
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function LessonRow({
  lesson,
  onTogglePreview,
  onDelete,
  onVideoUpload,
  saving,
}: {
  lesson: LessonAdmin;
  onTogglePreview: () => void;
  onDelete: () => void;
  onVideoUpload: (file: File) => void;
  saving: boolean;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  const statusColor: Record<string, string> = {
    DRAFT: "text-ink-500",
    UPLOADING: "text-signal-500",
    PROCESSING: "text-signal-400",
    READY: "text-teal-400",
    FAILED: "text-danger-400",
  };

  return (
    <div className="flex items-center justify-between gap-3 border-t border-ink-800 px-4 py-3 first:border-t-0">
      <div className="min-w-0">
        <p className="truncate text-sm text-paper-200">{lesson.title}</p>
        <div className="mt-1 flex items-center gap-3">
          <span className={cx("font-mono text-xs", statusColor[lesson.status])}>
            {lesson.status}
          </span>
          {lesson.videoUrl && (
            <a href={lesson.videoUrl} target="_blank" rel="noopener noreferrer" className="font-mono text-xs text-ink-500 hover:text-paper-200">
              view ↗
            </a>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <button
          onClick={onTogglePreview}
          disabled={saving}
          className={cx(
            "rounded px-2 py-1 font-mono text-xs transition-colors",
            lesson.isPreview
              ? "bg-teal-500/10 text-teal-400 hover:bg-teal-500/20"
              : "bg-ink-800 text-ink-500 hover:text-paper-200"
          )}
        >
          {lesson.isPreview ? "Preview" : "Set preview"}
        </button>

        {lesson.status !== "READY" && (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              disabled={saving}
              className="rounded p-1.5 text-ink-500 hover:bg-ink-800 hover:text-paper-200 disabled:opacity-50"
              title="Upload video"
            >
              <Upload className="h-4 w-4" />
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="video/mp4,video/webm"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onVideoUpload(file);
              }}
            />
          </>
        )}

        <button
          onClick={onDelete}
          disabled={saving}
          className="rounded p-1.5 text-ink-600 hover:bg-ink-800 hover:text-danger-400 disabled:opacity-50"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}