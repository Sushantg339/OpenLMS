"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
  stagger?: number;
}

export function Reveal({ children, className, stagger = 0.08 }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const ctx = gsap.context(() => {
      const targets = ref.current!.children;
      gsap.from(targets, {
        opacity: 0,
        y: 28,
        duration: 0.6,
        stagger,
        ease: "power2.out",
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%",
          once: true,
        },
      });
    }, ref);

    return () => ctx.revert();
  }, [stagger]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}