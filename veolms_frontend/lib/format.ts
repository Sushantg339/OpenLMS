export function formatPrice(paise: number): string {
  const rupees = paise / 100;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(rupees);
}

export function formatDuration(seconds: number | null): string {
  if (!seconds) return "—";
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function totalCourseDuration(
  sections: { lessons: { durationSeconds: number | null }[] }[]
): string {
  const total = sections
    .flatMap((s) => s.lessons)
    .reduce((sum, l) => sum + (l.durationSeconds ?? 0), 0);
  return formatDuration(total);
}

export function lessonCount(sections: { lessons: unknown[] }[]): number {
  return sections.reduce((sum, s) => sum + s.lessons.length, 0);
}

export function cx(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}