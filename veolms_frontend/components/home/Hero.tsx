"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { Button } from "@/components/ui/Button";
import { ArrowRight } from "lucide-react";

const SNIPPET = `function learn(skill) {
  return practice(skill)
    .until(confident);
}`;

export function Hero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.2 });

      const typeTarget = { i: 0 };
      tl.to(typeTarget, {
        i: SNIPPET.length,
        duration: 1.6,
        ease: "none",
        onUpdate: () => setTyped(SNIPPET.slice(0, Math.floor(typeTarget.i))),
      });

      tl.from(".hero-eyebrow", { opacity: 0, y: 10, duration: 0.5, ease: "power2.out" }, "-=0.3")
        .from(".hero-headline-line", { opacity: 0, y: 24, duration: 0.7, stagger: 0.08, ease: "power3.out" }, "-=0.2")
        .from(".hero-sub", { opacity: 0, y: 14, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .from(".hero-cta", { opacity: 0, y: 14, duration: 0.6, stagger: 0.08, ease: "power2.out" }, "-=0.45")
        .from(".hero-stat", { opacity: 0, y: 10, duration: 0.5, stagger: 0.06, ease: "power2.out" }, "-=0.3");
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative overflow-hidden border-b border-ink-700">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(255,157,46,0.08),transparent)]" />

      <div className="container-page relative grid gap-12 py-20 lg:grid-cols-[1.1fr,0.9fr] lg:py-28">
        <div>
          <p className="hero-eyebrow mb-4 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
            Practical courses for builders
          </p>

          <h1 className="font-display text-4xl font-bold leading-[1.08] tracking-tight text-paper-50 sm:text-5xl lg:text-6xl">
            <span className="hero-headline-line block">Stop watching tutorials.</span>
            <span className="hero-headline-line block">
              Start <span className="text-signal-500">building</span> things.
            </span>
          </h1>

          <p className="hero-sub mt-6 max-w-md text-balance text-base text-paper-200 sm:text-lg">
            HTML, CSS, JavaScript, React, Redux, and Node — taught by shipping real
            projects, not memorizing slides.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button href="/courses" size="lg" className="hero-cta">
              Browse courses <ArrowRight className="h-4 w-4" />
            </Button>
            <Button href="#how-it-works" variant="secondary" size="lg" className="hero-cta">
              How it works
            </Button>
          </div>

          <div className="mt-12 flex gap-8 border-t border-ink-700 pt-6 font-mono text-sm">
            <div className="hero-stat">
              <div className="text-2xl font-semibold text-paper-50">3+</div>
              <div className="text-ink-500">courses live</div>
            </div>
            <div className="hero-stat">
              <div className="text-2xl font-semibold text-paper-50">25+</div>
              <div className="text-ink-500">lessons</div>
            </div>
            <div className="hero-stat">
              <div className="text-2xl font-semibold text-paper-50">100%</div>
              <div className="text-ink-500">project-based</div>
            </div>
          </div>
        </div>

        <div className="flex items-center">
          <div className="w-full overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-card">
            <div className="flex items-center gap-1.5 border-b border-ink-700 bg-ink-800 px-4 py-2.5">
              <span className="h-2.5 w-2.5 rounded-full bg-danger-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-signal-500/70" />
              <span className="h-2.5 w-2.5 rounded-full bg-teal-500/70" />
              <span className="ml-2 font-mono text-xs text-ink-500">lesson-01.js</span>
            </div>
            <pre className="min-h-45 overflow-x-auto p-6 font-mono text-sm leading-relaxed text-paper-100 sm:text-base">
              <code>
                {typed}
                <span className="animate-pulse text-signal-500">▍</span>
              </code>
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}