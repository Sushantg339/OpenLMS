"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { adminService } from "@/lib/services/admin.service";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ApiRequestError } from "@/lib/api-client";

export default function NewCoursePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    slug: "",
    price: "",
    instructorName: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      // auto-generate slug from title
      ...(name === "title" && !form.slug
        ? { slug: value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") }
        : {}),
    }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.slug || !form.price || !form.instructorName) {
      setError("Title, slug, price, and instructor name are required.");
      return;
    }

    const priceNum = Math.round(parseFloat(form.price) * 100);
    if (isNaN(priceNum) || priceNum < 0) {
      setError("Price must be a valid number in rupees (e.g. 499).");
      return;
    }

    setLoading(true);
    try {
      const course = await adminService.createCourse({
        title: form.title,
        slug: form.slug,
        price: priceNum,
        instructorName: form.instructorName,
        ...(form.description && { description: form.description }),
      });
      router.push(`/admin/courses/${course.id}`);
    } catch (err) {
      if (err instanceof ApiRequestError) setError(err.message);
      else setError("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl">
      <div className="mb-6">
        <p className="mb-1 font-mono text-xs uppercase tracking-[0.2em] text-signal-500">
          Admin · Courses
        </p>
        <h1 className="font-display text-2xl font-bold text-paper-50">New course</h1>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input label="Title" name="title" value={form.title} onChange={handleChange} placeholder="React from Scratch" required />
        <Input label="Slug" name="slug" value={form.slug} onChange={handleChange} placeholder="react-from-scratch" required />
        <Input label="Instructor name" name="instructorName" value={form.instructorName} onChange={handleChange} placeholder="Anurag Singh" required />
        <Input label="Price (₹ in rupees)" name="price" type="number" min="0" step="1" value={form.price} onChange={handleChange} placeholder="499" required />

        <div className="flex flex-col gap-1.5">
          <label className="font-mono text-xs uppercase tracking-wide text-ink-500">
            Description (optional)
          </label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={4}
            placeholder="What will students learn?"
            className="rounded border border-ink-700 bg-ink-900 px-4 py-2.5 text-sm text-paper-100 placeholder:text-ink-600 focus:border-signal-500 focus:outline-none"
          />
        </div>

        {error && (
          <p className="rounded border border-danger-500/30 bg-danger-500/10 px-3 py-2 font-mono text-xs text-danger-400">
            {error}
          </p>
        )}

        <div className="flex gap-3 pt-2">
          <Button type="submit" disabled={loading}>
            {loading ? "Creating…" : "Create course"}
          </Button>
          <Button href="/admin/courses" variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}