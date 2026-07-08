import { api, type ApiEnvelope } from "../api-client";
import type { CourseAdminDetail, CourseSummary } from "@/types";

export const adminService = {
  // Courses
  listCourses: () =>
    api.get<ApiEnvelope<CourseSummary[]>>("/courses/admin").then((r) => r.data.data),

  getCourseById: (id: string) =>
    api.get<ApiEnvelope<CourseAdminDetail>>(`/courses/admin/${id}`).then((r) => r.data.data),

  createCourse: (data: {
    title: string;
    slug: string;
    price: number;
    instructorName: string;
    description?: string;
  }) => api.post<ApiEnvelope<CourseSummary>>("/courses", data).then((r) => r.data.data),

  updateCourse: (id: string, data: Partial<{
    title: string;
    price: number;
    instructorName: string;
    description: string;
    isPublished: boolean;
  }>) => api.patch(`/courses/${id}`, data).then((r) => r.data.data),

  deleteCourse: (id: string) =>
    api.delete(`/courses/${id}`).then((r) => r.data),

  uploadThumbnail: (courseId: string, file: File) => {
    const form = new FormData();
    form.append("thumbnail", file);
    return api.post(`/courses/${courseId}/thumbnail`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  uploadTrailer: (courseId: string, file: File) => {
    const form = new FormData();
    form.append("trailer", file);
    return api.post(`/courses/${courseId}/trailer`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    }).then((r) => r.data.data);
  },

  // Sections
  createSection: (courseId: string, data: { title: string; orderIndex: number }) =>
    api.post(`/courses/${courseId}/sections`, data).then((r) => r.data.data),

  updateSection: (id: string, data: { title?: string; orderIndex?: number }) =>
    api.patch(`/sections/${id}`, data).then((r) => r.data.data),

  deleteSection: (id: string) =>
    api.delete(`/sections/${id}`).then((r) => r.data),

  // Lessons
  createLesson: (
    sectionId: string,
    data: { title: string; orderIndex: number; isPreview?: boolean; videoUrl?: string }
  ) => api.post(`/sections/${sectionId}/lessons`, data).then((r) => r.data.data),

  updateLesson: (
    id: string,
    data: Partial<{ title: string; isPreview: boolean; orderIndex: number; videoUrl: string }>
  ) => api.patch(`/lessons/${id}`, data).then((r) => r.data.data),

  deleteLesson: (id: string) =>
    api.delete(`/lessons/${id}`).then((r) => r.data),

  requestUploadUrl: (lessonId: string, data: { fileName: string; contentType: string }) =>
    api.post(`/lessons/${lessonId}/video/upload-url`, data).then((r) => r.data.data),

  confirmUpload: (lessonId: string) =>
    api.post(`/lessons/${lessonId}/video/confirm`).then((r) => r.data.data),

  // Students & Enrollments
  listStudents: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get("/admin/students", { params }).then((r) => r.data.data),

  getStudent: (id: string) =>
    api.get(`/admin/students/${id}`).then((r) => r.data.data),

  listEnrollments: (params?: { page?: number; limit?: number; courseId?: string }) =>
    api.get("/admin/enrollments", { params }).then((r) => r.data.data),
};