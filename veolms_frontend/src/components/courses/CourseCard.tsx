'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Course } from '@/types';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { formatPrice } from '@/lib/utils';
import { PlayCircle, Clock, UserCheck, ChevronRight } from 'lucide-react';

interface CourseCardProps {
  course: Course;
  isAdminView?: boolean;
  onDelete?: (id: string) => void;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course, isAdminView = false, onDelete }) => {
  const defaultThumbnail = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&q=80';

  return (
    <Card className="flex flex-col justify-between h-full group border-slate-800/80 hover:border-indigo-500/40">
      <div>
        {/* Thumbnail Container */}
        <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 bg-slate-900">
          <img
            src={course.thumbnailUrl || defaultThumbnail}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-80" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex gap-2">
            {course.isPublished ? (
              <Badge variant="emerald">Published</Badge>
            ) : (
              <Badge variant="amber">Draft</Badge>
            )}
          </div>

          <div className="absolute bottom-3 right-3 text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-white">
            {formatPrice(course.price)}
          </div>
        </div>

        {/* Course Info */}
        <div className="flex flex-col gap-2 mb-4">
          <h3 className="font-bold text-lg text-slate-100 line-clamp-1 group-hover:text-indigo-400 transition-colors">
            {course.title}
          </h3>
          <p className="text-xs text-slate-400 line-clamp-2 min-h-[32px]">
            {course.description || 'Master modern skills with hands-on projects and step-by-step guidance.'}
          </p>

          <div className="flex items-center gap-2 text-xs text-slate-400 mt-2">
            <span className="flex items-center gap-1 font-medium text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              {course.instructorName}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
        {isAdminView ? (
          <div className="flex items-center justify-between w-full gap-2">
            <Link href={`/admin/courses/${course.id}`} className="flex-1">
              <Button variant="glass" size="sm" className="w-full">
                Edit & Curriculum
              </Button>
            </Link>
            {onDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(course.id)}
              >
                Unpublish
              </Button>
            )}
          </div>
        ) : (
          <Link href={`/courses/${course.slug}`} className="w-full">
            <Button
              variant="primary"
              size="sm"
              className="w-full flex items-center justify-between"
              icon={<ChevronRight className="w-4 h-4" />}
            >
              View Course
            </Button>
          </Link>
        )}
      </div>
    </Card>
  );
};
