'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CourseCard } from '@/components/courses/CourseCard';
import { Course } from '@/types';
import api from '@/lib/api';
import { gsap } from '@/lib/gsap';
import { Sparkles, ArrowRight, Play, Video, ShieldCheck, Zap, Layers, Users, BookOpen } from 'lucide-react';

export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  useEffect(() => {
    // Fetch top 3 featured courses
    api.get('/courses?limit=3')
      .then((res) => setCourses(res.data.data || []))
      .catch((err) => console.warn('Fetch courses warning', err));
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });

      tl.fromTo(titleRef.current, { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
        .fromTo(subtitleRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 }, '-=0.4')
        .fromTo(ctaRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5 }, '-=0.3');

      // ScrollTrigger for features section
      if (featuresRef.current) {
        gsap.fromTo(
          featuresRef.current.children,
          { y: 50, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.6,
            stagger: 0.15,
            scrollTrigger: {
              trigger: featuresRef.current,
              start: 'top 80%',
            },
          }
        );
      }
    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={heroRef} className="relative overflow-hidden">
      {/* Background Glowing Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[400px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 text-center flex flex-col items-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400 animate-pulse" />
          <span>Next-Generation LMS for High Impact Learning</span>
        </div>

        <h1
          ref={titleRef}
          className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl leading-[1.1] text-gradient"
        >
          Master New Tech Skills with{' '}
          <span className="text-gradient-primary">Minimalistic Elegance</span>
        </h1>

        <p
          ref={subtitleRef}
          className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl font-normal leading-relaxed"
        >
          Create, manage, and deliver HD video courses with presigned R2 storage, interactive progress tracking, and effortless admin controls.
        </p>

        <div ref={ctaRef} className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Link href="/courses">
            <Button size="lg" variant="primary" icon={<ArrowRight className="w-5 h-5" />}>
              Explore All Courses
            </Button>
          </Link>
          <Link href="/login">
            <Button size="lg" variant="glass" icon={<Play className="w-5 h-5" />}>
              Try Demo Accounts
            </Button>
          </Link>
        </div>

        {/* Stats Grid */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-800">
            <span className="text-3xl font-extrabold text-indigo-400">100%</span>
            <span className="block text-xs text-slate-400 mt-1">Presigned R2 Video Delivery</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-800">
            <span className="text-3xl font-extrabold text-cyan-400">4K HD</span>
            <span className="block text-xs text-slate-400 mt-1">Direct Media Streaming</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-800">
            <span className="text-3xl font-extrabold text-purple-400">0.1s</span>
            <span className="block text-xs text-slate-400 mt-1">Real-Time Progress Auto Sync</span>
          </div>
          <div className="glass-panel p-5 rounded-2xl text-center border-slate-800">
            <span className="text-3xl font-extrabold text-emerald-400">Razorpay</span>
            <span className="block text-xs text-slate-400 mt-1">Integrated Secure Checkout</span>
          </div>
        </div>
      </section>

      {/* Feature Highlights Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800/80">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-slate-100">Engineered for Students & Admins</h2>
          <p className="text-sm text-slate-400 mt-2">Everything you need to publish world-class course curriculum.</p>
        </div>

        <div ref={featuresRef} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Video className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Direct Video Presigned Uploads</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admins can upload high-capacity video lectures directly to cloud storage via secure AWS/R2 presigned URLs.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Layers className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Curriculum & Section Builder</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Organize topics with ordered sections and lessons. Set free sample preview lectures for prospective students.
            </p>
          </Card>

          <Card className="flex flex-col gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100">Automated Progress Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Seamlessly record student watch time, auto-sync position, and track section completion percentages in real time.
            </p>
          </Card>
        </div>
      </section>

      {/* Featured Courses Showcase */}
      {courses.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
          <div className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-2xl font-extrabold text-slate-100">Featured Courses</h2>
              <p className="text-xs text-slate-400 mt-1">Start learning from expert instructors today.</p>
            </div>
            <Link href="/courses">
              <Button variant="ghost" size="sm" icon={<ArrowRight className="w-4 h-4" />}>
                View All Courses
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Bottom Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="glass-panel p-10 sm:p-14 rounded-3xl border border-indigo-500/30 text-center relative overflow-hidden bg-gradient-to-r from-indigo-950/60 via-slate-900/80 to-purple-950/60">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100">Ready to Publish or Learn?</h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl mx-auto">
            Join OpenLMS today to experience modern learning and administrative management.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" variant="primary">
                Create Free Account
              </Button>
            </Link>
            <Link href="/courses">
              <Button size="lg" variant="outline">
                Browse Catalog
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
