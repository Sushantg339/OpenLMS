import { api, type ApiEnvelope } from "../api-client";
import type { CourseDetail, CourseSummary, LessonVideo } from "@/types";

export const courseService = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiEnvelope<CourseSummary[]>>("/courses", { params }).then((r) => r.data.data),

  getBySlug: (slug: string) =>
    api.get<ApiEnvelope<CourseDetail>>(`/courses/${slug}`).then((r) => r.data.data),

  getLessonVideo: (lessonId: string) =>
    api.get<ApiEnvelope<LessonVideo>>(`/lessons/${lessonId}/video`).then((r) => r.data.data),

  updateLessonProgress: (lessonId: string, data: { watchedSeconds: number; completed?: boolean }) =>
    api.patch(`/lessons/${lessonId}/progress`, data),
};