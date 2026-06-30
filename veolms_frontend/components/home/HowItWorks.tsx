import { Reveal } from "@/components/ui/Reveal";

const steps = [
  { n: "01", title: "Pick a course", body: "Preview the curriculum and a few lessons free, before you pay for anything." },
  { n: "02", title: "Enroll securely", body: "Pay once via Razorpay. No subscriptions, no recurring charges." },
  { n: "03", title: "Build, don't just watch", body: "Every lesson ends in something you've actually shipped, not just notes." },
  { n: "04", title: "Track your progress", body: "Pick up exactly where you left off, on any device." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="rule container-page py-20">
      <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">Process</p>
      <h2 className="mb-12 font-display text-2xl font-bold tracking-tight text-paper-50 sm:text-3xl">
        How OpenLMS works
      </h2>

      <Reveal className="grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-ink-700 bg-ink-700 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((step) => (
          <div key={step.n} className="bg-ink-950 p-6">
            <span className="font-mono text-sm text-signal-500">{step.n}</span>
            <h3 className="mt-3 font-display text-lg font-semibold text-paper-50">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-500">{step.body}</p>
          </div>
        ))}
      </Reveal>
    </section>
  );
}