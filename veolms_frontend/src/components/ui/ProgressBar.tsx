import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  progress: number; // 0 to 100
  showLabel?: boolean;
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ progress, showLabel = true, className }) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div className={cn('w-full flex flex-col gap-1.5', className)}>
      {showLabel && (
        <div className="flex justify-between items-center text-xs font-semibold">
          <span className="text-slate-400">Course Progress</span>
          <span className="text-indigo-400">{clampedProgress}%</span>
        </div>
      )}
      <div className="w-full h-2 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-400 rounded-full transition-all duration-500 ease-out shadow-sm shadow-indigo-500/50"
          style={{ width: `${clampedProgress}%` }}
        />
      </div>
    </div>
  );
};
