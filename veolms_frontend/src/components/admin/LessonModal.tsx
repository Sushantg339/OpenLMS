'use client';

import React, { useState, useEffect } from 'react';
import { Lesson } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface LessonModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { title: string; orderIndex: number; isPreview: boolean; videoUrl?: string }) => Promise<void>;
  initialData?: Lesson | null;
  defaultOrderIndex?: number;
}

export const LessonModal: React.FC<LessonModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultOrderIndex = 1,
}) => {
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [isPreview, setIsPreview] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setOrderIndex(initialData.orderIndex);
      setIsPreview(initialData.isPreview);
      setVideoUrl(initialData.videoUrl || '');
    } else {
      setTitle('');
      setOrderIndex(defaultOrderIndex);
      setIsPreview(false);
      setVideoUrl('');
    }
  }, [initialData, defaultOrderIndex, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit({
        title,
        orderIndex,
        isPreview,
        videoUrl: videoUrl.trim() || undefined,
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error saving lesson');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Lesson' : 'Add New Lesson'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">{error}</div>}

        <Input
          label="Lesson Title *"
          placeholder="e.g. Setting up Next.js App Router"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <Input
          label="Order Position Index *"
          type="number"
          value={orderIndex}
          onChange={(e) => setOrderIndex(parseInt(e.target.value, 10) || 1)}
          required
        />

        <Input
          label="External Video URL (Optional)"
          placeholder="e.g. https://www.youtube.com/watch?v=..."
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          helperText="Direct binary videos can also be uploaded via the presigned uploader."
        />

        <div className="flex items-center gap-3 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
          <input
            type="checkbox"
            id="isPreview"
            checked={isPreview}
            onChange={(e) => setIsPreview(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="isPreview" className="text-sm font-medium text-slate-200 cursor-pointer">
            Free Sample Preview (accessible without purchasing course)
          </label>
        </div>

        <Button variant="primary" size="md" type="submit" isLoading={loading} className="mt-2">
          {initialData ? 'Save Changes' : 'Create Lesson'}
        </Button>
      </form>
    </Modal>
  );
};
