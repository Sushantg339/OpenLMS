'use client';

import React, { useState } from 'react';
import axios from 'axios';
import api from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { UploadCloud, CheckCircle2, Film, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface DirectVideoUploaderProps {
  entityId: string;
  type: 'lesson-video' | 'course-thumbnail' | 'course-trailer';
  onSuccess?: () => void;
  label?: string;
}

export const DirectVideoUploader: React.FC<DirectVideoUploaderProps> = ({
  entityId,
  type,
  onSuccess,
  label,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [completed, setCompleted] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
      setCompleted(false);
      setProgress(0);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError(null);
    setProgress(0);

    try {
      if (type === 'lesson-video') {
        // 1. Request presigned upload URL from backend
        const res = await api.post(`/lessons/${entityId}/video/upload-url`, {
          fileName: file.name,
          contentType: file.type || 'video/mp4',
        });
        const { uploadUrl } = res.data.data;

        // 2. Direct binary upload to R2 presigned URL
        await axios.put(uploadUrl, file, {
          headers: { 'Content-Type': file.type || 'video/mp4' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        });

        // 3. Confirm upload with backend
        await api.post(`/lessons/${entityId}/video/confirm`);
      } else if (type === 'course-thumbnail') {
        const formData = new FormData();
        formData.append('thumbnail', file);
        await api.post(`/courses/${entityId}/thumbnail`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        });
      } else if (type === 'course-trailer') {
        const formData = new FormData();
        formData.append('trailer', file);
        await api.post(`/courses/${entityId}/trailer`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setProgress(percent);
            }
          },
        });
      }

      setCompleted(true);
      if (onSuccess) onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Media upload failed');
    } finally {
      setUploading(false);
    }
  };

  const isVideo = type === 'lesson-video' || type === 'course-trailer';

  return (
    <div className="glass-panel p-4 rounded-xl border-slate-800 flex flex-col gap-3">
      <div className="flex justify-between items-center">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
          {isVideo ? <Film className="w-4 h-4 text-indigo-400" /> : <ImageIcon className="w-4 h-4 text-cyan-400" />}
          {label || (isVideo ? 'Upload Video File (.mp4 / .webm)' : 'Upload Thumbnail Image')}
        </span>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="file"
          accept={isVideo ? 'video/mp4,video/webm' : 'image/*'}
          onChange={handleFileChange}
          disabled={uploading}
          className="text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-300 hover:file:bg-slate-700 cursor-pointer"
        />

        {file && !completed && (
          <Button
            variant="glass"
            size="sm"
            onClick={handleUpload}
            isLoading={uploading}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Start Upload
          </Button>
        )}
      </div>

      {uploading && <ProgressBar progress={progress} showLabel />}

      {completed && (
        <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5 bg-emerald-500/10 p-2 rounded-lg border border-emerald-500/20">
          <CheckCircle2 className="w-4 h-4" />
          Media successfully uploaded & attached!
        </div>
      )}

      {error && (
        <div className="text-xs text-rose-400 font-medium flex items-center gap-1.5 bg-rose-500/10 p-2 rounded-lg border border-rose-500/20">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};
