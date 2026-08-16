'use client';

import React, { useState } from 'react';
import { Course } from '@/types';
import { Input, TextArea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface CourseFormProps {
  initialValues?: Partial<Course>;
  onSubmit: (data: any) => Promise<void>;
  isLoading?: boolean;
}

export const CourseForm: React.FC<CourseFormProps> = ({
  initialValues,
  onSubmit,
  isLoading = false,
}) => {
  const [title, setTitle] = useState(initialValues?.title || '');
  const [slug, setSlug] = useState(initialValues?.slug || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [price, setPrice] = useState(initialValues?.price?.toString() || '4999');
  const [instructorName, setInstructorName] = useState(initialValues?.instructorName || '');
  const [isPublished, setIsPublished] = useState(initialValues?.isPublished || false);
  const [error, setError] = useState<string | null>(null);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTitle(val);
    if (!initialValues) {
      // Auto-generate slug
      const generatedSlug = val
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!title || !slug || !price || !instructorName) {
      setError('Please fill in all required fields.');
      return;
    }
    try {
      await onSubmit({
        title,
        slug,
        description,
        price: parseInt(price, 10),
        instructorName,
        isPublished,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to save course');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">{error}</div>}

      <Input
        label="Course Title *"
        placeholder="e.g. Full-Stack Web Development Bootcamp"
        value={title}
        onChange={handleTitleChange}
        required
      />

      <Input
        label="Course Slug *"
        placeholder="e.g. fullstack-web-dev"
        value={slug}
        onChange={(e) => setSlug(e.target.value)}
        required
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Price (INR ₹) *"
          type="number"
          placeholder="4999"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          required
        />
        <Input
          label="Instructor Name *"
          placeholder="e.g. Alex Rivera"
          value={instructorName}
          onChange={(e) => setInstructorName(e.target.value)}
          required
        />
      </div>

      <TextArea
        label="Course Description"
        placeholder="Describe what students will learn in this course..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        rows={4}
      />

      <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
        <input
          type="checkbox"
          id="isPublished"
          checked={isPublished}
          onChange={(e) => setIsPublished(e.target.checked)}
          className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPublished" className="text-sm font-medium text-slate-200 cursor-pointer">
          Publish immediately (make visible in public course catalog)
        </label>
      </div>

      <Button variant="primary" size="lg" type="submit" isLoading={isLoading} className="mt-2">
        {initialValues ? 'Update Course Details' : 'Create Course'}
      </Button>
    </form>
  );
};
