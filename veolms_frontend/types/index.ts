export type Role = "STUDENT" | "ADMIN";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface CourseSummary {
  id: string;
  title: string;
  slug: string;
  price: number;
  instructorName: string;
  isPublished: boolean;
  createdAt: string;
  thumbnailUrl: string | null;
  description: string | null;
  trailerVideoUrl: string | null;
}

export interface LessonPublic {
  id: string;
  title: string;
  durationSeconds: number | null;
  isPreview: boolean;
  orderIndex: number;
  hasAccess: boolean;
}

export interface SectionPublic {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonPublic[];
}

export interface CourseDetail extends CourseSummary {
  sections: SectionPublic[];
}

export type LessonStatus = "DRAFT" | "UPLOADING" | "PROCESSING" | "READY" | "FAILED";

export interface LessonAdmin {
  id: string;
  title: string;
  videoUrl: string | null;
  status: LessonStatus;
  durationSeconds: number | null;
  isPreview: boolean;
  orderIndex: number;
}

export interface SectionAdmin {
  id: string;
  title: string;
  orderIndex: number;
  lessons: LessonAdmin[];
}

export interface CourseAdminDetail extends CourseSummary {
  sections: SectionAdmin[];
}

export interface LessonVideo {
  videoUrl: string;
  type: "external" | "signed";
  expiresIn?: number;
}

export interface MyCourseProgress {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl: string | null;
  enrolledAt: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
}

export interface ContinueLearningItem {
  watchedSeconds: number;
  lastWatchedAt: string;
  lesson: {
    id: string;
    title: string;
    durationSeconds: number | null;
    section: {
      course: { id: string; title: string; slug: string; thumbnailUrl: string | null };
    };
  };
}