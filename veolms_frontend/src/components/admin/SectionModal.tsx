'use client';

import React, { useState, useEffect } from 'react';
import { Section } from '@/types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

interface SectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, orderIndex: number) => Promise<void>;
  initialData?: Section | null;
  defaultOrderIndex?: number;
}

export const SectionModal: React.FC<SectionModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  defaultOrderIndex = 1,
}) => {
  const [title, setTitle] = useState('');
  const [orderIndex, setOrderIndex] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setOrderIndex(initialData.orderIndex);
    } else {
      setTitle('');
      setOrderIndex(defaultOrderIndex);
    }
  }, [initialData, defaultOrderIndex, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    setLoading(true);
    setError(null);
    try {
      await onSubmit(title, orderIndex);
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error saving section');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={initialData ? 'Edit Section' : 'Add New Section'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {error && <div className="p-3 text-xs bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl">{error}</div>}
        <Input
          label="Section Title *"
          placeholder="e.g. Introduction to React & Setup"
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
        <Button variant="primary" size="md" type="submit" isLoading={loading} className="mt-2">
          {initialData ? 'Save Changes' : 'Create Section'}
        </Button>
      </form>
    </Modal>
  );
};
