"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

export function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const copyRef = useRef<HTMLParagraphElement | null>(null);
  const orbRef = useRef<HTMLDivElement | null>(null);
  const barRef = useRef<HTMLDivElement | null>(null);
  const pillRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: onFinish,
      });

      gsap.set(overlayRef.current, { opacity: 1, visibility: "visible" });
      gsap.set([titleRef.current, copyRef.current, orbRef.current, barRef.current, pillRef.current], {
        opacity: 0,
        y: 24,
        scale: 0.96,
      });

      tl.fromTo(
        titleRef.current,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
      );
      tl.fromTo(
        copyRef.current,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8 },
        "-=0.45",
      );
      tl.fromTo(
        orbRef.current,
        { scale: 0.7, rotation: -180, opacity: 0 },
        { scale: 1, rotation: 0, opacity: 1, duration: 1.05, ease: "power4.out" },
        "-=0.35",
      );
      tl.fromTo(
        barRef.current,
        { scaleX: 0, opacity: 0 },
        { scaleX: 1, opacity: 1, duration: 1.15, ease: "power2.inOut" },
        "-=0.6",
      );
      tl.fromTo(
        pillRef.current,
        { width: 0, opacity: 0 },
        { width: "100%", opacity: 1, duration: 0.75 },
        "-=0.4",
      );
      tl.to(overlayRef.current, { opacity: 0, duration: 0.6, ease: "power2.inOut", delay: 0.25 });
    }, overlayRef);

    return () => ctx.revert();
  }, [onFinish]);

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-100 flex items-center justify-center overflow-hidden bg-[#050816] opacity-100"
      aria-hidden="true"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,157,46,0.24),transparent_45%)]" />
      <div className="absolute inset-0 opacity-20 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-size-[40px_40px]" />

      <div className="relative z-10 flex flex-col items-center text-center">
        <div
          ref={orbRef}
          className="mb-8 flex h-28 w-28 items-center justify-center rounded-full border border-white/15 bg-white/10 shadow-[0_0_80px_rgba(255,157,46,0.18)] backdrop-blur-xl"
        >
          <div className="absolute h-20 w-20 rounded-full border border-orange-400/40" />
          <div className="h-14 w-14 rounded-full border-[3px] border-orange-400 border-t-transparent animate-[spin_1.2s_linear_infinite]" />
        </div>

        <h1 ref={titleRef} className="text-4xl font-semibold tracking-[0.35em] text-white sm:text-5xl">
          <span className="text-orange-400">OPEN</span>LMS
        </h1>

        <p ref={copyRef} className="mt-4 max-w-sm text-sm uppercase tracking-[0.35em] text-slate-400 sm:text-base">
          Crafting your next lesson
        </p>

        <div className="mt-8 h-1.5 w-64 overflow-hidden rounded-full bg-white/10">
          <div ref={barRef} className="h-full w-full origin-left scale-x-0 rounded-full bg-linear-to-r from-orange-500 via-amber-400 to-white" />
        </div>

        <div
          ref={pillRef}
          className="mt-4 rounded-full border border-white/10 px-4 py-2 text-[10px] uppercase tracking-[0.4em] text-slate-400 backdrop-blur"
        >
          Loading experience
        </div>
      </div>
    </div>
  );
}
