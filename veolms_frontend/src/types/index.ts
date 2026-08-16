export type Role = 'STUDENT' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
}

export type LessonStatus = 'DRAFT' | 'UPLOADING' | 'PROCESSING' | 'READY' | 'FAILED';

export interface Lesson {
  id: string;
  sectionId: string;
  title: string;
  videoUrl?: string | null;
  status: LessonStatus;
  durationSeconds?: number | null;
  isPreview: boolean;
  orderIndex: number;
  hasAccess?: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  thumbnailUrl?: string | null;
  trailerVideoUrl?: string | null;
  price: number;
  instructorName: string;
  isPublished: boolean;
  createdAt: string;
  sections?: Section[];
  isEnrolled?: boolean;
}

export interface StudentProgressItem {
  id: string;
  title: string;
  slug: string;
  thumbnailUrl?: string | null;
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
    durationSeconds?: number | null;
    section: {
      course: {
        id: string;
        title: string;
        slug: string;
        thumbnailUrl?: string | null;
      };
    };
  };
}

export interface Student {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  enrolledCourseCount: number;
}

export interface EnrollmentRecord {
  id: string;
  enrolledAt: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
  course: {
    id: string;
    title: string;
    slug: string;
  };
  payment?: {
    amount: number;
    currency: string;
    status: string;
    provider: string;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data: T;
  error?: any;
}
