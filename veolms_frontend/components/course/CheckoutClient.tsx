"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { PlayCircle, ShieldCheck } from "lucide-react";
import type { CourseDetail } from "@/types";
import { formatPrice, lessonCount, totalCourseDuration } from "@/lib/format";
import { paymentService } from "@/lib/services/payment.service";
import { loadRazorpayScript } from "@/lib/razorpay";
import { Button } from "@/components/ui/Button";
import { ApiRequestError } from "@/lib/api-client";

interface CheckoutClientProps {
  course: CourseDetail;
}

export function CheckoutClient({ course }: CheckoutClientProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalLessons = lessonCount(course.sections);
  const totalDuration = totalCourseDuration(course.sections);

  const handlePay = async () => {
    setLoading(true);
    setError("");

    try {
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setError("Could not load payment gateway. Check your internet connection and try again.");
        setLoading(false);
        return;
      }

      // Step 1: ask our backend to create a Razorpay order
      const order = await paymentService.createOrder(course.id);

      // Step 2: open Razorpay Checkout with that order
      const options = {
        key: order.keyId,
        amount: order.amount,
        currency: order.currency,
        name: "VeoLMS",
        description: course.title,
        order_id: order.orderId,

        // Step 3: on payment success, Razorpay gives us three values.
        // We send all three to our backend — which re-verifies the HMAC
        // signature itself before creating the enrollment.
        handler: async (response: {
          razorpay_payment_id: string;
          razorpay_order_id: string;
          razorpay_signature: string;
        }) => {
          try {
            await paymentService.verify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            // Verified — redirect to the first lesson
            const firstLesson = course.sections[0]?.lessons[0];
            if (firstLesson) {
              router.push(`/learn/${firstLesson.id}`);
            } else {
              router.push("/dashboard");
            }
          } catch {
            setError("Payment verification failed. Please contact support if money was deducted.");
          }
        },

        prefill: { name: "", email: "" },
        theme: { color: "#FF9D2E" },

        modal: {
          ondismiss: () => setLoading(false),
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (err) {
      if (err instanceof ApiRequestError) {
        setError(err.message);
      } else {
        setError("Something went wrong. Please try again.");
      }
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="overflow-hidden rounded-lg border border-ink-700 bg-ink-900 shadow-card">
        <div className="relative aspect-video bg-ink-800">
          {course.thumbnailUrl ? (
            <Image src={course.thumbnailUrl} alt="" fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-700">
              <PlayCircle className="h-10 w-10" />
            </div>
          )}
        </div>

        <div className="p-6">
          <h1 className="font-display text-xl font-bold leading-snug text-paper-50">
            {course.title}
          </h1>
          <p className="mt-1 font-mono text-sm text-ink-500">
            {course.instructorName} · {totalLessons} lessons · {totalDuration}
          </p>

          <div className="my-6 rule" />

          <div className="mb-5 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold text-paper-50">
              {formatPrice(course.price)}
            </span>
            <span className="text-sm text-ink-500">one-time payment</span>
          </div>

          {error && (
            <p className="mb-4 rounded border border-danger-500/30 bg-danger-500/10 px-3 py-2 font-mono text-xs text-danger-400">
              {error}
            </p>
          )}

          <Button onClick={handlePay} disabled={loading} size="lg" className="w-full">
            {loading ? "Opening payment…" : `Pay ${formatPrice(course.price)}`}
          </Button>

          <p className="mt-4 flex items-center justify-center gap-1.5 font-mono text-xs text-ink-500">
            <ShieldCheck className="h-3.5 w-3.5 text-teal-500" />
            Secured by Razorpay · Test mode
          </p>
        </div>
      </div>

      <Button
        href={`/courses/${course.slug}`}
        variant="ghost"
        size="sm"
        className="mt-4 w-full"
      >
        ← Back to course
      </Button>
    </div>
  );
}