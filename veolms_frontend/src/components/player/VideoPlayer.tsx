'use client';

import React, { useEffect, useRef, useState } from 'react';
import api from '@/lib/api';

interface VideoPlayerProps {
  lessonId?: string;
  videoUrl?: string | null;
  title?: string;
  onEnded?: () => void;
  autoPlay?: boolean;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
  lessonId,
  videoUrl,
  title,
  onEnded,
  autoPlay = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Sync progress every 10 seconds if lessonId is provided
  useEffect(() => {
    if (!lessonId || !videoRef.current) return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        const currentTime = Math.floor(videoRef.current.currentTime);
        const isCompleted =
          videoRef.current.duration > 0 &&
          currentTime >= videoRef.current.duration * 0.9;

        api.patch(`/dashboard/lesson/${lessonId}/progress`, {
          watchedSeconds: currentTime,
          completed: isCompleted,
        }).catch((err) => console.warn('Progress sync warning', err));
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [lessonId]);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const total = videoRef.current.duration;
      if (total > 0) {
        setProgress((current / total) * 100);
      }
    }
  };

  const handleVideoEnded = () => {
    if (lessonId && videoRef.current) {
      const currentTime = Math.floor(videoRef.current.currentTime);
      api.patch(`/dashboard/lesson/${lessonId}/progress`, {
        watchedSeconds: currentTime,
        completed: true,
      }).catch((err) => console.warn('Progress complete sync warning', err));
    }
    if (onEnded) onEnded();
  };

  const isExternalYouTube = videoUrl?.includes('youtube.com') || videoUrl?.includes('youtu.be');

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-2xl flex flex-col justify-center items-center">
      {videoUrl ? (
        isExternalYouTube ? (
          <iframe
            src={videoUrl.replace('watch?v=', 'embed/')}
            title={title || 'Lesson Video'}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <video
            ref={videoRef}
            src={videoUrl}
            controls
            autoPlay={autoPlay}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleVideoEnded}
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            className="w-full h-full object-contain"
          />
        )
      ) : (
        <div className="p-8 text-center flex flex-col items-center gap-3 text-slate-500">
          <div className="w-16 h-16 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-600">
            ▶
          </div>
          <span className="text-sm font-medium">No video attached to this lesson yet.</span>
        </div>
      )}
    </div>
  );
};
