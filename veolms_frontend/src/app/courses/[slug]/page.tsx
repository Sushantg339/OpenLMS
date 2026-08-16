'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Course, Lesson } from '@/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CurriculumAccordion } from '@/components/courses/CurriculumAccordion';
import { CheckoutModal } from '@/components/courses/CheckoutModal';
import { VideoPlayer } from '@/components/player/VideoPlayer';
import { Modal } from '@/components/ui/Modal';
import { formatPrice } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import api from '@/lib/api';
import { PlayCircle, ShieldCheck, User, Clock, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [previewLesson, setPreviewLesson] = useState<Lesson | null>(null);
  const [previewVideoUrl, setPreviewVideoUrl] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/courses/${slug}`);
        setCourse(res.data.data);
      } catch (err) {
        console.error('Fetch course details error', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  const handleSelectPreview = async (lesson: Lesson) => {
    setPreviewLesson(lesson);
    try {
      const res = await api.get(`/lessons/${lesson.id}/video`);
      setPreviewVideoUrl(res.data.data.videoUrl);
    } catch (err) {
      console.warn('Error fetching preview video URL', err);
      setPreviewVideoUrl(lesson.videoUrl || null);
    }
  };

  const handleEnrollClick = () => {
    if (!user) {
      router.push('/login');
      return;
    }
    setShowCheckout(true);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <span className="text-sm text-slate-400">Loading course curriculum...</span>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold text-slate-200">Course Not Found</h2>
        <p className="text-xs text-slate-400 mt-2 mb-6">The requested course could not be found.</p>
        <Link href="/courses">
          <Button variant="primary">Back to Catalog</Button>
        </Link>
      </div>
    );
  }

  const isAlreadyEnrolled = course.isEnrolled || user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/courses" className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-indigo-400 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Courses
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Title, Description, Trailer, Curriculum */}
        <div className="lg:col-span-2 flex flex-col gap-8">
          <div>
            <div className="flex gap-2 mb-3">
              <Badge variant="indigo">Course</Badge>
              {course.isPublished && <Badge variant="emerald">Verified</Badge>}
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-100">{course.title}</h1>
            <p className="text-sm text-slate-400 mt-3 leading-relaxed">
              {course.description || 'Comprehensive step-by-step masterclass with real-world projects.'}
            </p>

            <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-800/80 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-indigo-400" />
                <span>Instructor: <strong className="text-slate-100">{course.instructorName}</strong></span>
              </div>
            </div>
          </div>

          {/* Trailer Player Section if available */}
          {course.trailerVideoUrl && (
            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <PlayCircle className="w-4 h-4 text-indigo-400" />
                Course Trailer Preview
              </span>
              <VideoPlayer videoUrl={course.trailerVideoUrl} title={`${course.title} Trailer`} />
            </div>
          )}

          {/* Curriculum Section */}
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-bold text-slate-100">Course Curriculum</h2>
            <CurriculumAccordion
              sections={course.sections || []}
              onSelectPreviewLesson={handleSelectPreview}
              isEnrolled={isAlreadyEnrolled}
            />
          </div>
        </div>

        {/* Right Col: Purchase / Enrollment Card */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24 border-slate-800 shadow-2xl p-6 flex flex-col gap-6">
            {course.thumbnailUrl && (
              <div className="w-full h-44 rounded-xl overflow-hidden bg-slate-900">
                <img src={course.thumbnailUrl} alt={course.title} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase text-slate-400 font-semibold">Total Tuition</span>
              <span className="text-3xl font-extrabold text-indigo-400">{formatPrice(course.price)}</span>
            </div>

            {isAlreadyEnrolled ? (
              <div className="flex flex-col gap-3">
                <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  You own access to this course!
                </div>
                <Link href={`/dashboard/learn/${course.slug}`}>
                  <Button variant="primary" size="lg" className="w-full">
                    Open Learning Portal
                  </Button>
                </Link>
              </div>
            ) : (
              <Button
                variant="primary"
                size="lg"
                onClick={handleEnrollClick}
                icon={<Zap className="w-5 h-5 fill-current" />}
                className="w-full"
              >
                Enroll Now ({formatPrice(course.price)})
              </Button>
            )}

            <div className="flex flex-col gap-2 pt-4 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-indigo-400" />
                <span>Instant access to HD video streams</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Completion progress tracking & certificate</span>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Free Lesson Preview Modal */}
      <Modal
        isOpen={!!previewLesson}
        onClose={() => {
          setPreviewLesson(null);
          setPreviewVideoUrl(null);
        }}
        title={`Free Sample Preview: ${previewLesson?.title}`}
        maxWidth="xl"
      >
        <div className="flex flex-col gap-4">
          <VideoPlayer videoUrl={previewVideoUrl} title={previewLesson?.title} autoPlay />
          <p className="text-xs text-slate-400">
            This is a free sample preview lecture. Purchase full course for lifetime access to all sections.
          </p>
        </div>
      </Modal>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        course={course}
      />
    </div>
  );
}
